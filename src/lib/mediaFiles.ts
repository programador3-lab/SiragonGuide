export type MediaType = "image" | "video";

const imageExtensions = [".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"];
const videoExtensions = [".m4v", ".mov", ".mp4", ".webm"];
const maxImageUploadBytes = 3.5 * 1024 * 1024;
const imageOutputType = "image/webp";
const imageResizeAttempts = [
  { maxDimension: 1920, quality: 0.82 },
  { maxDimension: 1600, quality: 0.76 },
  { maxDimension: 1280, quality: 0.7 },
  { maxDimension: 1024, quality: 0.64 },
];

export const mediaAccept = "image/*,video/*,.png,.jpg,.jpeg,.webp,.gif,.mp4,.mov,.m4v,.webm";
export const imageAccept = "image/*,.png,.jpg,.jpeg,.webp,.gif";

export const getMediaType = (file: File): MediaType | null => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";

  const lowerName = file.name.toLowerCase();
  if (imageExtensions.some((extension) => lowerName.endsWith(extension))) return "image";
  if (videoExtensions.some((extension) => lowerName.endsWith(extension))) return "video";

  return null;
};

const getCompressedImageName = (name: string) => name.replace(/\.[^.]+$/, "") + ".webp";

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`No se pudo leer la imagen ${file.name}`));
    };
    image.src = objectUrl;
  });

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("No se pudo optimizar la imagen."));
      },
      imageOutputType,
      quality
    );
  });

const resizeImage = async (file: File, maxDimension: number, quality: number) => {
  const image = await loadImage(file);
  const ratio = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("El navegador no pudo preparar la imagen para subir.");
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  return canvasToBlob(canvas, quality);
};

export const prepareMediaFileForUpload = async (file: File, mediaType: MediaType) => {
  if (mediaType !== "image" || file.size <= maxImageUploadBytes) return file;

  let smallestBlob: Blob | null = null;

  for (const attempt of imageResizeAttempts) {
    const blob = await resizeImage(file, attempt.maxDimension, attempt.quality);
    if (!smallestBlob || blob.size < smallestBlob.size) {
      smallestBlob = blob;
    }
    if (blob.size <= maxImageUploadBytes) break;
  }

  if (!smallestBlob || smallestBlob.size >= file.size) return file;

  return new File([smallestBlob], getCompressedImageName(file.name), {
    type: smallestBlob.type || imageOutputType,
    lastModified: file.lastModified,
  });
};

// Vercel rechaza peticiones de mas de ~4.5 MB, por eso la subida por el servidor es solo el respaldo
const maxServerUploadBytes = 4 * 1024 * 1024;

const uploadThroughServer = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 413) {
      throw new Error("El archivo es demasiado pesado para subirlo. Intenta con una imagen mas liviana.");
    }
    throw new Error(err.message || "Error al subir archivo: " + file.name);
  }
  const data = await res.json();
  return data.url;
};

// Sube el archivo directo a S3 con una presigned URL. Si S3 rechaza la subida directa
// (por ejemplo, el bucket no tiene CORS configurado), lo intenta a traves del servidor.
export const uploadMediaFile = async (file: File): Promise<string> => {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al preparar la subida de: " + file.name);
  }
  const { presignedUrl, url, contentType } = await res.json();

  try {
    const uploadRes = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": contentType },
    });
    if (uploadRes.ok) return url;
    console.warn(`S3 rechazo la subida directa de ${file.name} (HTTP ${uploadRes.status}).`);
  } catch (err) {
    console.warn(`Fallo la subida directa a S3 de ${file.name}; revisa el CORS del bucket.`, err);
  }

  if (file.size > maxServerUploadBytes) {
    throw new Error(
      `No se pudo subir ${file.name} directo a S3 y pesa demasiado para subirlo por el servidor. Revisa la configuracion CORS del bucket.`
    );
  }

  return uploadThroughServer(file);
};

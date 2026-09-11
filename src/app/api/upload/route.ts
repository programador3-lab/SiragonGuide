import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.AWS_REGION;
// AWS_S3_BUCKET es el nombre usado en Vercel; AWS_S3_BUCKET_NAME es el de la rama main
const bucket = process.env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET_NAME;
const publicBaseUrl = process.env.AWS_S3_PUBLIC_URL;

const s3 =
  region && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? new S3Client({
        region,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      })
    : null;

const getPublicUrl = (key: string) => {
  if (publicBaseUrl) {
    return `${publicBaseUrl.replace(/\/$/, "")}/${key}`;
  }

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

const mimeByExtension: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".m4v": "video/x-m4v",
  ".mov": "video/quicktime",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".webm": "video/webm",
  ".webp": "image/webp",
};

const getContentType = (name: string, type?: string) => {
  if (type) return type;

  const lowerName = name.toLowerCase();
  const extension = Object.keys(mimeByExtension).find((item) => lowerName.endsWith(item));

  return extension ? mimeByExtension[extension] : "application/octet-stream";
};

const buildKey = (name: string) => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const safeOriginalName = name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  return `uploads/media/${uniqueSuffix}-${safeOriginalName}`;
};

// Dos modos:
// - JSON { filename, contentType }: devuelve una presigned URL para que el navegador suba directo a S3
//   (sin el limite de ~4.5 MB por peticion de Vercel).
// - FormData con "file": el servidor sube el archivo a S3. Se usa como respaldo si falla la subida directa.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado. Solo admins pueden subir archivos." }, { status: 403 });
  }

  if (!s3 || !bucket || !region) {
    return NextResponse.json(
      { message: "AWS S3 no esta configurado. Revisa AWS_REGION, AWS_S3_BUCKET, AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY." },
      { status: 500 }
    );
  }

  try {
    if (req.headers.get("content-type")?.includes("application/json")) {
      const { filename, contentType } = await req.json();

      if (!filename) {
        return NextResponse.json({ message: "Faltan datos del archivo" }, { status: 400 });
      }

      const key = buildKey(filename);
      const finalContentType = getContentType(filename, contentType);
      const presignedUrl = await getSignedUrl(
        s3,
        new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: finalContentType }),
        { expiresIn: 3600 }
      );

      return NextResponse.json({ presignedUrl, url: getPublicUrl(key), contentType: finalContentType });
    }

    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ message: "No se encontro ningun archivo" }, { status: 400 });
    }

    const key = buildKey(file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: getContentType(file.name, file.type),
      })
    );

    return NextResponse.json({ url: getPublicUrl(key) });
  } catch (error: any) {
    console.error("Error subiendo archivo:", error);
    return NextResponse.json({ message: "Error al subir el archivo: " + (error.message || "Desconocido") }, { status: 500 });
  }
}

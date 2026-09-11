"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, Upload, CheckCircle2, AlertCircle, Sparkles, X } from "lucide-react";
import AdminNavbar from "@/components/AdminNavbar";
import { getMediaType, imageAccept, mediaAccept, prepareMediaFileForUpload, uploadMediaFile } from "@/lib/mediaFiles";

type MediaPreview = {
  id: string;
  name: string;
  type: "image" | "video";
  previewUrl: string;
  file?: File;
};

const initialForm = {
  productName: "",
  sku: "",
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [productPhoto, setProductPhoto] = useState<MediaPreview | null>(null);
  const [guideMedia, setGuideMedia] = useState<MediaPreview[]>([]);
  const [tipsMedia, setTipsMedia] = useState<MediaPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, router, session]);

  useEffect(() => {
    return () => {
      if (productPhoto) URL.revokeObjectURL(productPhoto.previewUrl);
      [...guideMedia, ...tipsMedia].forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [productPhoto, guideMedia, tipsMedia]);

  const mapFilesToMedia = async (files: FileList): Promise<MediaPreview[]> => {
    const items: MediaPreview[] = [];

    for (const file of Array.from(files)) {
      const mediaType = getMediaType(file);
      if (!mediaType) continue;
      const uploadFile = await prepareMediaFileForUpload(file, mediaType);

      items.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        type: mediaType,
        previewUrl: URL.createObjectURL(uploadFile),
        file: uploadFile,
      });
    }

    return items;
  };

  const handleMediaChange = async (
    event: ChangeEvent<HTMLInputElement>,
    target: "product" | "guide" | "tips"
  ) => {
    const files = event.target.files;
    if (!files?.length) return;

    try {
      const mediaItems = await mapFilesToMedia(files);
      if (target === "product") {
        const firstImage = mediaItems.find((item) => item.type === "image") || mediaItems[0];
        if (productPhoto) URL.revokeObjectURL(productPhoto.previewUrl);
        if (firstImage) setProductPhoto(firstImage);
        event.target.value = "";
        return;
      }

      if (target === "guide") {
        setGuideMedia((prev) => [...prev, ...mediaItems]);
      } else {
        setTipsMedia((prev) => [...prev, ...mediaItems]);
      }

      event.target.value = "";
    } catch (err: any) {
      setError(err.message || "No se pudo preparar el archivo.");
      event.target.value = "";
    }
  };

  const removeMedia = (id: string, target: "guide" | "tips") => {
    const remove = (items: MediaPreview[]) => {
      const item = items.find((entry) => entry.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return items.filter((entry) => entry.id !== id);
    };

    if (target === "guide") setGuideMedia(remove);
    else setTipsMedia(remove);
  };

  const removeProductPhoto = () => {
    if (!productPhoto) return;
    URL.revokeObjectURL(productPhoto.previewUrl);
    setProductPhoto(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (guideMedia.length === 0) {
      setLoading(false);
      setError("Debes agregar al menos un archivo en Guias de instalacion.");
      return;
    }

    if (tipsMedia.length === 0) {
      setLoading(false);
      setError("Debes agregar al menos un archivo en Tips.");
      return;
    }

    try {
      let finalProductPhoto = null;
      if (productPhoto?.file) {
        const url = await uploadMediaFile(productPhoto.file);
        finalProductPhoto = { name: productPhoto.name, type: productPhoto.type, url };
      }

      const finalGuideMedia = [];
      for (const item of guideMedia) {
        if (item.file) {
          const url = await uploadMediaFile(item.file);
          finalGuideMedia.push({ name: item.name, type: item.type, url });
        }
      }

      const finalTipsMedia = [];
      for (const item of tipsMedia) {
        if (item.file) {
          const url = await uploadMediaFile(item.file);
          finalTipsMedia.push({ name: item.name, type: item.type, url });
        }
      }

      const res = await fetch("/api/guides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: form.productName.trim(),
          sku: form.sku.trim(),
          productPhoto: finalProductPhoto,
          guideMedia: finalGuideMedia,
          tipsMedia: finalTipsMedia,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al guardar el producto");
      }

      setForm(initialForm);
      if (productPhoto) URL.revokeObjectURL(productPhoto.previewUrl);
      setProductPhoto(null);
      guideMedia.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      tipsMedia.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setGuideMedia([]);
      setTipsMedia([]);
      setMessage("Producto guardado.");
    } catch (err: any) {
      setError(err.message || "Ocurrio un error al guardar");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_800px_500px_at_50%_-20%,rgba(249,115,22,0.12),transparent_70%)]" />
        <div className="relative z-10 flex flex-col items-center gap-5">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-orange-500" />
            <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-t-orange-400/50 [animation-direction:reverse]" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-600">Cargando panel</p>
        </div>
      </main>
    );
  }

  const mediaBlock = (
    title: string,
    subtitle: string,
    target: "guide" | "tips",
    items: MediaPreview[],
    accentColor: string
  ) => (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-zinc-900/50 p-7 backdrop-blur-xl transition-all duration-300 hover:border-orange-500/30 hover:bg-zinc-900/70">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2.5">
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${accentColor}`}>
              <Upload size={15} className="text-white" />
            </div>
            <span className="text-sm font-bold text-zinc-100">{title}</span>
          </div>
          <p className="ml-[42px] text-[11px] text-zinc-600">{subtitle}</p>
        </div>
        <label className="cursor-pointer rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-zinc-400 transition-all hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-300">
          + Añadir archivos
          <input type="file" accept={mediaAccept} multiple onChange={(e) => handleMediaChange(e, target)} className="hidden" />
        </label>
      </div>

      {items.length === 0 ? (
        <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-white/[0.06] text-zinc-700 text-xs">
          Arrastra o selecciona archivos para cargar
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="group/card relative overflow-hidden rounded-xl border border-white/[0.06] bg-zinc-950/60 transition-all hover:border-orange-500/30">
              {item.type === "image" ? (
                <img src={item.previewUrl} alt={item.name} className="h-24 w-full object-cover transition-transform duration-300 group-hover/card:scale-105" />
              ) : (
                <video src={item.previewUrl} className="h-24 w-full object-cover" controls />
              )}
              <div className="p-2">
                <p className="mb-2 truncate text-[10px] font-medium text-zinc-600">{item.name}</p>
                <button
                  type="button"
                  onClick={() => removeMedia(item.id, target)}
                  className="flex w-full items-center justify-center gap-1 rounded-lg bg-red-500/10 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-500/70 transition-all hover:bg-red-500 hover:text-white"
                >
                  <X size={10} /> Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-zinc-950 font-sans text-zinc-100 selection:bg-orange-500/30 selection:text-orange-300">
      {/* Background layers */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_900px_600px_at_50%_-10%,rgba(249,115,22,0.10),transparent_65%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_600px_400px_at_80%_80%,rgba(249,115,22,0.05),transparent_70%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.015\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

      <AdminNavbar
        active="dashboard"
        email={session?.user?.email}
        onSignOut={() => signOut({ callbackUrl: "/login" })}
      />

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-36">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black tracking-tight text-white md:text-6xl">
            Agregar{" "}
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
              producto
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-500">
            Carga la foto principal, guías de instalación y tips que se mostrarán al consultar el modelo vía QR.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.08] p-4 text-sm text-red-400">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}
        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-500/20 bg-green-500/[0.08] p-4 text-sm text-green-400">
            <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
            {message}
          </div>
        )}

        {/* Main card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-zinc-900/40 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-12">
          <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Fields row */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="ml-1 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                  Nombre del equipo
                </label>
                <input
                  className="w-full rounded-xl border border-white/[0.07] bg-zinc-950/60 px-5 py-4 text-sm font-medium text-zinc-100 outline-none transition-all placeholder:text-zinc-700 hover:border-white/15 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                  placeholder="Ej. Siragon SP-7000..."
                  value={form.productName}
                  onChange={(e) => setForm((prev) => ({ ...prev, productName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="ml-1 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                  SKU / Modelo
                </label>
                <input
                  className="w-full rounded-xl border border-white/[0.07] bg-zinc-950/60 px-5 py-4 text-sm font-medium text-zinc-100 outline-none transition-all placeholder:text-zinc-700 hover:border-white/15 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                  placeholder="Ej. SKU-9281A..."
                  value={form.sku}
                  onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Product photo */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-zinc-900/50 p-7 backdrop-blur-xl transition-all hover:border-orange-500/30 hover:bg-zinc-900/70">
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="mb-5 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
                  <ImageIcon size={15} className="text-white" />
                </div>
                <div>
                  <span className="text-sm font-bold text-zinc-100">Fotografía principal</span>
                  <p className="text-[11px] text-zinc-600">Imagen de portada del producto</p>
                </div>
              </div>
              <input
                type="file"
                accept={imageAccept}
                onChange={(e) => handleMediaChange(e, "product")}
                className="block w-full cursor-pointer rounded-xl border border-dashed border-white/[0.06] bg-zinc-950/40 px-4 py-3 text-sm text-zinc-600 transition-colors file:mr-4 file:rounded-xl file:border-0 file:bg-orange-500/15 file:px-4 file:py-2 file:text-[11px] file:font-bold file:text-orange-400 hover:file:bg-orange-500 hover:file:text-white"
              />
              {productPhoto && (
                <div className="mt-5 w-fit overflow-hidden rounded-xl border border-white/[0.07] bg-zinc-950/60">
                  <img src={productPhoto.previewUrl} alt={productPhoto.name} className="h-40 w-56 object-cover" />
                  <div className="p-3">
                    <p className="mb-2 truncate text-[10px] font-medium text-zinc-600">{productPhoto.name}</p>
                    <button
                      type="button"
                      onClick={removeProductPhoto}
                      className="flex w-full items-center justify-center gap-1 rounded-lg bg-red-500/10 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-500/70 transition-all hover:bg-red-500 hover:text-white"
                    >
                      <X size={10} /> Eliminar foto
                    </button>
                  </div>
                </div>
              )}
            </div>

            {mediaBlock(
              "Guías de instalación",
              "Imágenes o videos paso a paso",
              "guide",
              guideMedia,
              "bg-gradient-to-br from-blue-500 to-blue-600"
            )}
            {mediaBlock(
              "Tips adicionales",
              "Consejos y recomendaciones del producto",
              "tips",
              tipsMedia,
              "bg-gradient-to-br from-purple-500 to-purple-600"
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 py-4 px-6 text-sm font-bold text-white shadow-xl shadow-orange-500/25 transition-all duration-200 hover:from-orange-400 hover:to-orange-500 hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Guardando producto...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Publicar equipo
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

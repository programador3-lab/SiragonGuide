"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogOut, Plus, Upload, LayoutGrid } from "lucide-react";
import Link from "next/link";

type MediaPreview = {
  id: string;
  name: string;
  type: "image" | "video";
  previewUrl: string;
  base64?: string;
};

type LocalProductMediaEntry = {
  id: string;
  productName: string;
  sku: string;
  productPhoto: { name: string; type: "image" | "video"; base64?: string } | null;
  guideMedia: { name: string; type: "image" | "video"; base64?: string }[];
  tipsMedia: { name: string; type: "image" | "video"; base64?: string }[];
  createdAt: string;
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
    }
  }, [status, router]);

  useEffect(() => {
    return () => {
      if (productPhoto) URL.revokeObjectURL(productPhoto.previewUrl);
      [...guideMedia, ...tipsMedia].forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [productPhoto, guideMedia, tipsMedia]);

  const mapFilesToMedia = async (files: FileList): Promise<MediaPreview[]> => {
    const validFiles = Array.from(files).filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );
    const results: MediaPreview[] = [];
    for (const file of validFiles) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      results.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        type: file.type.startsWith("video/") ? "video" : "image",
        previewUrl: URL.createObjectURL(file),
        base64,
      });
    }
    return results;
  };

  const handleMediaChange = async (
    event: ChangeEvent<HTMLInputElement>,
    target: "product" | "guide" | "tips"
  ) => {
    const files = event.target.files;
    if (!files?.length) return;

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
  };

  const removeMedia = (id: string, target: "guide" | "tips") => {
    if (target === "guide") {
      setGuideMedia((prev) => {
        const item = prev.find((entry) => entry.id === id);
        if (item) URL.revokeObjectURL(item.previewUrl);
        return prev.filter((entry) => entry.id !== id);
      });
      return;
    }

    setTipsMedia((prev) => {
      const item = prev.find((entry) => entry.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((entry) => entry.id !== id);
    });
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

    const newEntry: LocalProductMediaEntry = {
      id: `${Date.now()}`,
      productName: form.productName.trim(),
      sku: form.sku.trim(),
      productPhoto: productPhoto
        ? { name: productPhoto.name, type: productPhoto.type, base64: productPhoto.base64 }
        : null,
      guideMedia: guideMedia.map((item) => ({ name: item.name, type: item.type, base64: item.base64 })),
      tipsMedia: tipsMedia.map((item) => ({ name: item.name, type: item.type, base64: item.base64 })),
      createdAt: new Date().toISOString(),
    };

    const raw = localStorage.getItem("localProductGuides");
    const current = raw ? (JSON.parse(raw) as LocalProductMediaEntry[]) : [];
    localStorage.setItem("localProductGuides", JSON.stringify([newEntry, ...current]));
    setForm(initialForm);
    if (productPhoto) URL.revokeObjectURL(productPhoto.previewUrl);
    setProductPhoto(null);
    guideMedia.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    tipsMedia.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setGuideMedia([]);
    setTipsMedia([]);
    setLoading(false);
    setMessage("Producto guardado.");
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-white text-black gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-siragon-orange/10 via-transparent to-transparent opacity-80" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-black/10 border-t-siragon-orange rounded-full animate-spin" />
          <p className="text-xs font-bold tracking-[0.2em] text-black/40 uppercase">Cargando Panel</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen font-sans selection:bg-siragon-orange selection:text-white overflow-hidden bg-white text-black">
      {/* Background Overlays */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-siragon-orange/10 via-transparent to-transparent opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-black/5 via-transparent to-transparent" />
      </div>

      <nav className="sticky top-0 z-50 bg-black border-b border-white/10 shadow-sm">
        <div className="flex items-center justify-between px-8 h-[45px] max-w-7xl mx-auto w-full">
          {/* Síragon Official Links */}
          <div className="flex items-center gap-8">
            <a href="https://siragon.com">
              <img src="https://siragon.com/wp-content/uploads/2023/03/Logo-Siragon_Blanco-e1684488951400.png" alt="Síragon" className="h-6 w-auto" />
            </a>
          </div>

          {/* App Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/productos"
              className="rounded-xl bg-siragon-orange border border-transparent px-4 py-2 text-xs font-bold text-white hover:bg-siragon-orange-dark shadow-sm transition-all"
            >
              Productos
            </Link>
            <span className="text-white/50 text-xs font-medium hidden sm:inline-block">
              {session?.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-white text-xs font-bold hover:bg-red-500 transition-colors"
            >
              <LogOut size={14} />
              Salir
            </button>
          </div>
        </div>
      </nav>

      <section className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <div className="group relative rounded-[2.5rem] p-8 md:p-12 transition-all duration-500 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-black/10">


          <h2 className="text-4xl font-light tracking-tight text-black mb-2">
            Agregar Nuevo <span className="font-bold text-siragon-orange">Producto</span>
          </h2>
          <p className="text-black/60 mb-10 leading-relaxed max-w-2xl">
          </p>

          {error && (
            <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              {error}
            </div>
          )}
          {message && (
            <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-black/60 uppercase tracking-wider ml-1">Nombre del equipo</label>
                <input
                  className="w-full rounded-2xl border border-black/10 bg-white px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-siragon-orange focus:border-transparent transition-all placeholder:text-black/30 font-medium text-black shadow-sm"
                  placeholder="Ej. Síragon SP-7000..."
                  value={form.productName}
                  onChange={(e) => setForm((prev) => ({ ...prev, productName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-black/60 uppercase tracking-wider ml-1">SKU / Modelo</label>
                <input
                  className="w-full rounded-2xl border border-black/10 bg-white px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-siragon-orange focus:border-transparent transition-all placeholder:text-black/30 font-medium text-black shadow-sm"
                  placeholder="Ej. SKU-9281A..."
                  value={form.sku}
                  onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white shadow-sm p-6 transition-colors hover:border-black/20">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-black">
                <div className="p-1.5 rounded-lg bg-black text-white">
                  <Upload size={16} />
                </div>
                Fotografía Principal
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleMediaChange(e, "product")}
                className="block w-full text-sm text-black/60 file:mr-4 file:rounded-xl file:border-0 file:bg-black file:px-4 file:py-2.5 file:text-xs file:font-bold file:text-white file:shadow-sm hover:file:bg-siragon-orange transition-colors cursor-pointer"
              />
              {productPhoto && (
                <div className="mt-5 max-w-[220px] rounded-2xl border border-black/10 bg-white p-3 shadow-sm">
                  <img
                    src={productPhoto.previewUrl}
                    alt={productPhoto.name}
                    className="h-32 w-full rounded-xl object-cover"
                  />
                  <p className="mt-3 truncate text-xs font-medium text-black/80 px-1">{productPhoto.name}</p>
                  <button
                    type="button"
                    onClick={removeProductPhoto}
                    className="mt-2 w-full rounded-lg bg-red-50 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-100 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-black/10 bg-white shadow-sm p-6 transition-colors hover:border-black/20">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-black">
                <div className="p-1.5 rounded-lg bg-black text-white">
                  <Upload size={16} />
                </div>
                Guías de Instalación
                <span className="text-xs font-normal text-black/40 ml-2">(Imágenes o Videos)</span>
              </div>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => handleMediaChange(e, "guide")}
                className="block w-full text-sm text-black/60 file:mr-4 file:rounded-xl file:border-0 file:bg-black file:px-4 file:py-2.5 file:text-xs file:font-bold file:text-white file:shadow-sm hover:file:bg-siragon-orange transition-colors cursor-pointer"
              />
              {guideMedia.length > 0 && (
                <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {guideMedia.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-black/10 bg-white p-3 shadow-sm flex flex-col">
                      {item.type === "image" ? (
                        <img src={item.previewUrl} alt={item.name} className="h-24 w-full rounded-xl object-cover" />
                      ) : (
                        <video src={item.previewUrl} className="h-24 w-full rounded-xl object-cover" controls />
                      )}
                      <p className="mt-3 mb-2 truncate text-xs font-medium text-black/80 px-1">{item.name}</p>
                      <button
                        type="button"
                        onClick={() => removeMedia(item.id, "guide")}
                        className="mt-auto w-full rounded-lg bg-red-50 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-100 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-black/10 bg-white shadow-sm p-6 transition-colors hover:border-black/20">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-black">
                <div className="p-1.5 rounded-lg bg-black text-white">
                  <Upload size={16} />
                </div>
                Tips Adicionales
                <span className="text-xs font-normal text-black/40 ml-2">(Imágenes o Videos)</span>
              </div>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => handleMediaChange(e, "tips")}
                className="block w-full text-sm text-black/60 file:mr-4 file:rounded-xl file:border-0 file:bg-black file:px-4 file:py-2.5 file:text-xs file:font-bold file:text-white file:shadow-sm hover:file:bg-siragon-orange transition-colors cursor-pointer"
              />
              {tipsMedia.length > 0 && (
                <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {tipsMedia.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-black/10 bg-white p-3 shadow-sm flex flex-col">
                      {item.type === "image" ? (
                        <img src={item.previewUrl} alt={item.name} className="h-24 w-full rounded-xl object-cover" />
                      ) : (
                        <video src={item.previewUrl} className="h-24 w-full rounded-xl object-cover" controls />
                      )}
                      <p className="mt-3 mb-2 truncate text-xs font-medium text-black/80 px-1">{item.name}</p>
                      <button
                        type="button"
                        onClick={() => removeMedia(item.id, "tips")}
                        className="mt-auto w-full rounded-lg bg-red-50 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-100 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full rounded-2xl bg-black py-4 font-bold text-white shadow-[0_10px_20px_rgba(0,0,0,0.2)] transition-all hover:bg-siragon-orange hover:shadow-[0_10px_20px_rgba(238,116,2,0.3)] disabled:opacity-60 disabled:hover:bg-black flex justify-center"
            >
              {loading ? "Guardando..." : "Publicar Equipo"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

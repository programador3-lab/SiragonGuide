"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Package, FileText, Lightbulb, Calendar, Search, Box, X, Trash2,
  Edit3, Save, Image as ImageIcon, Video, Upload, Download, Link as LinkIcon,
  Layers, TrendingUp,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import AdminNavbar from "@/components/AdminNavbar";

type LocalProductMediaEntry = {
  id: string;
  productName: string;
  sku: string;
  productPhoto: { name: string; type: "image" | "video"; base64?: string; url?: string; file?: File } | null;
  guideMedia: { name: string; type: "image" | "video"; base64?: string; url?: string; file?: File }[];
  tipsMedia: { name: string; type: "image" | "video"; base64?: string; url?: string; file?: File }[];
  createdAt: string;
};

export default function ProductosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<LocalProductMediaEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<LocalProductMediaEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<LocalProductMediaEntry | null>(null);
  const [previewMedia, setPreviewMedia] = useState<{ name: string; type: "image" | "video"; base64?: string; url?: string } | null>(null);

  const downloadQR = (sku: string) => {
    const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `QR_Siragon_${sku}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // @ts-ignore
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
      return;
    }

    const fetchGuides = async () => {
      try {
        const res = await fetch("/api/guides");
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((item: any) => ({
            ...item,
            id: String(item.id),
            productName: item.productName || "-",
            sku: item.sku || "-",
            guideMedia: Array.isArray(item.guideMedia) ? item.guideMedia : [],
            tipsMedia: Array.isArray(item.tipsMedia) ? item.tipsMedia : [],
            productPhoto: item.productPhoto || null,
            createdAt: String(item.createdAt || new Date().toISOString()),
          }));
          setItems(mapped);
        }
      } catch (err) {
        console.error("Error al cargar productos", err);
      } finally {
        setReady(true);
      }
    };

    fetchGuides();
  }, [status, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.")) return;
    try {
      const res = await fetch(`/api/guides/${id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = items.filter(item => item.id !== id);
        setItems(updated);
        setSelectedProduct(null);
      } else {
        alert("Error al eliminar");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!editForm) return;

    const uploadFile = async (file: File) => {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Error al obtener URL de subida");
      }
      const { presignedUrl, url } = await res.json();

      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) {
        throw new Error("Error al subir archivo a AWS S3");
      }

      return url;
    };

    try {
      const finalForm = { ...editForm, guideMedia: [...editForm.guideMedia], tipsMedia: [...editForm.tipsMedia] };

      if (finalForm.productPhoto?.file) {
        finalForm.productPhoto = { ...finalForm.productPhoto, url: await uploadFile(finalForm.productPhoto.file) };
        delete finalForm.productPhoto.file;
        delete finalForm.productPhoto.base64;
      }
      for (let i = 0; i < finalForm.guideMedia.length; i++) {
        if (finalForm.guideMedia[i].file) {
          finalForm.guideMedia[i] = { ...finalForm.guideMedia[i], url: await uploadFile(finalForm.guideMedia[i].file as File) };
          delete finalForm.guideMedia[i].file;
          delete finalForm.guideMedia[i].base64;
        }
      }
      for (let i = 0; i < finalForm.tipsMedia.length; i++) {
        if (finalForm.tipsMedia[i].file) {
          finalForm.tipsMedia[i] = { ...finalForm.tipsMedia[i], url: await uploadFile(finalForm.tipsMedia[i].file as File) };
          delete finalForm.tipsMedia[i].file;
          delete finalForm.tipsMedia[i].base64;
        }
      }

      const res = await fetch(`/api/guides/${editForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalForm),
      });
      if (res.ok) {
        const updatedItem = await res.json();
        const mappedItem = {
          ...updatedItem,
          id: String(updatedItem.id),
          productName: updatedItem.productName || "-",
          sku: updatedItem.sku || "-",
          guideMedia: Array.isArray(updatedItem.guideMedia) ? updatedItem.guideMedia : [],
          tipsMedia: Array.isArray(updatedItem.tipsMedia) ? updatedItem.tipsMedia : [],
          productPhoto: updatedItem.productPhoto || null,
          createdAt: String(updatedItem.createdAt || new Date().toISOString()),
        };
        const updated = items.map(item => item.id === editForm.id ? mappedItem : item);
        setItems(updated);
        setSelectedProduct(mappedItem);
        setIsEditing(false);
      } else {
        let errMsg = "Error al guardar";
        try {
          const errData = await res.json();
          if (errData?.message) errMsg = errData.message;
        } catch (e) { }
        alert(errMsg);
      }
    } catch (err) {
      console.error(err);
      alert("Error al guardar: " + String(err));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, target: "guide" | "tips") => {
    const files = e.target.files;
    if (!files?.length || !editForm) return;

    const validFiles = Array.from(files).filter(f => f.type.startsWith("image/") || f.type.startsWith("video/"));
    const newMedia: { name: string; type: "image" | "video"; base64?: string; file?: File }[] = [];

    for (const file of validFiles) {
      newMedia.push({
        name: file.name,
        type: file.type.startsWith("video/") ? "video" : "image",
        base64: URL.createObjectURL(file),
        file,
      });
    }

    if (target === "guide") {
      setEditForm({ ...editForm, guideMedia: [...editForm.guideMedia, ...newMedia] });
    } else {
      setEditForm({ ...editForm, tipsMedia: [...editForm.tipsMedia, ...newMedia] });
    }
    e.target.value = "";
  };

  const handleProductPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editForm) return;

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return;

    setEditForm({
      ...editForm,
      productPhoto: {
        name: file.name,
        type: file.type.startsWith("video/") ? "video" : "image",
        base64: URL.createObjectURL(file),
        file,
      },
    });
    e.target.value = "";
  };

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const list = [...items].sort((a, b) => {
      if (!a.createdAt && !b.createdAt) return 0;
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    if (!normalizedQuery) return list;
    return list.filter(
      (row) =>
        row.productName.toLowerCase().includes(normalizedQuery) ||
        row.sku.toLowerCase().includes(normalizedQuery)
    );
  }, [items, query]);

  if (!ready) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_800px_500px_at_50%_-20%,rgba(249,115,22,0.12),transparent_70%)]" />
        <div className="relative z-10 flex flex-col items-center gap-5">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-orange-500" />
            <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-t-orange-400/50 [animation-direction:reverse]" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-600">Cargando catálogo</p>
        </div>
      </main>
    );
  }

  const totalGuides = items.reduce((acc, i) => acc + i.guideMedia.length, 0);
  const totalTips = items.reduce((acc, i) => acc + i.tipsMedia.length, 0);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-zinc-950 font-sans text-zinc-100 selection:bg-orange-500/30 selection:text-orange-300">
      {/* Background layers */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_900px_600px_at_50%_-10%,rgba(249,115,22,0.10),transparent_65%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_600px_400px_at_80%_80%,rgba(249,115,22,0.05),transparent_70%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.015\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

      <AdminNavbar active="productos" email={session?.user?.email} />

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-36">

        {/* Header */}
        <div className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-5xl font-black tracking-tight text-white md:text-6xl">
              Productos{" "}
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                registrados
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-500">
              Gestiona las guías, tips y códigos QR disponibles para cada modelo.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-[340px]">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o SKU..."
              className="h-13 w-full rounded-2xl border border-white/[0.07] bg-zinc-900/60 pl-11 pr-5 py-4 text-sm text-zinc-200 outline-none backdrop-blur-xl transition-all placeholder:text-zinc-700 hover:border-white/15 focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/15"
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="mb-10 grid grid-cols-3 gap-4">
          {[
            { icon: Package, label: "Productos", value: items.length, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
            { icon: FileText, label: "Guías totales", value: totalGuides, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
            { icon: Lightbulb, label: "Tips totales", value: totalTips, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
          ].map((stat) => (
            <div key={stat.label} className={`flex items-center gap-4 rounded-2xl border ${stat.bg} bg-zinc-900/40 p-5 backdrop-blur-xl`}>
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <div>
                <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-[11px] font-medium text-zinc-600">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Grid */}
        {filteredItems.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-zinc-900/40 px-8 py-28 text-center backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
            <Box size={52} className="mx-auto mb-5 text-zinc-700" />
            <h3 className="mb-2 text-xl font-bold text-zinc-300">No se encontraron equipos</h3>
            <p className="mx-auto max-w-sm text-sm text-zinc-600">
              Intenta ajustar la búsqueda o agrega un nuevo producto.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:from-orange-400 hover:to-orange-500"
            >
              Agregar producto
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((row) => (
              <article
                key={row.id}
                onClick={() => { setSelectedProduct(row); setIsEditing(false); }}
                className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-900/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/10"
              >
                {/* Top glow line on hover */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/0 to-transparent transition-all duration-500 group-hover:via-orange-500/60" />

                {/* Product image */}
                <div className="relative h-44 overflow-hidden bg-zinc-950/60">
                  {row.productPhoto?.url || row.productPhoto?.base64 ? (
                    <img
                      src={row.productPhoto.url || row.productPhoto.base64}
                      alt={row.productName}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package size={44} className="text-zinc-700 transition-all duration-300 group-hover:scale-110 group-hover:text-orange-500/50" />
                    </div>
                  )}
                  {/* SKU badge */}
                  <div className="absolute left-3 top-3">
                    <span className="rounded-lg border border-orange-500/30 bg-zinc-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-400 backdrop-blur-md">
                      {row.sku}
                    </span>
                  </div>
                </div>

                <div className="flex flex-grow flex-col p-5">
                  <h3 className="mb-1 text-sm font-bold leading-tight text-zinc-100 transition-colors group-hover:text-orange-300">
                    {row.productName}
                  </h3>
                  <p className="mb-4 truncate text-[11px] text-zinc-600">
                    {row.productPhoto?.name ?? "Sin foto principal"}
                  </p>

                  {/* Stats */}
                  <div className="mt-auto flex items-center gap-3 border-t border-white/[0.05] pt-4">
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10">
                        <FileText size={11} className="text-blue-400" />
                      </div>
                      <span className="text-xs font-bold text-zinc-400">{row.guideMedia.length}</span>
                      <span className="text-[10px] text-zinc-700">guías</span>
                    </div>
                    <div className="h-3 w-px bg-white/[0.06]" />
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/10">
                        <Lightbulb size={11} className="text-purple-400" />
                      </div>
                      <span className="text-xs font-bold text-zinc-400">{row.tipsMedia.length}</span>
                      <span className="text-[10px] text-zinc-700">tips</span>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-[10px] text-zinc-700">
                      <Calendar size={10} />
                      {row.createdAt
                        ? new Date(row.createdAt).toLocaleDateString("es-VE", { day: "numeric", month: "short" })
                        : "-"}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── Product detail / edit modal ── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
            onClick={() => setSelectedProduct(null)}
          />
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-2xl border border-white/[0.08] bg-zinc-900 shadow-2xl shadow-black/60">
            <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

            {/* Modal header */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.06] bg-zinc-900/95 px-6 py-4 backdrop-blur-xl">
              <h3 className="text-base font-bold text-zinc-100">
                {isEditing ? "Editar producto" : selectedProduct.productName}
              </h3>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <>
                    <button
                      onClick={() => { setIsEditing(true); setEditForm(selectedProduct); }}
                      className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[11px] font-bold text-zinc-400 transition-all hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-300"
                    >
                      <Edit3 size={13} /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(selectedProduct.id)}
                      className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[11px] font-bold text-red-500/70 transition-all hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 size={13} /> Eliminar
                    </button>
                  </>
                )}
                {isEditing && (
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-[11px] font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:from-orange-400 hover:to-orange-500"
                  >
                    <Save size={13} /> Guardar cambios
                  </button>
                )}
                <button
                  onClick={() => { setSelectedProduct(null); setIsEditing(false); }}
                  className="ml-1 rounded-xl p-2 text-zinc-600 transition-all hover:bg-white/[0.06] hover:text-zinc-200"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="p-6">
              {!isEditing ? (
                /* ── View mode ── */
                <div className="space-y-6">
                  <div className="flex flex-col gap-6 md:flex-row">
                    {/* Product image */}
                    <div className="w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-950/60 md:w-2/5">
                      {selectedProduct.productPhoto?.url || selectedProduct.productPhoto?.base64 ? (
                        <img
                          src={selectedProduct.productPhoto.url || selectedProduct.productPhoto.base64}
                          alt={selectedProduct.productName}
                          className="h-64 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-64 items-center justify-center">
                          <Package size={60} className="text-zinc-700" />
                        </div>
                      )}
                    </div>

                    {/* Info + QR */}
                    <div className="flex w-full flex-col justify-between gap-5 md:w-3/5">
                      <div>
                        <span className="mb-3 inline-block rounded-lg border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-400">
                          {selectedProduct.sku}
                        </span>
                        <h2 className="mb-2 text-3xl font-black text-white">{selectedProduct.productName}</h2>
                        <p className="flex items-center gap-1.5 text-xs text-zinc-600">
                          <Calendar size={12} />
                          Registrado el{" "}
                          {new Date(selectedProduct.createdAt).toLocaleDateString("es-VE", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <div className="mt-4 flex gap-3">
                          <div className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/[0.08] px-3 py-2">
                            <FileText size={13} className="text-blue-400" />
                            <span className="text-sm font-bold text-blue-400">{selectedProduct.guideMedia.length}</span>
                            <span className="text-[11px] text-zinc-600">guías</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/[0.08] px-3 py-2">
                            <Lightbulb size={13} className="text-purple-400" />
                            <span className="text-sm font-bold text-purple-400">{selectedProduct.tipsMedia.length}</span>
                            <span className="text-[11px] text-zinc-600">tips</span>
                          </div>
                        </div>
                      </div>

                      {/* QR block */}
                      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-zinc-950/60 p-4">
                        <div className="flex items-center gap-4">
                          <div className="rounded-xl border border-white/[0.08] bg-white p-2">
                            <QRCodeCanvas
                              id="qr-canvas"
                              value={`${(process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/$/, "")}/guia/${encodeURIComponent(selectedProduct.sku)}`}
                              size={100}
                              level="H"
                              includeMargin={true}
                            />
                          </div>
                          <div className="flex flex-1 flex-col gap-2">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-600">
                              Código QR
                            </p>
                            <button
                              onClick={() => downloadQR(selectedProduct.sku)}
                              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2.5 text-[11px] font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-400 hover:to-orange-500"
                            >
                              <Download size={13} /> Descargar PNG
                            </button>
                            <button
                              onClick={() => {
                                const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || window.location.origin).replace(/\/$/, "");
                                navigator.clipboard.writeText(`${baseUrl}/api/qr/${encodeURIComponent(selectedProduct.sku)}`);
                                alert("URL de imagen copiada.");
                              }}
                              className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-2.5 text-[11px] font-bold text-zinc-500 transition-all hover:border-white/15 hover:text-zinc-200"
                            >
                              <LinkIcon size={13} /> Copiar URL imagen
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Media grids */}
                  <div className="grid gap-5 md:grid-cols-2">
                    {[
                      { title: "Guías de Instalación", icon: FileText, color: "text-blue-400", media: selectedProduct.guideMedia },
                      { title: "Tips Adicionales", icon: Lightbulb, color: "text-purple-400", media: selectedProduct.tipsMedia },
                    ].map((section) => (
                      <div key={section.title} className="rounded-2xl border border-white/[0.06] bg-zinc-950/40 p-5">
                        <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-zinc-200">
                          <section.icon size={15} className={section.color} /> {section.title}
                        </h4>
                        {section.media.length === 0 ? (
                          <p className="text-xs text-zinc-700">No hay archivos registrados.</p>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            {section.media.map((media, i) => (
                              <div
                                key={i}
                                onClick={() => (media.base64 || media.url) && setPreviewMedia(media)}
                                className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/[0.05] bg-zinc-900 transition-all hover:border-orange-500/40"
                              >
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-transparent transition-colors group-hover:bg-orange-500/15">
                                  {(media.base64 || media.url) && (
                                    <Search className="text-white opacity-0 transition-opacity group-hover:opacity-100" size={20} />
                                  )}
                                </div>
                                {media.base64 || media.url ? (
                                  media.type === "image" ? (
                                    <img src={media.url || media.base64} alt={media.name} className="h-24 w-full object-cover" />
                                  ) : (
                                    <video src={media.url || media.base64} className="h-24 w-full object-cover" />
                                  )
                                ) : (
                                  <div className="flex h-24 items-center justify-center bg-zinc-950 text-zinc-700">
                                    {media.type === "image" ? <ImageIcon size={22} /> : <Video size={22} />}
                                  </div>
                                )}
                                <div className="relative z-20 truncate border-t border-white/[0.05] bg-zinc-900/90 px-2 py-1.5 text-[10px] font-medium text-zinc-600 backdrop-blur-sm">
                                  {media.name}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* ── Edit mode ── */
                <div className="space-y-6">
                  {editForm && (
                    <>
                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="ml-1 text-[11px] font-bold uppercase tracking-widest text-zinc-600">Nombre del equipo</label>
                          <input
                            className="w-full rounded-xl border border-white/[0.07] bg-zinc-950/60 px-5 py-4 text-sm font-medium text-zinc-100 outline-none transition-all placeholder:text-zinc-700 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                            value={editForm.productName}
                            onChange={(e) => setEditForm({ ...editForm, productName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="ml-1 text-[11px] font-bold uppercase tracking-widest text-zinc-600">SKU / Modelo</label>
                          <input
                            className="w-full rounded-xl border border-white/[0.07] bg-zinc-950/60 px-5 py-4 text-sm font-medium text-zinc-100 outline-none transition-all placeholder:text-zinc-700 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                            value={editForm.sku}
                            onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Photo edit */}
                      <div className="space-y-2">
                        <label className="ml-1 text-[11px] font-bold uppercase tracking-widest text-zinc-600">Fotografía principal</label>
                        <div className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-zinc-950/40 p-4">
                          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.06] bg-zinc-950">
                            {editForm.productPhoto?.url || editForm.productPhoto?.base64 ? (
                              <img src={editForm.productPhoto.url || editForm.productPhoto.base64} className="h-full w-full object-cover" />
                            ) : (
                              <ImageIcon size={22} className="text-zinc-700" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="mb-2 truncate text-xs text-zinc-600">{editForm.productPhoto?.name || "Sin foto"}</p>
                            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[11px] font-bold text-zinc-500 transition-all hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-300">
                              <Upload size={12} /> Cambiar imagen
                              <input type="file" accept="image/*" className="hidden" onChange={handleProductPhotoChange} />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Media edit */}
                      <div className="grid gap-5 md:grid-cols-2">
                        {[
                          { title: "Guías", icon: FileText, color: "text-blue-400", target: "guide" as const, media: editForm.guideMedia },
                          { title: "Tips", icon: Lightbulb, color: "text-purple-400", target: "tips" as const, media: editForm.tipsMedia },
                        ].map((section) => (
                          <div key={section.title} className="rounded-xl border border-white/[0.06] bg-zinc-950/40 p-5">
                            <div className="mb-4 flex items-center justify-between">
                              <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-200">
                                <section.icon size={14} className={section.color} /> {section.title}
                              </h4>
                              <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold text-zinc-600 transition-all hover:border-orange-500/40 hover:text-orange-300">
                                <Upload size={11} /> Añadir
                                <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => handleFileChange(e, section.target)} />
                              </label>
                            </div>
                            <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                              {section.media.map((media, i) => (
                                <div key={i} className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-zinc-900/60 px-3 py-2.5">
                                  <span className="mr-2 flex-1 truncate text-[11px] text-zinc-500">{media.name}</span>
                                  <button
                                    onClick={() =>
                                      setEditForm({
                                        ...editForm,
                                        [section.target === "guide" ? "guideMedia" : "tipsMedia"]:
                                          (section.target === "guide" ? editForm.guideMedia : editForm.tipsMedia).filter((_, idx) => idx !== i),
                                      })
                                    }
                                    className="rounded-lg p-1.5 text-red-500/50 transition-all hover:bg-red-500/10 hover:text-red-400"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              ))}
                              {section.media.length === 0 && (
                                <p className="py-4 text-center text-xs text-zinc-700">Sin archivos</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Media preview lightbox ── */}
      {previewMedia && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-lg" onClick={() => setPreviewMedia(null)} />
          <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col items-center justify-center">
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute -top-14 right-0 rounded-full p-2 text-zinc-600 transition-all hover:bg-white/[0.06] hover:text-white"
            >
              <X size={28} />
            </button>
            {previewMedia.type === "image" ? (
              <img
                src={previewMedia.url || previewMedia.base64}
                alt={previewMedia.name}
                className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-2xl"
              />
            ) : (
              <video
                src={previewMedia.url || previewMedia.base64}
                controls
                autoPlay
                className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-2xl"
              />
            )}
            <p className="mt-4 rounded-full border border-white/[0.08] bg-zinc-900/80 px-4 py-2 text-xs font-medium text-zinc-400 backdrop-blur-md">
              {previewMedia.name}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

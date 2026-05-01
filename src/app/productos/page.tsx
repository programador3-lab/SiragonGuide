"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Package, FileText, Lightbulb, Calendar, Search, Box, LayoutGrid, X, Trash2, Edit3, Save, Image as ImageIcon, Video, Upload, Download, Link as LinkIcon, ExternalLink } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

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
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Error al subir archivo");
      }
      const data = await res.json();
      return data.url;
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
        body: JSON.stringify(finalForm)
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
        base64: URL.createObjectURL(file), // temporary for preview
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
        base64: URL.createObjectURL(file), // temporary for preview
        file,
      }
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
      <main className="min-h-screen flex flex-col items-center justify-center bg-white text-black gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-siragon-orange/10 via-transparent to-transparent opacity-80" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-black/10 border-t-siragon-orange rounded-full animate-spin" />
          <p className="text-xs font-bold tracking-[0.2em] text-black/40 uppercase">Cargando Catálogo</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen font-sans selection:bg-siragon-orange selection:text-white overflow-x-hidden bg-white text-black">
      {/* Background Overlays */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-siragon-orange/10 via-transparent to-transparent opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-black/5 via-transparent to-transparent" />
      </div>

      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-black border-b border-white/10 shadow-sm">
        <div className="flex items-center justify-between px-8 h-[45px] max-w-7xl mx-auto w-full">
          {/* Síragon Official Links */}
          <div className="flex items-center gap-8">
            <a href="https://siragon.com">
              <img src="https://siragon.com/wp-content/uploads/2023/03/Logo-Siragon_Blanco-e1684488951400.png" alt="Síragon" className="h-6 w-auto" />
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 rounded-xl bg-siragon-orange border border-transparent px-4 py-2 text-xs font-bold text-white hover:bg-siragon-orange-dark shadow-sm transition-all"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Agregar producto
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Page Header Area */}
        <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-5xl md:text-6xl font-light tracking-tight text-black mb-4">
              <span className="font-bold text-siragon-orange">Productos</span>
            </h2>
            <p className="text-black/60 text-sm md:text-base font-light leading-relaxed">
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-siragon-orange to-siragon-orange-dark rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-500"></div>
            <div className="relative flex items-center">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 group-focus-within:text-siragon-orange transition-colors"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre o SKU..."
                className="h-14 w-full lg:w-[320px] rounded-2xl border border-black/10 bg-white/90 backdrop-blur-md pl-12 pr-6 text-sm tracking-wide text-black placeholder:text-black/30 outline-none focus:ring-2 focus:ring-siragon-orange focus:border-transparent shadow-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredItems.length === 0 ? (
          <div className="rounded-[2.5rem] border border-black/10 bg-white/60 backdrop-blur-2xl px-8 py-24 text-center relative overflow-hidden group shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <Box size={56} className="mx-auto mb-6 text-black/20 animate-pulse" />
            <h3 className="text-xl font-medium text-black mb-2">No se encontraron equipos</h3>
            <p className="text-black/50 text-sm max-w-md mx-auto">Intenta ajustar los términos de búsqueda o agrega un nuevo producto desde el panel de administración.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((row) => (
              <article
                key={row.id}
                onClick={() => { setSelectedProduct(row); setIsEditing(false); }}
                className="group relative cursor-pointer rounded-3xl border border-black/10 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(238,116,2,0.1)] hover:border-siragon-orange/30 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden"
              >
                {/* Glow Effect Top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-siragon-orange/0 to-transparent group-hover:via-siragon-orange transition-all duration-500" />

                <div className="relative z-10 flex-grow">
                  <div className="mb-6 flex h-40 items-center justify-center rounded-2xl bg-black/5 border border-black/5 relative overflow-hidden group-hover:bg-siragon-orange/5 transition-colors">
                    {row.productPhoto?.url || row.productPhoto?.base64 ? (
                      <img src={row.productPhoto.url || row.productPhoto.base64} alt={row.productName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <Package size={48} className="text-black/20 group-hover:text-siragon-orange transition-colors duration-500 group-hover:scale-110 transform" />
                    )}
                  </div>

                  <div className="flex flex-col mb-4">
                    <span className="inline-block self-start rounded-lg bg-siragon-orange/10 border border-siragon-orange/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-siragon-orange mb-3">
                      {row.sku}
                    </span>
                    <h3 className="text-2xl font-light text-black leading-tight mb-1 group-hover:text-siragon-orange transition-colors">
                      {row.productName}
                    </h3>
                    <p className="text-xs tracking-wide text-black/50 truncate">
                      {row.productPhoto?.name ?? "Sin foto"}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 mt-auto pt-5 border-t border-black/5">
                  <div className="flex items-center justify-between text-black/60 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-black text-white group-hover:bg-siragon-orange transition-colors">
                        <FileText size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-black leading-none">{row.guideMedia.length}</span>
                        <span className="text-[9px] uppercase tracking-widest text-black/40 mt-1">Guías</span>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-black/10"></div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-black text-white group-hover:bg-siragon-orange transition-colors">
                        <Lightbulb size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-black leading-none">{row.tipsMedia.length}</span>
                        <span className="text-[9px] uppercase tracking-widest text-black/40 mt-1">Tips</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-black/50 uppercase tracking-widest font-semibold bg-black/5 rounded-lg px-3 py-2 w-fit">
                    <Calendar size={12} className="text-black/40" />
                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString('es-VE', { year: 'numeric', month: 'short', day: 'numeric' }) : "-"}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Modal Overlay */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-black/10 flex flex-col">

            {/* Modal Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-black/10 bg-white/90 backdrop-blur-xl">
              <h3 className="text-xl font-bold text-black flex items-center gap-2">
                {isEditing ? "Editar Producto" : "Detalles del Producto"}
              </h3>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <>
                    <button onClick={() => { setIsEditing(true); setEditForm(selectedProduct); }} className="flex items-center gap-2 px-4 py-2 bg-black/5 hover:bg-black hover:text-white text-black text-xs font-bold rounded-xl transition-all">
                      <Edit3 size={14} /> Editar
                    </button>
                    <button onClick={() => handleDelete(selectedProduct.id)} className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-xs font-bold rounded-xl transition-all">
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </>
                )}
                {isEditing && (
                  <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-siragon-orange text-white text-xs font-bold rounded-xl transition-all">
                    <Save size={14} /> Guardar
                  </button>
                )}
                <button onClick={() => { setSelectedProduct(null); setIsEditing(false); }} className="p-2 text-black/40 hover:text-black hover:bg-black/5 rounded-xl transition-all ml-2">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {!isEditing ? (
                /* View Mode */
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3 bg-black/5 rounded-2xl flex items-center justify-center border border-black/5 overflow-hidden">
                      {selectedProduct.productPhoto?.url || selectedProduct.productPhoto?.base64 ? (
                        <img src={selectedProduct.productPhoto.url || selectedProduct.productPhoto.base64} alt={selectedProduct.productName} className="w-full object-cover" />
                      ) : (
                        <Package size={64} className="text-black/20 m-12" />
                      )}
                    </div>
                    <div className="w-full md:w-2/3 flex items-center justify-between gap-4">
                      <div className="flex flex-col justify-center">
                        <span className="inline-block px-3 py-1 bg-siragon-orange/10 text-siragon-orange text-[10px] font-bold uppercase tracking-widest rounded-lg w-fit mb-4">{selectedProduct.sku}</span>
                        <h2 className="text-4xl font-light text-black mb-2">{selectedProduct.productName}</h2>
                        <p className="text-sm text-black/50">Registrado el {new Date(selectedProduct.createdAt).toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-center gap-3">
                        <div className="bg-white p-3 rounded-2xl border border-black/10 shadow-sm flex flex-col items-center gap-2">
                          <QRCodeCanvas 
                            id="qr-canvas"
                            value={`${window.location.origin}/?sku=${encodeURIComponent(selectedProduct.sku)}`} 
                            size={120} 
                            level="H"
                            includeMargin={true}
                          />
                          <span className="text-[9px] font-bold uppercase tracking-wider text-black/40">Escanear Guía</span>
                        </div>
                        
                        <div className="flex flex-col gap-2 w-full">
                          <button 
                            onClick={() => downloadQR(selectedProduct.sku)}
                            className="text-[10px] bg-siragon-orange text-white px-4 py-2.5 rounded-xl font-bold hover:bg-siragon-orange/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-siragon-orange/20"
                          >
                            <Download size={14} /> Descargar PNG
                          </button>
                          
                          <button 
                            onClick={() => {
                              const imageUrl = `${window.location.origin}/api/qr/${encodeURIComponent(selectedProduct.sku)}`;
                              navigator.clipboard.writeText(imageUrl);
                              alert("URL de imagen copiada. Úsala en la web de Síragon.");
                            }}
                            className="text-[10px] bg-white text-black/60 px-4 py-2.5 rounded-xl font-bold hover:bg-black/5 transition-all w-full flex items-center justify-center gap-2 border border-black/10"
                            title="Copiar URL para usar en otros sitios"
                          >
                            <LinkIcon size={14} /> Copiar URL Imagen
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="border border-black/10 rounded-2xl p-6 bg-white">
                      <h4 className="text-sm font-bold text-black flex items-center gap-2 mb-4"><FileText size={16} className="text-siragon-orange" /> Guías de Instalación</h4>
                      {selectedProduct.guideMedia.length === 0 ? <p className="text-xs text-black/40">No hay guías registradas.</p> : (
                        <div className="grid grid-cols-2 gap-3">
                          {selectedProduct.guideMedia.map((media, i) => (
                            <div key={i} onClick={() => (media.base64 || media.url) && setPreviewMedia(media)} className="border border-black/10 rounded-xl overflow-hidden bg-black/5 cursor-pointer hover:border-siragon-orange transition-all group relative">
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10 flex items-center justify-center">
                                {(media.base64 || media.url) && <Search className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />}
                              </div>
                              {media.base64 || media.url ? (
                                media.type === "image" ? <img src={media.url || media.base64} alt={media.name} className="w-full h-24 object-cover" /> : <video src={media.url || media.base64} className="w-full h-24 object-cover" />
                              ) : (
                                <div className="w-full h-24 flex items-center justify-center bg-black/5 text-black/20">{media.type === "image" ? <ImageIcon size={24} /> : <Video size={24} />}</div>
                              )}
                              <div className="p-2 text-[10px] text-black font-medium truncate relative z-20 bg-white/50 backdrop-blur-md">{media.name}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="border border-black/10 rounded-2xl p-6 bg-white">
                      <h4 className="text-sm font-bold text-black flex items-center gap-2 mb-4"><Lightbulb size={16} className="text-siragon-orange" /> Tips Adicionales</h4>
                      {selectedProduct.tipsMedia.length === 0 ? <p className="text-xs text-black/40">No hay tips registrados.</p> : (
                        <div className="grid grid-cols-2 gap-3">
                          {selectedProduct.tipsMedia.map((media, i) => (
                            <div key={i} onClick={() => (media.base64 || media.url) && setPreviewMedia(media)} className="border border-black/10 rounded-xl overflow-hidden bg-black/5 cursor-pointer hover:border-siragon-orange transition-all group relative">
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10 flex items-center justify-center">
                                {(media.base64 || media.url) && <Search className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />}
                              </div>
                              {media.base64 || media.url ? (
                                media.type === "image" ? <img src={media.url || media.base64} alt={media.name} className="w-full h-24 object-cover" /> : <video src={media.url || media.base64} className="w-full h-24 object-cover" />
                              ) : (
                                <div className="w-full h-24 flex items-center justify-center bg-black/5 text-black/20">{media.type === "image" ? <ImageIcon size={24} /> : <Video size={24} />}</div>
                              )}
                              <div className="p-2 text-[10px] text-black font-medium truncate relative z-20 bg-white/50 backdrop-blur-md">{media.name}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <div className="space-y-6">
                  {editForm && (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-black/60 uppercase tracking-wider ml-1">Nombre del equipo</label>
                          <input className="w-full rounded-2xl border border-black/10 bg-white px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-siragon-orange transition-all font-medium text-black shadow-sm" value={editForm.productName} onChange={(e) => setEditForm({ ...editForm, productName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-black/60 uppercase tracking-wider ml-1">SKU / Modelo</label>
                          <input className="w-full rounded-2xl border border-black/10 bg-white px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-siragon-orange transition-all font-medium text-black shadow-sm" value={editForm.sku} onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-black/60 uppercase tracking-wider ml-1">Fotografía Principal</label>
                        <div className="flex items-center gap-4 p-4 border border-black/10 rounded-2xl bg-white shadow-sm">
                          <div className="w-16 h-16 rounded-xl bg-black/5 flex-shrink-0 overflow-hidden border border-black/5 flex items-center justify-center">
                            {editForm.productPhoto?.url || editForm.productPhoto?.base64 ? (
                              <img src={editForm.productPhoto.url || editForm.productPhoto.base64} className="w-full h-full object-cover" />
                            ) : <ImageIcon size={24} className="text-black/20" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-black truncate mb-2">{editForm.productPhoto?.name || "Sin foto"}</p>
                            <label className="cursor-pointer bg-black/5 hover:bg-black hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold text-black transition-all inline-flex items-center gap-1">
                              <Upload size={12} /> Cambiar Imagen
                              <input type="file" accept="image/*" className="hidden" onChange={handleProductPhotoChange} />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="border border-black/10 rounded-2xl p-6 bg-white">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-black flex items-center gap-2"><FileText size={16} className="text-siragon-orange" /> Guías</h4>
                            <label className="cursor-pointer bg-black/5 hover:bg-black hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold text-black flex items-center gap-1 transition-all"><Upload size={12} /> Añadir<input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => handleFileChange(e, "guide")} /></label>
                          </div>
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {editForm.guideMedia.map((media, i) => (
                              <div key={i} className="flex items-center justify-between p-2 bg-black/5 rounded-xl border border-black/5">
                                <span className="text-[10px] text-black font-medium truncate flex-1 mr-2">{media.name}</span>
                                <button onClick={() => setEditForm({ ...editForm, guideMedia: editForm.guideMedia.filter((_, idx) => idx !== i) })} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={12} /></button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border border-black/10 rounded-2xl p-6 bg-white">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-black flex items-center gap-2"><Lightbulb size={16} className="text-siragon-orange" /> Tips</h4>
                            <label className="cursor-pointer bg-black/5 hover:bg-black hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold text-black flex items-center gap-1 transition-all"><Upload size={12} /> Añadir<input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => handleFileChange(e, "tips")} /></label>
                          </div>
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {editForm.tipsMedia.map((media, i) => (
                              <div key={i} className="flex items-center justify-between p-2 bg-black/5 rounded-xl border border-black/5">
                                <span className="text-[10px] text-black font-medium truncate flex-1 mr-2">{media.name}</span>
                                <button onClick={() => setEditForm({ ...editForm, tipsMedia: editForm.tipsMedia.filter((_, idx) => idx !== i) })} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={12} /></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Media Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setPreviewMedia(null)} />
          <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col items-center justify-center">
            <button onClick={() => setPreviewMedia(null)} className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors">
              <X size={32} />
            </button>
            {previewMedia.type === "image" ? (
              <img src={previewMedia.url || previewMedia.base64} alt={previewMedia.name} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
            ) : (
              <video src={previewMedia.url || previewMedia.base64} controls autoPlay className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
            )}
            <p className="mt-4 text-white text-sm font-medium bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-sm">{previewMedia.name}</p>
          </div>
        </div>
      )}
    </main>
  );
}
"use client";

import { Image as ImageIcon } from "lucide-react";

type MediaItem = {
  name: string;
  type: "image" | "video";
  base64?: string;
  url?: string;
};

export default function MediaGallery({ items, title }: { items: MediaItem[], title: string }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mb-16">
      <h3 className="mb-6 flex items-center gap-3 text-2xl font-black tracking-tight text-white">
        <span className="h-8 w-1.5 rounded-full bg-orange-500 shadow-[0_0_22px_rgba(249,115,22,0.5)]" />
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, idx) => (
          <article key={idx} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70 shadow-xl shadow-black/25 transition-all hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-orange-500/10">
            {item.type === "image" ? (
              <div className="relative aspect-video w-full">
                <img
                  src={item.url || item.base64}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute right-4 top-4 rounded-xl bg-black/60 p-2 text-white backdrop-blur-sm">
                  <ImageIcon size={20} />
                </div>
              </div>
            ) : (
              <div className="relative aspect-video w-full bg-black">
                <video
                  src={item.url || item.base64}
                  controls
                  className="h-full w-full object-contain"
                  preload="metadata"
                />
              </div>
            )}
            <div className="p-5">
              <h4 className="truncate font-semibold text-white" title={item.name}>{item.name}</h4>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">{item.type === "image" ? "Imagen" : "Video"}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

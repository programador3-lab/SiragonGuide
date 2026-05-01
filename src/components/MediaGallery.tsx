"use client";

import { PlayCircle, Image as ImageIcon } from "lucide-react";

type MediaItem = {
  name: string;
  type: "image" | "video";
  base64?: string;
  url?: string;
};

export default function MediaGallery({ items, title }: { items: MediaItem[], title: string }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-16">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <div className="w-2 h-8 bg-siragon-orange rounded-full"></div>
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, idx) => (
          <div key={idx} className="group relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 hover:border-siragon-orange/50 transition-all shadow-xl hover:shadow-siragon-orange/20">
            {item.type === "image" ? (
              <div className="aspect-video w-full relative">
                <img
                  src={item.url || item.base64}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm p-2 rounded-xl text-white">
                  <ImageIcon size={20} />
                </div>
              </div>
            ) : (
              <div className="aspect-video w-full relative bg-black">
                <video
                  src={item.url || item.base64}
                  controls
                  className="w-full h-full object-contain"
                  preload="metadata"
                />
              </div>
            )}
            <div className="p-5">
              <h4 className="text-white font-medium truncate" title={item.name}>{item.name}</h4>
              <p className="text-white/50 text-sm mt-1 uppercase tracking-wider">{item.type === "image" ? "Imagen" : "Video"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

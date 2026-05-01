"use client";

import { useEffect, useState } from "react";

export default function DynamicBackground() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#0a0a0a]">
      {/* Fallback de fondo animado por si el video falla */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-siragon-orange via-transparent to-transparent animate-pulse" />
      
      <video
        key="tech-video-final"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        src="https://player.vimeo.com/external/517618080.sd.mp4?s=1240c1598f483c6753177f980131102e3b3c3735&profile_id=165"
        className="absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-1000"
        style={{ transform: 'translateZ(0)', willChange: 'transform' }}
      />
      
      {/* Overlays optimizados para rendimiento y estética */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80" />
      <div className="absolute inset-0 bg-siragon-orange/[0.03]" />
    </div>
  );
}
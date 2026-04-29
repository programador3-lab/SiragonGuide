"use client";

import { useEffect, useState } from "react";

export default function DynamicBackground() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="fixed inset-0 -z-10 bg-black" />;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      {/* Video tecnológico de red (Puedes reemplazar la URL con un video oficial de Síragon) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      >
        <source
          src="https://ak.picdn.net/shutterstock/videos/1027159748/preview/stock-footage-technology-network-background-abstract-connecting-dots-and-lines-network-connection-structure.webm"
          type="video/webm"
        />
        <source
          src="https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
          type="video/mp4"
        />
      </video>
      
      {/* Overlays para oscurecer y dar un tono Síragon */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 pointer-events-none" />
      <div className="absolute inset-0 bg-siragon-orange/10 mix-blend-overlay pointer-events-none" />
    </div>
  );
}
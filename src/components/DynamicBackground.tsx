"use client";

import { useEffect, useState } from "react";

export default function DynamicBackground() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-zinc-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_700px_420px_at_30%_45%,rgba(249,115,22,0.18),transparent_70%)]" />

      <video
        key="tech-video-final"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        src="https://player.vimeo.com/external/517618080.sd.mp4?s=1240c1598f483c6753177f980131102e3b3c3735&profile_id=165"
        className="absolute inset-0 h-full w-full object-cover opacity-65 saturate-125 transition-opacity duration-1000"
        style={{ transform: "translateZ(0)" }}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-900/35 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-zinc-900/75" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />
    </div>
  );
}

"use client";

import { CSSProperties, ReactNode, useRef, useState } from "react";

type CometCardProps = {
  children: ReactNode;
  className?: string;
};

type CardStyle = CSSProperties & {
  "--comet-x"?: string;
  "--comet-y"?: string;
};

export function CometCard({ children, className = "" }: CometCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CardStyle>({
    transform: "perspective(900px) rotateX(0deg) rotateY(0deg)",
    "--comet-x": "50%",
    "--comet-y": "50%",
  });

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 14;
    const rotateX = ((0.5 - y / rect.height) * 14);

    setStyle({
      transform: `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`,
      "--comet-x": `${x}px`,
      "--comet-y": `${y}px`,
    });
  };

  const handleLeave = () => {
    setStyle({
      transform: "perspective(900px) rotateX(0deg) rotateY(0deg)",
      "--comet-x": "50%",
      "--comet-y": "50%",
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`group/comet relative inline-block transform-gpu transition-transform duration-200 ease-out will-change-transform ${className}`}
      style={style}
    >
      <div className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300 group-hover/comet:opacity-100">
        <div className="absolute inset-0 rounded-[22px] bg-[radial-gradient(220px_circle_at_var(--comet-x)_var(--comet-y),rgba(249,115,22,0.35),transparent_62%)]" />
      </div>
      {children}
    </div>
  );
}

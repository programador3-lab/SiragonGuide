"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, Sparkles } from "lucide-react";

export default function ProductSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?sku=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-9">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/70 to-transparent" />

      <h2 className="max-w-2xl text-center text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
        Tu <span className="text-gradient-orange">guía Síragon</span>
      </h2>
      <p className="mt-5 max-w-xl text-center text-sm leading-6 text-zinc-400 md:text-base">
        Ingresa el nombre del equipo o el modelo para ver guías oficiales de instalación, videos y tips de configuración.
      </p>

      <form onSubmit={handleSearch} className="relative mt-8 w-full">
        <div className="relative flex items-center">
          <Search className="absolute left-5 text-zinc-500" size={21} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej. Síragon SP-7000 o SP-7000..."
            className="h-16 w-full rounded-full border border-white/10 bg-zinc-900/50 px-12 pr-14 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-zinc-800/50 transition-all duration-200"
          />
          <button
            type="submit"
            className="absolute right-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/90 hover:bg-orange-500 transition-colors duration-200"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
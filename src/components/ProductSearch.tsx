"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto mt-20 p-8 rounded-3xl bg-black/50 backdrop-blur-md border border-white/10 shadow-2xl">
      <h2 className="text-3xl font-bold text-white mb-4 text-center">Encuentra tus guías de instalación</h2>
      <p className="text-white/60 text-center mb-8">
        Ingresa el nombre de tu equipo o el modelo para ver las guías y tips.
      </p>

      <form onSubmit={handleSearch} className="w-full relative">
        <div className="relative flex items-center">
          <Search className="absolute left-6 text-white/50" size={24} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej. Síragon SP-7000 o SP-7000..."
            className="w-full pl-16 pr-6 py-5 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:bg-white/10 focus:border-siragon-orange transition-all font-medium text-lg"
          />
          <button
            type="submit"
            className="absolute right-3 bg-siragon-orange hover:bg-orange-500 text-white p-3 rounded-full transition-colors"
          >
            <Search size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}

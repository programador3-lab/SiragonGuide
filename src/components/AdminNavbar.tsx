"use client";

import Link from "next/link";
import { LogOut, Plus, PackageSearch, Shield } from "lucide-react";

type AdminNavbarProps = {
  email?: string | null;
  active?: "dashboard" | "productos";
  onSignOut?: () => void;
};

export default function AdminNavbar({ email, active = "dashboard", onSignOut }: AdminNavbarProps) {
  return (
    <header className="fixed left-1/2 top-5 z-50 w-[92%] max-w-5xl -translate-x-1/2">
      <div className="absolute -inset-px rounded-full bg-gradient-to-r from-orange-500/30 via-orange-400/10 to-orange-600/30 blur-md opacity-70" />
      <nav className="relative flex items-center justify-between rounded-full border border-white/[0.08] bg-zinc-950/95 px-2 py-1.5 shadow-2xl shadow-black/60 backdrop-blur-3xl">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <Link href="/" className="group flex items-center gap-2.5 pl-3">
          <img
            src="https://siragon.com/wp-content/uploads/2023/03/Logo-Siragon_Blanco-e1684488951400.png"
            alt="Siragon"
            className="h-8 w-auto transition-all duration-300 group-hover:scale-105 group-hover:brightness-125"
          />
          <span className="hidden items-center gap-1 rounded-full border border-orange-500/25 bg-orange-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-orange-400 sm:inline-flex">
            <Shield size={8} /> Admin
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <Link
            href="/dashboard"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200 ${
              active === "dashboard"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/40"
                : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <Plus size={14} />
            Agregar
          </Link>
          <Link
            href="/productos"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200 ${
              active === "productos"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/40"
                : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <PackageSearch size={14} />
            Productos
          </Link>
        </div>

        <div className="flex items-center gap-2 pr-1">
          {email && (
            <span className="hidden max-w-[200px] truncate rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-zinc-500 lg:inline-block">
              {email}
            </span>
          )}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-all hover:bg-red-500/15 hover:text-red-400 md:w-auto md:gap-2 md:px-4 md:text-xs md:font-bold"
              aria-label="Salir"
            >
              <LogOut size={15} />
              <span className="hidden md:inline">Salir</span>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}

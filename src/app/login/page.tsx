"use client";

import { signIn } from "next-auth/react";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");



    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Credenciales inválidas");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <main className="min-h-screen flex flex-col font-sans overflow-hidden bg-white text-black relative">
      {/* Background Overlays */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-siragon-orange/10 via-transparent to-transparent opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-black/5 via-transparent to-transparent" />
      </div>

      <nav className="sticky top-0 z-50 bg-black border-b border-white/10 shadow-sm w-full">
        <div className="flex items-center justify-between px-8 h-[45px] max-w-7xl mx-auto w-full">
          {/* Síragon Official Links */}
          <div className="flex items-center gap-8">
            <a href="https://siragon.com">
              <img src="https://siragon.com/wp-content/uploads/2023/03/Logo-Siragon_Blanco-e1684488951400.png" alt="Síragon" className="h-6 w-auto" />
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/productos"
              className="rounded-xl bg-siragon-orange border border-transparent px-4 py-2 text-xs font-bold text-white hover:bg-siragon-orange-dark shadow-sm transition-all"
            >
              Catálogo Local
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 relative z-10 w-full py-12">
        <div className="relative bg-white p-10 md:p-14 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-lg border border-black/10 group">
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-black text-white shadow-lg">
            <LockKeyhole size={32} />
          </div>
          <h2 className="text-3xl font-light tracking-tight text-black mb-2">
            Iniciar <span className="font-bold text-siragon-orange">Sesión</span>
          </h2>
        </div>

        {error && (
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 relative">
            <label className="text-xs font-bold text-black/60 uppercase tracking-wider ml-1">
              Correo Electrónico
            </label>
            <div className="relative flex items-center">
              <Mail size={18} className="absolute left-5 text-black/40 peer-focus:text-siragon-orange transition-colors" />
              <input
                type="email"
                className="peer w-full px-5 py-4 pl-12 rounded-2xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-siragon-orange focus:border-transparent transition-all placeholder:text-black/30 font-medium text-black shadow-sm"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2 relative">
            <label className="text-xs font-bold text-black/60 uppercase tracking-wider ml-1">
              Contraseña
            </label>
            <div className="relative flex items-center">
              <LockKeyhole size={18} className="absolute left-5 text-black/40 peer-focus:text-siragon-orange transition-colors" />
              <input
                type="password"
                className="peer w-full px-5 py-4 pl-12 rounded-2xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-siragon-orange focus:border-transparent transition-all placeholder:text-black/30 font-medium text-black shadow-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 w-full bg-black hover:bg-siragon-orange text-white font-bold py-4 rounded-2xl transition-all shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_10px_20px_rgba(238,116,2,0.3)] flex justify-center items-center gap-2 disabled:opacity-70"
          >
            Ingresar al Panel
          </button>
        </form>
        </div>
      </div>
    </main>
  );
}

"use client";

import { signIn } from "next-auth/react";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail, AlertCircle, Shield } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Credenciales inválidas. Verifica tu email y contraseña.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 font-sans">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_900px_700px_at_50%_-10%,rgba(249,115,22,0.13),transparent_65%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_600px_400px_at_80%_90%,rgba(249,115,22,0.06),transparent_70%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.018\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

      {/* Logo top */}
      <div className="absolute left-1/2 top-8 -translate-x-1/2">
        <a href="https://siragon.com" target="_blank" rel="noopener noreferrer">
          <img
            src="https://siragon.com/wp-content/uploads/2023/03/Logo-Siragon_Blanco-e1684488951400.png"
            alt="Síragon"
            className="h-8 w-auto opacity-60 transition-opacity hover:opacity-100"
          />
        </a>
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md px-6">
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-orange-500/20 via-orange-500/5 to-transparent blur-xl" />
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-900/80 p-10 shadow-2xl shadow-black/60 backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/20 to-orange-600/10 shadow-lg shadow-orange-500/10">
              <Shield size={26} className="text-orange-400" />
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.08] p-4 text-sm text-red-400">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="ml-1 text-[11px] font-bold uppercase tracking-widest text-zinc-600">
                Correo electrónico
              </label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-4 text-zinc-600" />
                <input
                  type="email"
                  className="w-full rounded-xl border border-white/[0.07] bg-zinc-950/60 py-4 pl-11 pr-5 text-sm font-medium text-zinc-100 outline-none transition-all placeholder:text-zinc-700 hover:border-white/15 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                  placeholder="admin@siragon.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-[11px] font-bold uppercase tracking-widest text-zinc-600">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <LockKeyhole size={16} className="absolute left-4 text-zinc-600" />
                <input
                  type="password"
                  className="w-full rounded-xl border border-white/[0.07] bg-zinc-950/60 py-4 pl-11 pr-5 text-sm font-medium text-zinc-100 outline-none transition-all placeholder:text-zinc-700 hover:border-white/15 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 py-4 text-sm font-bold text-white shadow-xl shadow-orange-500/25 transition-all hover:from-orange-400 hover:to-orange-500 hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Verificando...
                </>
              ) : (
                "Ingresar al Panel"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[11px] text-zinc-700">
            Síragon Pague · Panel de administración interno
          </p>
        </div>
      </div>
    </main>
  );
}

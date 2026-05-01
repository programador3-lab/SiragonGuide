import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/components/NextAuthProvider";

import { Headphones } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Siragon - Guías de Productos",
  description: "Centro de asistencia y ayuda de Siragon",
  icons: {
    icon: "https://siragon.com/wp-content/uploads/2022/03/FAVICON-S_Mesa-de-trabajo-1-hhhhhhhhhhde-trabajo-1-copia-12.png",
    shortcut: "https://siragon.com/wp-content/uploads/2022/03/FAVICON-S_Mesa-de-trabajo-1-hhhhhhhhhhde-trabajo-1-copia-12.png",
    apple: "https://siragon.com/wp-content/uploads/2022/03/FAVICON-S_Mesa-de-trabajo-1-hhhhhhhhhhde-trabajo-1-copia-12.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <NextAuthProvider>
          {children}

          {/* Botón de Soporte Flotante */}
          <a
            href="https://siragon.com/contactanos/"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 bg-siragon-orange text-white rounded-full font-bold shadow-2xl hover:scale-110 hover:shadow-siragon-orange/40 transition-all group"
            title="Soporte Síragon"
          >
            <Headphones size={24} className="group-hover:animate-bounce" />
            <span className="hidden md:inline"></span>
          </a>
        </NextAuthProvider>
      </body>
    </html>
  );
}

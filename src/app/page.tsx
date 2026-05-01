import { Monitor, Lightbulb, HeadphonesIcon, Check, ArrowRight } from "lucide-react";
import DynamicBackground from "@/components/DynamicBackground";
import ProductSearch from "@/components/ProductSearch";
import MediaGallery from "@/components/MediaGallery";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

const productsMenu = [
  { label: "Store", href: "https://siragon.com/productos" },
  {
    label: "Smart TV",
    href: "https://siragon.com/smart-tv/",
    badge: "Nuevo",
  },
  {
    label: "Hogar",
    href: "https://siragon.com/hogar-2/",
    children: [
      { label: "Aire acondicionado", href: "https://siragon.com/hogar-2/#air" },
      { label: "Lavadoras", href: "https://siragon.com/hogar-2/#lav" },
      { label: "Congeladores", href: "https://siragon.com/hogar-2/#con" },
      { label: "Neveras", href: "https://siragon.com/hogar-2/#nev" },
      { label: "Topes", href: "https://siragon.com/hogar-2/#top" },
      { label: "Cocina", href: "https://siragon.com/hogar-2/#coc" },
    ],
  },
  { label: "Smartphones", href: "https://siragon.com/smartphones/" },
  { label: "Computación", href: "https://siragon.com/computacion/" },
  { label: "Sonido", href: "https://siragon.com/sonido/" },
];

const mainLinks = [
  { label: "Home", href: "https://siragon.com/" },
  { label: "Contactanos", href: "https://siragon.com/contactanos/" },
  { label: "Innovación", href: "https://siragon.com/lo-ultimo-en-innovacion-2/" },
];

type PageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

const getQueryValue = (
  params: PageProps["searchParams"],
  ...keys: string[]
) => {
  for (const key of keys) {
    const value = params?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (Array.isArray(value) && value.length > 0 && value[0]?.trim()) return value[0].trim();
  }
  return "";
};

export default async function Home({ searchParams }: PageProps) {
  const searchTerm = getQueryValue(searchParams, "sku", "producto", "product", "nombre", "name");

  if (searchTerm) {
    // Redirigir automáticamente a la nueva página dedicada
    redirect(`/guia/${encodeURIComponent(searchTerm)}`);
  }

  const navBar = (
    <nav className="sticky top-0 z-50 bg-black/70 backdrop-blur-md border-b border-white/10">
      <div className="relative flex items-center justify-center gap-6 px-8 py-0 h-[45px] max-w-7xl mx-auto w-full">
        <a href="https://siragon.com" className="flex items-center gap-2 group cursor-pointer shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-white blur-lg opacity-10 group-hover:opacity-20 transition-opacity" />
            <img
              fetchPriority="high"
              src="https://siragon.com/wp-content/uploads/2023/03/Logo-Siragon_Blanco-e1684488951400.png"
              alt="Síragon"
              className="relative h-7 w-auto object-contain m-[2px]"
            />
          </div>
        </a>
        <div className="flex h-full items-center gap-6">
          <a href="https://siragon.com/" className="inline-flex h-full items-center justify-center text-[11px] leading-none min-w-8 text-white transition-colors" aria-current="page">Home</a>
          <div className="relative group/menu inline-flex h-full items-center">
            <a href="#" className="inline-flex h-full items-center justify-center text-[11px] leading-none min-w-8 text-white/85 hover:text-white transition-colors">Productos</a>
            <ul className="absolute left-0 top-full mt-2 hidden min-w-[220px] rounded-md border border-white/10 bg-black/95 p-2 shadow-xl group-hover/menu:block">
              {productsMenu.map((item) => (
                <li key={item.label} className="relative group/submenu">
                  <a href={item.href} className="flex items-center justify-between gap-2 rounded px-3 py-2 text-[11px] text-white/85 hover:bg-white/10 hover:text-white transition-colors">
                    <span>{item.label}</span>
                    {item.badge && <span className="rounded bg-siragon-orange px-1.5 py-0.5 text-[9px] font-semibold text-white">{item.badge}</span>}
                  </a>
                  {item.children && (
                    <ul className="absolute left-full top-0 ml-2 hidden min-w-[200px] rounded-md border border-white/10 bg-black/95 p-2 shadow-xl group-hover/submenu:block">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <a href={child.href} className="block rounded px-3 py-2 text-[11px] text-white/85 hover:bg-white/10 hover:text-white transition-colors">{child.label}</a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
          {mainLinks.slice(1).map((link) => (
            <a key={link.label} href={link.href} className="inline-flex h-full items-center justify-center text-[11px] leading-none min-w-8 text-white/85 hover:text-white transition-colors">{link.label}</a>
          ))}
        </div>
      </div>
    </nav>
  );

  return (
    <main className="relative min-h-screen text-white font-sans selection:bg-siragon-orange selection:text-white overflow-hidden">
      <DynamicBackground />
      {navBar}
      <section className="relative max-w-7xl mx-auto px-8 py-24 flex flex-col items-center min-h-[calc(100vh-45px)]">
        <ProductSearch />
        
        {searchTerm && (
          <div className="mt-8 px-6 py-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl text-center max-w-2xl">
            No encontramos guías para <strong>"{searchTerm}"</strong>. Por favor verifica el modelo o usa el buscador.
          </div>
        )}
      </section>
    </main>
  );
}
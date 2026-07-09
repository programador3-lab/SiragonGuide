const productsMenu = [
  { label: "Store", href: "https://siragon.com/productos" },
  { label: "Smart TV", href: "https://siragon.com/smart-tv/", badge: "Nuevo" },
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
  { label: "Computacion", href: "https://siragon.com/computacion/" },
  { label: "Sonido", href: "https://siragon.com/sonido/" },
];

const navLinks = [
  { label: "Inicio", href: "https://siragon.com/" },
  { label: "Novedades", href: "https://siragon.com/lo-ultimo-en-innovacion-2/" },
  { label: "Contacto", href: "https://siragon.com/contactanos/" },
];

export default function GuiaNavbar() {
  return (
    <header className="fixed left-1/2 top-5 z-50 w-[92%] max-w-4xl -translate-x-1/2">
      <nav className="flex items-center justify-between rounded-full border border-zinc-800/70 bg-zinc-950/80 px-2 py-1.5 shadow-xl shadow-black/25 backdrop-blur-2xl">
        <a href="https://siragon.com" className="group flex items-center gap-2 pl-3">
          <img
            fetchPriority="high"
            src="https://siragon.com/wp-content/uploads/2023/03/Logo-Siragon_Blanco-e1684488951400.png"
            alt="Siragon"
            className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
          />
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-full px-4 py-2 text-[13px] font-medium text-zinc-400 transition-all duration-200 hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </a>
          ))}

          <div className="group/menu relative">
            <a
              href="https://siragon.com/productos"
              className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-[13px] font-medium text-zinc-400 transition-all duration-200 hover:bg-white/5 hover:text-orange-400 group-hover/menu:bg-white/5 group-hover/menu:text-orange-400"
            >
              Productos
              <svg className="h-3 w-3 transition-transform duration-200 group-hover/menu:rotate-180" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </a>

            <div className="invisible absolute left-1/2 top-full mt-4 w-[520px] -translate-x-1/2 rounded-2xl border border-zinc-800 bg-zinc-950/95 p-4 opacity-0 shadow-2xl shadow-black/40 backdrop-blur-xl transition-all duration-200 group-hover/menu:visible group-hover/menu:opacity-100">
              <div className="grid grid-cols-2 gap-1">
                {productsMenu.map((item) => (
                  <div key={item.label} className="relative">
                    <a
                      href={item.href}
                      className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5 hover:text-orange-400"
                    >
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-400">
                          {item.badge}
                        </span>
                      )}
                    </a>

                    {item.children && (
                      <div className="mt-1 grid grid-cols-2 gap-1 px-2 pb-2">
                        {item.children.map((child) => (
                          <a
                            key={child.label}
                            href={child.href}
                            className="rounded-lg px-2 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
                          >
                            {child.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

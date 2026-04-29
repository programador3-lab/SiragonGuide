import { Monitor, Lightbulb, HeadphonesIcon, Check, ArrowRight } from "lucide-react";
import DynamicBackground from "@/components/DynamicBackground";

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

export default function Home({ searchParams }: PageProps) {
  const productName = decodeURIComponent(
    getQueryValue(searchParams, "producto", "product", "nombre", "name")
  );
  const productImage = decodeURIComponent(
    getQueryValue(searchParams, "imagen", "image", "img", "foto")
  );
  const installPanelImage =
    productImage ||
    "https://siragon.com/wp-content/uploads/2023/03/Logo-Siragon_Blanco-e1684488951400.png";

  const cards = [
    {
      title: "Instalación",
      desc: productName
        ? `Panel de instalación para ${productName}.`
        : "Panel de instalación del producto seleccionado.",
      icon: <Monitor size={32} />,
      items: [],
      dark: false,
      image: installPanelImage,
      imageAlt: productName
        ? `Panel de instalación de ${productName}`
        : "Panel de instalación del producto",
    },
    {
      title: "Insights",
      desc: "Maximiza la vida útil y el rendimiento de tus activos tecnológicos.",
      icon: <Lightbulb size={32} />,
      items: [],
      dark: false,
    },
    {
      title: "Soporte",
      desc: "Atención personalizada para casos complejos y alta fidelidad.",
      icon: <HeadphonesIcon size={32} />,
      items: [],
      dark: true,
    },
  ];

  return (
    <main className="relative min-h-screen text-white font-sans selection:bg-siragon-orange selection:text-white overflow-hidden">

      { }
      <DynamicBackground />

      { }
      <nav className="sticky top-0 z-50 bg-black/70 backdrop-blur-md border-b border-white/10">
        <div className="relative flex items-center justify-center gap-6 px-8 py-0 h-[45px] max-w-7xl mx-auto w-full">
          <a href="https://siragon.com" className="flex items-center gap-2 group cursor-pointer shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-white blur-lg opacity-10 group-hover:opacity-20 transition-opacity" />
              <img
                fetchPriority="high"
                src="https://siragon.com/wp-content/uploads/2023/03/Logo-Siragon_Blanco-e1684488951400.png"
                srcSet="https://siragon.com/wp-content/uploads/2023/03/Logo-Siragon_Blanco-e1684488951400.png 4759w, https://siragon.com/wp-content/uploads/2023/03/Logo-Siragon_Blanco-e1684488951400-300x103.png 300w, https://siragon.com/wp-content/uploads/2023/03/Logo-Siragon_Blanco-e1684488951400-600x206.png 600w, https://siragon.com/wp-content/uploads/2023/03/Logo-Siragon_Blanco-e1684488951400-64x22.png 64w, https://siragon.com/wp-content/uploads/2023/03/Logo-Siragon_Blanco-e1684488951400-1024x351.png 1024w, https://siragon.com/wp-content/uploads/2023/03/Logo-Siragon_Blanco-e1684488951400-768x263.png 768w, https://siragon.com/wp-content/uploads/2023/03/Logo-Siragon_Blanco-e1684488951400-1536x526.png 1536w, https://siragon.com/wp-content/uploads/2023/03/Logo-Siragon_Blanco-e1684488951400-2048x701.png 2048w"
                sizes="(max-width: 4759px) 100vw, 4759px"
                alt="Síragon"
                className="relative h-7 w-auto object-contain m-[2px]"
              />
            </div>
          </a>
          <div className="flex h-full items-center gap-6">
            <a
              href="https://siragon.com/"
              className="inline-flex h-full items-center justify-center text-[11px] leading-none min-w-8 text-white transition-colors"
              aria-current="page"
            >
              Home
            </a>

            <div className="relative group/menu inline-flex h-full items-center">
              <a
                href="#"
                className="inline-flex h-full items-center justify-center text-[11px] leading-none min-w-8 text-white/85 hover:text-white transition-colors"
              >
                Productos
              </a>
              <ul className="absolute left-0 top-full mt-2 hidden min-w-[220px] rounded-md border border-white/10 bg-black/95 p-2 shadow-xl group-hover/menu:block">
                {productsMenu.map((item) => (
                  <li key={item.label} className="relative group/submenu">
                    <a
                      href={item.href}
                      className="flex items-center justify-between gap-2 rounded px-3 py-2 text-[11px] text-white/85 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="rounded bg-siragon-orange px-1.5 py-0.5 text-[9px] font-semibold text-white">
                          {item.badge}
                        </span>
                      )}
                    </a>
                    {item.children && (
                      <ul className="absolute left-full top-0 ml-2 hidden min-w-[200px] rounded-md border border-white/10 bg-black/95 p-2 shadow-xl group-hover/submenu:block">
                        {item.children.map((child) => (
                          <li key={child.label}>
                            <a
                              href={child.href}
                              className="block rounded px-3 py-2 text-[11px] text-white/85 hover:bg-white/10 hover:text-white transition-colors"
                            >
                              {child.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {mainLinks.slice(1).map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="inline-flex h-full items-center justify-center text-[11px] leading-none min-w-8 text-white/85 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-8 pt-24 pb-32">
      </section>

      {/* Cards Section */}
      <section className="max-w-7xl mx-auto px-8 grid md:grid-cols-3 gap-8 pb-20">
        {cards.map((card, idx) => (
          <div key={idx} className={`group relative w-[400px] h-[500px] rounded-[40px] p-10 transition-all duration-500 hover:-translate-y-3 ${card.dark
            ? 'bg-black/70 backdrop-blur-xl text-white shadow-2xl shadow-siragon-orange/10 border border-white/10'
            : 'bg-white/85 backdrop-blur-xl text-black border border-white shadow-xl hover:shadow-siragon-orange/20'
            }`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg transition-transform group-hover:scale-110 ${card.dark ? 'bg-siragon-orange text-white' : 'bg-siragon-orange/15 text-siragon-orange'
              }`}>
              {card.icon}
            </div>
            <h3 className="text-2xl font-bold mb-4">{card.title}</h3>
            <p className={`mb-8 leading-relaxed ${card.dark ? 'text-slate-300' : 'text-slate-600'}`}>
              {card.desc}
            </p>
            <ul className="space-y-4 mb-10">
              {card.items.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-semibold">
                  <Check size={16} className="text-siragon-orange" strokeWidth={3} />
                  {item}
                </li>
              ))}
            </ul>
            <button className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${card.dark
              ? 'bg-siragon-orange hover:bg-orange-400 text-white'
              : 'bg-black text-white hover:bg-siragon-orange'
              }`}>
              Explorar <ArrowRight size={18} />
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}
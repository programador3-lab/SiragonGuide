import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import DynamicBackground from "@/components/DynamicBackground";
import GuiaNavbar from "@/components/GuiaNavbar";
import MediaGallery from "@/components/MediaGallery";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

type PageProps = {
  params: { sku: string };
};

type MediaItem = {
  name: string;
  type: "image" | "video";
  url?: string;
  base64?: string;
};

export default async function GuiaPage({ params }: PageProps) {
  const { sku } = params;

  const product = await prisma.productGuide.findFirst({
    where: { sku },
  });

  if (!product) {
    return notFound();
  }

  const productPhoto = product.productPhoto as any;
  const guideMedia = (product.guideMedia as unknown as MediaItem[]) || [];
  const tipsMedia = (product.tipsMedia as unknown as MediaItem[]) || [];
  const mainImage = productPhoto?.url || productPhoto?.base64 || "https://siragon.com/wp-content/uploads/2023/03/Logo-Siragon_Blanco-e1684488951400.png";

  return (
    <main className="relative min-h-screen overflow-x-hidden font-sans text-white selection:bg-orange-500 selection:text-white">
      <DynamicBackground />
      <GuiaNavbar />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-36 md:px-8">
        <section className="mb-20 grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="mx-auto flex w-full justify-center lg:justify-start">
            <CardContainer className="inter-var">
              <CardBody className="group/card relative h-auto w-[min(24rem,88vw)] rounded-xl border border-black/[0.1] bg-gray-50 p-6 shadow-2xl shadow-black/20 dark:border-white/[0.2] dark:bg-black dark:hover:shadow-2xl dark:hover:shadow-orange-500/[0.12]">
                <CardItem
                  translateZ="50"
                  className="text-xl font-bold text-neutral-700 dark:text-white"
                >
                  {product.productName}
                </CardItem>
                <CardItem
                  as="p"
                  translateZ="60"
                  className="mt-2 max-w-sm text-sm text-neutral-500 dark:text-neutral-300"
                >
                  Modelo {product.sku}
                </CardItem>
                <CardItem translateZ="100" className="mt-4 w-full">
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white dark:bg-neutral-950">
                    <img
                      src={mainImage}
                      height="1000"
                      width="1000"
                      className="absolute inset-0 h-full w-full rounded-xl object-contain p-8 transition-shadow group-hover/card:shadow-xl"
                      alt={product.productName}
                    />
                  </div>
                </CardItem>
                <div className="mt-8 flex items-center justify-between">
                  <CardItem
                    translateZ={20}
                    as="span"
                    className="rounded-xl px-4 py-2 text-xs font-normal text-neutral-600 dark:text-white"
                  >
                    Guia oficial
                  </CardItem>
                  <CardItem
                    translateZ={20}
                    as="span"
                    className="rounded-xl bg-black px-4 py-2 text-xs font-bold text-white dark:bg-white dark:text-black"
                  >
                    #{product.sku}
                  </CardItem>
                </div>
              </CardBody>
            </CardContainer>
          </div>

          <div className="text-center lg:text-left">
            <h1 className="mt-5 text-5xl font-black leading-[1.05] tracking-tight text-white md:text-7xl">
              {product.productName}
            </h1>
            <p className="mt-5 text-sm font-bold uppercase tracking-[0.22em] text-zinc-500">
              Modelo {product.sku}
            </p>
            <div className="mt-8 max-w-2xl border-orange-500/70 lg:border-l lg:pl-7">
              <p className="text-lg leading-8 text-zinc-300 md:text-xl">
                Explora guías oficiales y configuraciones optimizadas para tu equipo. Todo esta preparado para ayudarte desde la instalación hasta los primeros ajustes.
              </p>
            </div>
          </div>
        </section>

        <div className="space-y-16">
          <MediaGallery items={guideMedia} title="Guias de instalacion" />
          <MediaGallery items={tipsMedia} title="Tips adicionales" />
        </div>
      </div>
    </main>
  );
}

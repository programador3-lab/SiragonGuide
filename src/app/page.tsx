import DynamicBackground from "@/components/DynamicBackground";
import GuiaNavbar from "@/components/GuiaNavbar";
import ProductSearch from "@/components/ProductSearch";
import { redirect } from "next/navigation";

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

type PageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function Home({ searchParams }: PageProps) {
  const searchTerm = getQueryValue(searchParams, "sku", "producto", "product", "nombre", "name");

  if (searchTerm) {
    redirect(`/guia/${encodeURIComponent(searchTerm)}`);
  }

  return (
    <main className="relative min-h-screen overflow-hidden font-sans text-white selection:bg-orange-500 selection:text-white">
      <DynamicBackground />
      <GuiaNavbar />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center px-6 pb-16 pt-36 md:px-8">
        <div className="mb-9 text-center">
        </div>

        <ProductSearch />
      </section>
    </main>
  );
}

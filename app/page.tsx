import { Suspense } from "react";
import { Storefront } from "@/components/storefront";
import {
  getAvailableCategories,
  getCatalogProducts,
} from "@/lib/catalog-data";
import { filterProducts } from "@/lib/catalog";
import { getResolvedHomeContent } from "@/lib/home-data";

type HomeProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent searchParams={searchParams} />
    </Suspense>
  );
}

async function HomeContent({ searchParams }: HomeProps) {
  const resolvedSearchParams = await searchParams;
  const initialSearchQuery = resolvedSearchParams?.q?.trim() ?? "";
  const [products, availableCategories, homeContent] = await Promise.all([
    getCatalogProducts(),
    getAvailableCategories(),
    getResolvedHomeContent(),
  ]);
  const initialCategory = availableCategories[0] ?? "Destacados";
  const shouldDeferFullCatalog = initialSearchQuery.length === 0;
  const initialProducts = shouldDeferFullCatalog
    ? filterProducts(products, initialCategory, "")
    : products;
  return (
    <Storefront
      initialProducts={initialProducts}
      availableCategories={availableCategories}
      homeContent={homeContent}
      initialCategory={initialCategory}
      initialSearchQuery={initialSearchQuery}
      catalogUrl={shouldDeferFullCatalog ? "/api/catalog" : null}
      hasCompleteCatalog={!shouldDeferFullCatalog}
    />
  );
}

function HomeFallback() {
  return (
    <div className="pb-28">
      <div className="border-b border-olive/10 bg-olive">
        <div className="container-shell py-2">
          <div className="h-3 w-72 max-w-[80%] rounded-full bg-white/20" />
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-olive/10 bg-background/88 backdrop-blur-xl">
        <div className="container-shell py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="h-12 w-16 rounded-2xl bg-white/65 sm:h-16 sm:w-24" />
            <div className="hidden h-11 flex-1 rounded-full bg-white/60 lg:block" />
            <div className="flex items-center gap-2">
              <div className="h-11 w-11 rounded-full bg-white/60" />
              <div className="h-11 w-11 rounded-full bg-white/60 lg:hidden" />
              <div className="hidden h-11 w-28 rounded-full bg-white/60 lg:block" />
            </div>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section className="container-shell pt-5 pb-8 sm:pt-7 sm:pb-10">
          <div className="surface-panel organic-outline hero-garden overflow-hidden rounded-[2.25rem] px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
            <div className="rounded-[1.8rem] bg-white/55 p-4 shadow-[0_20px_36px_rgba(111,127,79,0.12)]">
              <div className="aspect-[1.9/1] rounded-[1.4rem] bg-[linear-gradient(110deg,rgba(255,255,255,0.75),rgba(247,241,229,0.96),rgba(255,255,255,0.75))] sm:aspect-[2.2/1] lg:aspect-[2.55/1]" />
            </div>
          </div>
        </section>

        <section className="container-shell pb-10">
          <div className="h-6 w-40 rounded-full bg-white/60" />
          <div className="mt-4 h-12 w-72 max-w-[90%] rounded-[1.4rem] bg-white/65" />
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className="organic-outline card-shadow overflow-hidden rounded-[1.35rem] bg-card sm:rounded-[1.9rem]"
              >
                <div className="aspect-[0.95/1] bg-[linear-gradient(135deg,rgba(221,232,207,0.62),rgba(255,255,255,0.96),rgba(232,216,191,0.56))] sm:aspect-[1.28/1]" />
                <div className="p-3 sm:p-5">
                  <div className="h-5 w-3/4 rounded-full bg-white/70" />
                  <div className="mt-3 h-8 w-28 rounded-full bg-white/75" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

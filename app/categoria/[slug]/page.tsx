import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogListingStorefront } from "@/components/catalog-listing-storefront";
import {
  getCatalogCategories,
  getCatalogCategoryBySlug,
  getCatalogProducts,
} from "@/lib/catalog-data";
import { getResolvedProductCategories } from "@/lib/catalog";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return (await getCatalogCategories()).map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCatalogCategoryBySlug(slug);

  if (!category) {
    return { title: "Categoría no encontrada · Tierra Sana" };
  }

  return {
    title: `${category.name} · Tierra Sana`,
    description: `Comprá productos de ${category.name} en Tierra Sana.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [category, categories, catalogProducts] = await Promise.all([
    getCatalogCategoryBySlug(slug),
    getCatalogCategories(),
    getCatalogProducts(),
  ]);

  if (!category) notFound();

  const products = catalogProducts.filter((product) =>
    getResolvedProductCategories(product).includes(category.name),
  );

  return (
    <CatalogListingStorefront
      title={category.name}
      products={products}
      categories={categories}
      activeCategory={category.name}
      backHref="/"
      backLabel="Inicio"
    />
  );
}

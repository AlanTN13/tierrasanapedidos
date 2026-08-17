import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductStorefront } from "@/components/product-storefront";
import {
  getCatalogCategories,
  getCatalogProductBySlug,
  getCatalogProducts,
} from "@/lib/catalog-data";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return (await getCatalogProducts()).map((product) => ({ slug: product.id }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);

  if (!product) {
    return { title: "Producto no encontrado · Tierra Sana" };
  }

  return {
    title: `${product.nombre} · Tierra Sana`,
    description: product.descripcion,
    openGraph: {
      title: `${product.nombre} · Tierra Sana`,
      description: product.descripcion,
      images: [{ url: product.imagen, alt: product.nombre }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, categories] = await Promise.all([
    getCatalogProductBySlug(slug),
    getCatalogCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return <ProductStorefront product={product} categories={categories} />;
}

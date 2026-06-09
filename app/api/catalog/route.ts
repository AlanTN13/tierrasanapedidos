import { NextResponse } from "next/server";
import { getCatalogProducts } from "@/lib/catalog-data";

export async function GET() {
  const products = await getCatalogProducts();

  return NextResponse.json(
    { products },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=86400",
      },
    },
  );
}

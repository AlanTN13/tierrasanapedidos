import { NextResponse } from "next/server";
import { getSales } from "@/lib/admin-operations";
import { requireAdminUser } from "@/lib/supabase/admin";

export async function GET() {
  await requireAdminUser();
  const sales = await getSales();

  const header = [
    "sale_id",
    "sold_at",
    "customer_name",
    "product_name",
    "presentation_label",
    "quantity",
    "unit_price_ars",
    "unit_cost_snapshot_ars",
    "line_total_ars",
    "line_margin_ars",
    "notes",
  ];

  const rows = sales.flatMap((sale) =>
    sale.items.map((item) => [
      sale.id,
      sale.soldAt,
      sale.channel ?? "",
      item.productName,
      item.presentationLabel,
      item.quantity,
      item.unitPriceCents / 100,
      item.unitCostSnapshotCents / 100,
      item.lineTotalCents / 100,
      item.lineMarginCents / 100,
      sale.notes ?? "",
    ]),
  );

  return buildCsvResponse("ventas-tierra-sana.csv", [header, ...rows]);
}

function buildCsvResponse(filename: string, rows: Array<Array<string | number>>) {
  const csv = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function escapeCsvCell(value: string | number) {
  const serialized = String(value ?? "");
  const escaped = serialized.replace(/"/g, '""');
  return `"${escaped}"`;
}

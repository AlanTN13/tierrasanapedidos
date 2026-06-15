import { NextResponse } from "next/server";
import { getPurchaseOrders } from "@/lib/admin-operations";
import { requireAdminUser } from "@/lib/supabase/admin";

export async function GET() {
  await requireAdminUser();
  const purchaseOrders = await getPurchaseOrders();

  const header = [
    "purchase_id",
    "supplier_name",
    "reference_number",
    "purchased_at",
    "product_name",
    "presentation_label",
    "quantity",
    "unit_cost_ars",
    "line_total_ars",
    "notes",
  ];

  const rows = purchaseOrders.flatMap((order) =>
    order.items.map((item) => [
      order.id,
      order.supplierName,
      order.referenceNumber ?? "",
      order.purchasedAt,
      item.productName,
      item.presentationLabel,
      item.quantity,
      item.unitCostCents / 100,
      item.lineTotalCents / 100,
      order.notes ?? "",
    ]),
  );

  return buildCsvResponse("compras-tierra-sana.csv", [header, ...rows]);
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

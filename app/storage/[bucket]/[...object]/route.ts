import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

type RouteParams = {
  bucket: string;
  object: string[];
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<RouteParams> },
) {
  const { bucket, object } = await params;
  const objectPath = object.join("/");

  if (!bucket || !objectPath) {
    return NextResponse.json({ error: "Ruta de imagen inválida." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.storage.from(bucket).download(objectPath);

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "No se pudo descargar la imagen." },
      { status: 404 },
    );
  }

  return new Response(data, {
    status: 200,
    headers: {
      "Content-Type": data.type || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

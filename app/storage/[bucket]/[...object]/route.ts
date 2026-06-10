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
  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);

  return NextResponse.redirect(data.publicUrl, 307);
}

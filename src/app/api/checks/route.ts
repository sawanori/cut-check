import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const result = await db.execute(
    "SELECT cut_id, checked, checked_at FROM check_states"
  );

  const checks = result.rows.map((row) => ({
    cut_id: row.cut_id as number,
    checked: !!(row.checked as number),
    checked_at: row.checked_at as string | null,
  }));

  const etag = crypto
    .createHash("md5")
    .update(JSON.stringify(checks))
    .digest("hex");

  const ifNoneMatch = request.headers.get("if-none-match");
  if (ifNoneMatch === etag) {
    return new NextResponse(null, { status: 304 });
  }

  return NextResponse.json(
    { checks, etag },
    { headers: { ETag: etag } }
  );
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { cut_id, checked } = body as { cut_id: number; checked: boolean };

  const checkedAt = checked ? new Date().toISOString() : null;

  await db.execute({
    sql: "UPDATE check_states SET checked = ?, checked_at = ? WHERE cut_id = ?",
    args: [checked ? 1 : 0, checkedAt, cut_id],
  });

  return NextResponse.json({ ok: true });
}

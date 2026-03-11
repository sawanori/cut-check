import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { subject, schedule_block_id } = body as {
    subject: string;
    schedule_block_id: number | null;
  };

  if (!subject.trim()) {
    return NextResponse.json({ error: "内容を入力してください" }, { status: 400 });
  }

  // Get next ID
  const maxResult = await db.execute("SELECT MAX(id) as max_id FROM cuts");
  const nextId = ((maxResult.rows[0].max_id as number) || 0) + 1;

  const isFilmable = schedule_block_id !== null ? 1 : 0;

  await db.execute({
    sql: `INSERT INTO cuts (id, scene_number, cut_number, timecode, duration_seconds, shot_type, subject, material_type, notes, photo_substitute, schedule_block_id, is_filmable, sort_order)
          VALUES (?, 0, 0, '', 0, '', ?, '実写', '', '', ?, ?, ?)`,
    args: [nextId, subject.trim(), schedule_block_id, isFilmable, nextId],
  });

  await db.execute({
    sql: "INSERT INTO check_states (cut_id, checked, checked_at) VALUES (?, 0, NULL)",
    args: [nextId],
  });

  return NextResponse.json({ id: nextId });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, subject, notes, schedule_block_id } = body as {
    id: number;
    subject: string;
    notes: string;
    schedule_block_id: number | null;
  };

  if (!subject.trim()) {
    return NextResponse.json({ error: "内容を入力してください" }, { status: 400 });
  }

  const isFilmable = schedule_block_id !== null ? 1 : 0;

  await db.execute({
    sql: "UPDATE cuts SET subject = ?, notes = ?, schedule_block_id = ?, is_filmable = ? WHERE id = ?",
    args: [subject.trim(), notes.trim(), schedule_block_id, isFilmable, id],
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { id } = body as { id: number };

  await db.execute({ sql: "DELETE FROM check_states WHERE cut_id = ?", args: [id] });
  await db.execute({ sql: "DELETE FROM cuts WHERE id = ?", args: [id] });

  return NextResponse.json({ ok: true });
}

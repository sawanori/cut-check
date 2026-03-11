import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const blocksResult = await db.execute(
    "SELECT * FROM schedule_blocks ORDER BY sort_order"
  );

  const cutsResult = await db.execute(`
    SELECT c.*, cs.checked, cs.checked_at
    FROM cuts c
    LEFT JOIN check_states cs ON c.id = cs.cut_id
    ORDER BY c.sort_order
  `);

  const cuts = cutsResult.rows.map((row) => ({
    id: row.id as number,
    scene_number: row.scene_number as number,
    cut_number: row.cut_number as number,
    timecode: row.timecode as string,
    duration_seconds: row.duration_seconds as number,
    shot_type: row.shot_type as string,
    subject: row.subject as string,
    material_type: row.material_type as string,
    notes: row.notes as string,
    photo_substitute: row.photo_substitute as string,
    schedule_block_id: row.schedule_block_id as number | null,
    is_filmable: !!(row.is_filmable as number),
    sort_order: row.sort_order as number,
    checked: !!(row.checked as number),
    checked_at: row.checked_at as string | null,
  }));

  const blocks = blocksResult.rows.map((row) => ({
    id: row.id as number,
    time_range: row.time_range as string,
    title: row.title as string,
    location: row.location as string,
    sort_order: row.sort_order as number,
    cuts: cuts.filter(
      (c) => c.schedule_block_id === (row.id as number) && c.is_filmable
    ),
  }));

  const postProduction = cuts.filter((c) => !c.is_filmable);

  return NextResponse.json({ blocks, postProduction });
}

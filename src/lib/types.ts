export interface ScheduleBlock {
  id: number;
  time_range: string;
  title: string;
  location: string;
  sort_order: number;
  cuts: Cut[];
}

export interface Cut {
  id: number;
  scene_number: number;
  cut_number: number;
  timecode: string;
  duration_seconds: number;
  shot_type: string;
  subject: string;
  material_type: string;
  notes: string;
  photo_substitute: string;
  schedule_block_id: number | null;
  is_filmable: boolean;
  sort_order: number;
  checked: boolean;
  checked_at: string | null;
}

export interface CheckState {
  cut_id: number;
  checked: boolean;
  checked_at: string | null;
}

export interface ScheduleResponse {
  blocks: ScheduleBlock[];
  postProduction: Cut[];
}

export interface ChecksResponse {
  checks: CheckState[];
  etag: string;
}

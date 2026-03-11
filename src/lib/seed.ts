import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function seed() {
  // Drop existing tables
  await db.execute("DROP TABLE IF EXISTS check_states");
  await db.execute("DROP TABLE IF EXISTS cuts");
  await db.execute("DROP TABLE IF EXISTS schedule_blocks");

  // Create tables
  await db.execute(`
    CREATE TABLE schedule_blocks (
      id INTEGER PRIMARY KEY,
      time_range TEXT NOT NULL,
      title TEXT NOT NULL,
      location TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE cuts (
      id INTEGER PRIMARY KEY,
      scene_number INTEGER NOT NULL,
      cut_number INTEGER NOT NULL,
      timecode TEXT NOT NULL DEFAULT '',
      duration_seconds INTEGER NOT NULL DEFAULT 0,
      shot_type TEXT NOT NULL DEFAULT '',
      subject TEXT NOT NULL DEFAULT '',
      material_type TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      photo_substitute TEXT NOT NULL DEFAULT '',
      schedule_block_id INTEGER,
      is_filmable INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL,
      FOREIGN KEY (schedule_block_id) REFERENCES schedule_blocks(id)
    )
  `);

  await db.execute(`
    CREATE TABLE check_states (
      cut_id INTEGER PRIMARY KEY,
      checked INTEGER NOT NULL DEFAULT 0,
      checked_at TEXT,
      FOREIGN KEY (cut_id) REFERENCES cuts(id)
    )
  `);

  // Insert schedule blocks (shooting blocks only)
  const blocks = [
    { id: 1, time_range: "12:00~12:30", title: "インタビュー②", location: "店内(壁or棚前)", sort_order: 1 },
    { id: 2, time_range: "12:30~12:50", title: "インタビュー①", location: "店内(背景変更)", sort_order: 2 },
    { id: 3, time_range: "13:00~13:20", title: "調理(揚げ物・包丁)", location: "厨房", sort_order: 3 },
    { id: 4, time_range: "13:20~13:35", title: "仕込み・品質管理", location: "厨房/冷蔵庫", sort_order: 4 },
    { id: 5, time_range: "13:35~13:50", title: "教育+完成料理", location: "厨房", sort_order: 5 },
    { id: 6, time_range: "13:50~14:00", title: "提供・暖簾", location: "客席/店舗外", sort_order: 6 },
    { id: 7, time_range: "14:15~14:40", title: "夜の事務所(開業再現)", location: "店内(暗幕)", sort_order: 7 },
    { id: 8, time_range: "14:40~14:55", title: "書類・資料カット", location: "店内", sort_order: 8 },
    { id: 9, time_range: "15:25~15:55", title: "じゅにまーる撮影", location: "じゅにまーる横浜本店", sort_order: 9 },
  ];

  for (const b of blocks) {
    await db.execute({
      sql: "INSERT INTO schedule_blocks (id, time_range, title, location, sort_order) VALUES (?, ?, ?, ?, ?)",
      args: [b.id, b.time_range, b.title, b.location, b.sort_order],
    });
  }

  // All cuts from sheet1 (CSV row index = cut id)
  // material_type: "実写" | "MG" | "既存写真" | "MG+実写" | "MG+写真" | "個人写真"
  // is_filmable: 1 = needs to be filmed on location, 0 = post-production
  // schedule_block_id: mapped from plan

  interface CutData {
    id: number;
    scene: number;
    cut: number;
    tc: string;
    dur: number;
    shot: string;
    subject: string;
    material: string;
    notes: string;
    photo_sub: string;
    block_id: number | null;
    is_filmable: number;
  }

  const cuts: CutData[] = [
    // S1: Opening - 事務所シーン → block 7 (夜の事務所)
    { id: 1, scene: 1, cut: 1, tc: "0:00-0:02", dur: 2, shot: "ECU", subject: "A4コピー用紙の表面", material: "実写", notes: "スポット1灯。斜光で紙の質感", photo_sub: "×", block_id: 7, is_filmable: 1 },
    { id: 2, scene: 1, cut: 2, tc: "0:02-0:05", dur: 3, shot: "CU", subject: "手書きメモを指でなぞる手元", material: "実写", notes: "男性の手。ペンのインク跡あり", photo_sub: "×", block_id: 7, is_filmable: 1 },
    { id: 3, scene: 1, cut: 3, tc: "0:05-0:08", dur: 3, shot: "MS→引き", subject: "机の上の紙＋ペン＋暗い部屋", material: "実写", notes: "古い事務所。蛍光灯1本だけ", photo_sub: "×", block_id: 7, is_filmable: 1 },

    // S2: 不安→前進パート → block 7 (夜の事務所)
    { id: 4, scene: 2, cut: 4, tc: "0:08-0:11", dur: 3, shot: "CU", subject: "時計の秒針（深夜2-3時）", material: "実写", notes: "壁掛け時計。事務所感あるデザイン", photo_sub: "△", block_id: 7, is_filmable: 1 },
    { id: 5, scene: 2, cut: 5, tc: "0:11-0:15", dur: 4, shot: "MS", subject: "片付かない机：書類・電卓・空き缶", material: "実写", notes: "開業当時を再現。リアルな散らかり方", photo_sub: "△", block_id: 7, is_filmable: 1 },
    { id: 6, scene: 2, cut: 6, tc: "0:15-0:18", dur: 3, shot: "WS", subject: "暗い窓＋人物シルエット", material: "実写", notes: "窓際で佇む。顔は見せない", photo_sub: "△", block_id: 7, is_filmable: 1 },
    { id: 7, scene: 2, cut: 7, tc: "0:18-0:20", dur: 2, shot: "テロップ", subject: "暗い画＋テロップ", material: "MG", notes: "「人も、時間も、足りない。」", photo_sub: "×", block_id: null, is_filmable: 0 },
    { id: 8, scene: 2, cut: 8, tc: "0:20-0:23", dur: 3, shot: "CU", subject: "ノートにペンを走らせる手元", material: "実写", notes: "決意の瞬間。手に力が入る", photo_sub: "×", block_id: 7, is_filmable: 1 },
    { id: 9, scene: 2, cut: 9, tc: "0:23-0:26", dur: 3, shot: "WS", subject: "窓から朝日が差し込む", material: "実写", notes: "同じ窓。夜→朝の対比", photo_sub: "△", block_id: 7, is_filmable: 1 },
    { id: 10, scene: 2, cut: 10, tc: "0:26-0:29", dur: 3, shot: "CU", subject: "包丁を研ぐ手元／まな板を拭く", material: "実写", notes: "料理人としての原点の動作", photo_sub: "×", block_id: 6, is_filmable: 1 },
    { id: 11, scene: 2, cut: 11, tc: "0:29-0:33", dur: 4, shot: "MS", subject: "暖簾をかける／看板の電気を点ける", material: "実写", notes: "朝の自然光", photo_sub: "×", block_id: 6, is_filmable: 1 },
    { id: 12, scene: 2, cut: 12, tc: "0:33-0:35", dur: 2, shot: "テロップ", subject: "上記カット＋テロップ", material: "MG", notes: "「だから、仕組みにする。」", photo_sub: "×", block_id: null, is_filmable: 0 },

    // S3: 弥平の歩み → 既存写真
    { id: 13, scene: 3, cut: 13, tc: "0:35-0:37", dur: 2, shot: "WS", subject: "弥平1号店の外観", material: "既存写真", notes: "1号店＝原点", photo_sub: "○", block_id: null, is_filmable: 0 },
    { id: 14, scene: 3, cut: 14, tc: "0:37-0:39", dur: 2, shot: "CU", subject: "弥平の名物料理", material: "既存写真", notes: "相模湾の朝獲れ地魚", photo_sub: "○", block_id: null, is_filmable: 0 },
    { id: 15, scene: 3, cut: 15, tc: "0:39-0:41", dur: 2, shot: "WS", subject: "弥平 店内の雰囲気", material: "既存写真", notes: "野毛のレトロ感", photo_sub: "○", block_id: null, is_filmable: 0 },
    { id: 16, scene: 3, cut: 16, tc: "0:41-0:43", dur: 2, shot: "WS", subject: "弥平 鶴屋町店/新子安店 外観", material: "既存写真", notes: "弥平ブランドの広がり", photo_sub: "○", block_id: null, is_filmable: 0 },
    { id: 17, scene: 3, cut: 17, tc: "0:43-0:45", dur: 2, shot: "WS", subject: "弥平 桜木町店 外観", material: "既存写真", notes: "桜木町＝野毛エリアの拠点", photo_sub: "○", block_id: null, is_filmable: 0 },

    // S3 テロップ
    { id: 18, scene: 3, cut: 18, tc: "0:45-0:47", dur: 2, shot: "テロップ重ね", subject: "店舗外観＋テロップ", material: "MG", notes: "「現場が、すべての起点」", photo_sub: "×", block_id: null, is_filmable: 0 },

    // S4: 調理パート → blocks 3,4,5,6
    { id: 19, scene: 4, cut: 15, tc: "0:47-0:49", dur: 2, shot: "CU", subject: "計量：秤の上に食材を載せる", material: "実写", notes: "デジタル秤。数字がハッキリ見える", photo_sub: "△", block_id: 4, is_filmable: 1 },
    { id: 20, scene: 4, cut: 16, tc: "0:49-0:51", dur: 2, shot: "CU", subject: "温度管理：芯温計の数字", material: "実写", notes: "芯温計が適温を示す瞬間", photo_sub: "△", block_id: 4, is_filmable: 1 },
    { id: 21, scene: 4, cut: 17, tc: "0:51-0:54", dur: 3, shot: "MS", subject: "揚げ物：天ぷらを油に投入する瞬間", material: "実写", notes: "120fps推奨。油跳ね注意→望遠で", photo_sub: "×", block_id: 3, is_filmable: 1 },
    { id: 22, scene: 4, cut: 18, tc: "0:54-0:57", dur: 3, shot: "CU", subject: "包丁で食材をカットする手元", material: "実写", notes: "切れ味の良い包丁。トントン音", photo_sub: "×", block_id: 3, is_filmable: 1 },
    { id: 23, scene: 4, cut: 19, tc: "0:57-0:59", dur: 2, shot: "ECU", subject: "盛り付け：ソースをかける/箸で整える", material: "実写", notes: "料理の仕上げ工程", photo_sub: "△", block_id: 3, is_filmable: 1 },
    { id: 24, scene: 4, cut: 20, tc: "0:59-1:01", dur: 2, shot: "MS", subject: "完成した料理を持ち上げる", material: "実写", notes: "美しい完成品", photo_sub: "○", block_id: 5, is_filmable: 1 },
    { id: 25, scene: 4, cut: 21, tc: "1:01-1:04", dur: 3, shot: "WS", subject: "提供：スタッフがお客様のテーブルへ", material: "実写", notes: "笑顔のスタッフ。お客様の反応", photo_sub: "×", block_id: 6, is_filmable: 1 },
    { id: 26, scene: 4, cut: 22, tc: "1:04-1:07", dur: 3, shot: "MS", subject: "カウンター越しの熱量：厨房と客席", material: "実写", notes: "オープンキッチンの臨場感", photo_sub: "△", block_id: 6, is_filmable: 1 },
    { id: 27, scene: 4, cut: 23, tc: "1:07-1:12", dur: 5, shot: "WS", subject: "満席の店内全景", material: "実写", notes: "活気ある店内。ざわめき", photo_sub: "△", block_id: 6, is_filmable: 1 },

    // S5: コロナ → 既存写真
    { id: 28, scene: 5, cut: 28, tc: "1:12-1:14", dur: 2, shot: "テロップ", subject: "黒背景＋テロップ", material: "MG", notes: "「2020年、再び逆境。」", photo_sub: "×", block_id: null, is_filmable: 0 },
    { id: 29, scene: 5, cut: 29, tc: "1:14-1:16", dur: 2, shot: "WS", subject: "じゅにまーる 野毛五番街店 外観", material: "既存写真", notes: "沖縄酒場という新しい挑戦", photo_sub: "○", block_id: null, is_filmable: 0 },
    { id: 30, scene: 5, cut: 30, tc: "1:16-1:18", dur: 2, shot: "CU", subject: "じゅにまーる 名物料理", material: "既存写真", notes: "沖縄料理の鮮やかさ", photo_sub: "○", block_id: null, is_filmable: 0 },
    { id: 31, scene: 5, cut: 31, tc: "1:18-1:19", dur: 1, shot: "WS", subject: "じゅにまーる 店内", material: "既存写真", notes: "賑やかな雰囲気", photo_sub: "○", block_id: null, is_filmable: 0 },
    { id: 32, scene: 5, cut: 32, tc: "1:19-1:21", dur: 2, shot: "WS", subject: "じゅにまーる 他店舗", material: "既存写真", notes: "一気に拡大した勢い", photo_sub: "○", block_id: null, is_filmable: 0 },
    { id: 33, scene: 5, cut: 33, tc: "1:21-1:23", dur: 2, shot: "WS", subject: "ふじ月 外観", material: "既存写真", notes: "銀座出店のベースになる業態", photo_sub: "○", block_id: null, is_filmable: 0 },
    { id: 34, scene: 5, cut: 34, tc: "1:23-1:24", dur: 1, shot: "CU", subject: "ふじ月 名物料理（地蟹）", material: "既存写真", notes: "専門店としての格", photo_sub: "○", block_id: null, is_filmable: 0 },
    { id: 35, scene: 5, cut: 35, tc: "1:24-1:26", dur: 2, shot: "テロップ重ね", subject: "店舗写真＋テロップ", material: "MG", notes: "「それでも、新しい一手を。」", photo_sub: "×", block_id: null, is_filmable: 0 },

    // S6: 品質管理・教育 → blocks 4,5
    { id: 36, scene: 6, cut: 31, tc: "1:26-1:28", dur: 2, shot: "CU", subject: "チェック表にペンでチェック", material: "実写", notes: "A4チェックリスト。項目が見える", photo_sub: "△", block_id: 4, is_filmable: 1 },
    { id: 37, scene: 6, cut: 32, tc: "1:28-1:30", dur: 2, shot: "CU", subject: "手順書/マニュアルのページ", material: "実写", notes: "実際の業務マニュアル", photo_sub: "△", block_id: 4, is_filmable: 1 },
    { id: 38, scene: 6, cut: 33, tc: "1:30-1:33", dur: 3, shot: "MS", subject: "先輩が新人に教える手元", material: "実写", notes: "2人の手元が並ぶ構図 ★必須", photo_sub: "×", block_id: 5, is_filmable: 1 },
    { id: 39, scene: 6, cut: 34, tc: "1:33-1:35", dur: 2, shot: "CU", subject: "盛付基準（見本写真と実物の比較）", material: "実写", notes: "基準写真と実際の盛り付け", photo_sub: "○", block_id: 5, is_filmable: 1 },
    { id: 40, scene: 6, cut: 35, tc: "1:35-1:38", dur: 3, shot: "テロップ重ね", subject: "上記＋テロップ", material: "MG", notes: "「品質は 気合いじゃない」", photo_sub: "×", block_id: null, is_filmable: 0 },

    // S7: インタビュー① → block 2
    { id: 41, scene: 7, cut: 36, tc: "1:38-1:44", dur: 6, shot: "MCU", subject: "社員インタビュー①：語る表情", material: "実写", notes: "背景シンプル。2灯。自然な語り", photo_sub: "×", block_id: 1, is_filmable: 1 },

    // S7: Bロール → block 1 area (but these are specific shots)
    { id: 42, scene: 7, cut: 37, tc: "1:44-1:48", dur: 4, shot: "WS", subject: "日曜朝の全店舗会議風景", material: "実写", notes: "真剣な表情。全員が集まっている感", photo_sub: "△", block_id: null, is_filmable: 0 },
    { id: 43, scene: 7, cut: 38, tc: "1:48-1:52", dur: 4, shot: "MS", subject: "フォロー面談風景", material: "実写", notes: "1on1。向き合って話す。演出OK", photo_sub: "△", block_id: 1, is_filmable: 1 },
    { id: 44, scene: 7, cut: 39, tc: "1:52-1:57", dur: 5, shot: "WS", subject: "社員旅行の集合写真", material: "既存写真", notes: "参加率100%が伝わる全員集合写真", photo_sub: "○", block_id: null, is_filmable: 0 },
    { id: 45, scene: 7, cut: 40, tc: "1:57-2:03", dur: 6, shot: "テロップ重ね", subject: "集合写真＋テロップ", material: "MG", notes: "「社員旅行 参加率100%」大きく表示", photo_sub: "×", block_id: null, is_filmable: 0 },

    // S8: インタビュー② → block 1
    { id: 46, scene: 8, cut: 41, tc: "2:03-2:09", dur: 6, shot: "MCU", subject: "社員インタビュー②：語り始める", material: "実写", notes: "Dメロの静けさと同期", photo_sub: "×", block_id: 1, is_filmable: 1 },
    { id: 47, scene: 8, cut: 42, tc: "2:09-2:13", dur: 4, shot: "CU", subject: "ふじ月 銀座の出店図面/間取り図", material: "実写", notes: "銀座出店の図面。具体的な資料", photo_sub: "△", block_id: 8, is_filmable: 1 },
    { id: 48, scene: 8, cut: 43, tc: "2:13-2:18", dur: 5, shot: "MCU", subject: "インタビュー②：ふじ月で銀座へ", material: "実写", notes: "熱が入り始める。身振りが出る", photo_sub: "×", block_id: 1, is_filmable: 1 },
    { id: 49, scene: 8, cut: 44, tc: "2:18-2:22", dur: 4, shot: "CU", subject: "事業計画書/出店資料のページ", material: "実写", notes: "事業計画書。信頼の根拠", photo_sub: "△", block_id: 8, is_filmable: 1 },
    { id: 50, scene: 8, cut: 45, tc: "2:22-2:27", dur: 5, shot: "MCU→CU", subject: "インタビュー②：核心を語る", material: "実写", notes: "寄っていく。目に力。声に芯", photo_sub: "×", block_id: 1, is_filmable: 1 },
    { id: 51, scene: 8, cut: 46, tc: "2:27-2:30", dur: 3, shot: "CU", subject: "インタビュー②：決意の表情", material: "実写", notes: "「チームで勝つ。」→ラスサビ爆発", photo_sub: "×", block_id: 1, is_filmable: 1 },

    // S9: ラスサビ → blocks 8 (書類系), block 1 area
    { id: 52, scene: 9, cut: 45, tc: "2:30-2:33", dur: 3, shot: "MS", subject: "会議のホワイトボード/モニター", material: "実写", notes: "サビの爆発と同時に映像が加速", photo_sub: "△", block_id: 8, is_filmable: 1 },
    { id: 53, scene: 9, cut: 46, tc: "2:33-2:36", dur: 3, shot: "CU", subject: "PC画面の数字/スプレッドシート", material: "実写", notes: "データ＝根拠。スクロールor入力", photo_sub: "△", block_id: 8, is_filmable: 1 },
    { id: 54, scene: 9, cut: 47, tc: "2:36-2:39", dur: 3, shot: "CU", subject: "事業計画書バインダーを開く", material: "実写", notes: "手でバッと開く。力強く", photo_sub: "×", block_id: 8, is_filmable: 1 },
    { id: 55, scene: 9, cut: 48, tc: "2:39-2:43", dur: 4, shot: "ECU→MS", subject: "A4コピー用紙→事業計画書バインダー", material: "MG+実写", notes: "ディゾルブで変化。メタファー回収", photo_sub: "×", block_id: 8, is_filmable: 1 },
    { id: 56, scene: 9, cut: 49, tc: "2:43-2:48", dur: 5, shot: "WS", subject: "スタッフ全員が前を向く", material: "既存写真", notes: "全員集合写真or社員旅行写真", photo_sub: "○", block_id: null, is_filmable: 0 },
    { id: 57, scene: 9, cut: 50, tc: "2:48-2:52", dur: 4, shot: "テロップ", subject: "スタッフ背景＋合言葉/スローガン", material: "MG", notes: "合言葉。プロジェクターで読める大きさ", photo_sub: "×", block_id: null, is_filmable: 0 },
    { id: 58, scene: 9, cut: 51, tc: "2:52-2:55", dur: 3, shot: "WS→引き", subject: "店舗外観 or チーム全景", material: "実写", notes: "声が消えて映像と曲だけに", photo_sub: "△", block_id: 9, is_filmable: 1 },

    // S10: スタッフ写真エンディング → ポスプロ
    { id: 59, scene: 10, cut: 51, tc: "2:55-3:09", dur: 14, shot: "写真連続", subject: "スタッフ写真：1人ずつ表示", material: "個人写真", notes: "表情重視。笑顔。バストアップ統一", photo_sub: "○", block_id: null, is_filmable: 0 },
    { id: 60, scene: 10, cut: 52, tc: "3:09-3:21", dur: 12, shot: "写真加速", subject: "スタッフ写真：加速", material: "個人写真", notes: "テンポアップ。約30枚", photo_sub: "○", block_id: null, is_filmable: 0 },
    { id: 61, scene: 10, cut: 53, tc: "3:21-3:31", dur: 10, shot: "写真最速", subject: "スタッフ写真：最速", material: "個人写真", notes: "フラッシュ的に。約50枚", photo_sub: "○", block_id: null, is_filmable: 0 },
    { id: 62, scene: 10, cut: 54, tc: "3:31-3:42", dur: 11, shot: "フォトウォール", subject: "画面全体がスタッフ写真タイルで埋まる", material: "MG+写真", notes: "バラバラ→整列→中央にロゴ＋合言葉", photo_sub: "×", block_id: null, is_filmable: 0 },
    { id: 63, scene: 10, cut: 55, tc: "3:42-3:52", dur: 10, shot: "ロゴ静止", subject: "フォトウォール＋ロゴ→フェードアウト", material: "MG", notes: "余韻。拍手誘導", photo_sub: "×", block_id: null, is_filmable: 0 },
  ];

  for (const c of cuts) {
    await db.execute({
      sql: `INSERT INTO cuts (id, scene_number, cut_number, timecode, duration_seconds, shot_type, subject, material_type, notes, photo_substitute, schedule_block_id, is_filmable, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [c.id, c.scene, c.cut, c.tc, c.dur, c.shot, c.subject, c.material, c.notes, c.photo_sub, c.block_id, c.is_filmable, c.id],
    });
  }

  // Initialize check_states for all cuts
  for (const c of cuts) {
    await db.execute({
      sql: "INSERT INTO check_states (cut_id, checked, checked_at) VALUES (?, 0, NULL)",
      args: [c.id],
    });
  }

  console.log(`Seeded ${blocks.length} schedule blocks and ${cuts.length} cuts.`);
}

seed().catch(console.error);

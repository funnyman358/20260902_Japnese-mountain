// 山データの整合性チェック。`npm run validate` で実行する。
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = "src/data/mountains";
const files = readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "index.ts");

const PREFECTURES = readFileSync("src/data/types.ts", "utf8")
  .split("export const PREFECTURES = [")[1]
  .split("] as const;")[0]
  .match(/"[^"]+"/g)
  .map((s) => s.slice(1, -1));
const FEATURES = readFileSync("src/data/types.ts", "utf8")
  .split("export const FEATURES = [")[1]
  .split("] as const;")[0]
  .match(/"[^"]+"/g)
  .map((s) => s.slice(1, -1));
const LISTS = readFileSync("src/data/types.ts", "utf8")
  .split("export const LISTS = [")[1]
  .split("] as const;")[0]
  .match(/"[^"]+"/g)
  .map((s) => s.slice(1, -1));

const errors = [];
const warnings = [];
const ids = new Map();
const names = new Map();
const highest = new Map(); // prefecture -> [mountain]
let count = 0;

// 日本語フィールドに紛れ込んだラテン文字・キリル文字を検出する
const FOREIGN = /[A-Za-zЀ-ӿ]/;
const KANA_ONLY = /^[ぁ-ゟー・]+$/;

for (const file of files) {
  const src = readFileSync(join(dir, file), "utf8");
  const entries = src.split(/\n  \{ id: /).slice(1);
  for (const chunk of entries) {
    count += 1;
    const body = "{ id: " + chunk.split(/\n\s*\n/)[0];
    const get = (key) => {
      const m = body.match(new RegExp(`\\b${key}: "((?:[^"\\\\]|\\\\.)*)"`));
      return m ? m[1] : undefined;
    };
    const getNum = (key) => {
      const m = body.match(new RegExp(`\\b${key}: (\\d+)`));
      return m ? Number(m[1]) : undefined;
    };
    const getArr = (key) => {
      const m = body.match(new RegExp(`\\b${key}: \\[([^\\]]*)\\]`));
      return m ? (m[1].match(/"[^"]+"/g) ?? []).map((s) => s.slice(1, -1)) : undefined;
    };
    const id = get("id");
    const name = get("n");
    const kana = get("k");
    const where = `${file} / ${name ?? id}`;
    if (!id) { errors.push(`${where}: id がありません`); continue; }
    if (ids.has(id)) errors.push(`${where}: id "${id}" が ${ids.get(id)} と重複`);
    ids.set(id, where);
    if (!/^[a-z0-9-]+$/.test(id)) errors.push(`${where}: id "${id}" に不正な文字`);
    if (!name || FOREIGN.test(name)) errors.push(`${where}: 山名が不正 "${name}"`);
    if (!kana || !KANA_ONLY.test(kana)) errors.push(`${where}: よみがなが不正 "${kana}"`);
    const key = `${name}/${get("p")}`;
    if (names.has(key)) warnings.push(`${where}: 同名同県 "${name}" が ${names.get(key)} にもあります`);
    names.set(key, where);
    const elevation = getNum("e");
    if (!elevation || elevation < 100 || elevation > 3776) errors.push(`${where}: 標高が不正 ${elevation}`);
    const prefs = (get("p") ?? "").split("|");
    for (const p of prefs) if (!PREFECTURES.includes(p)) errors.push(`${where}: 都道府県が不正 "${p}"`);
    const munis = (get("m") ?? "").split("|");
    for (const mu of munis) {
      if (!mu) errors.push(`${where}: 市町村が空`);
      else if (FOREIGN.test(mu)) errors.push(`${where}: 市町村に不正な文字 "${mu}"`);
      else if (!/(市|区|町|村)$/.test(mu)) errors.push(`${where}: 市町村名が不正 "${mu}"`);
    }
    const feats = getArr("f") ?? [];
    if (feats.length === 0) errors.push(`${where}: 特徴タグがありません`);
    for (const f of feats) if (!FEATURES.includes(f)) errors.push(`${where}: 特徴タグが不正 "${f}"`);
    const lists = getArr("l") ?? [];
    for (const l of lists) if (!LISTS.includes(l)) errors.push(`${where}: リスト区分が不正 "${l}"`);
    if (lists.includes("都道府県最高峰")) for (const p of prefs) highest.set(p, name);
    const ph = getNum("ph"), te = getNum("te");
    if (!(ph >= 1 && ph <= 5)) errors.push(`${where}: 体力度が不正 ${ph}`);
    if (!(te >= 1 && te <= 5)) errors.push(`${where}: 技術度が不正 ${te}`);
    const season = get("s") ?? "";
    if (!/^[春夏秋冬]{1,4}$/.test(season)) errors.push(`${where}: 適期が不正 "${season}"`);
    const duration = get("d");
    if (!["半日", "日帰り", "1泊2日", "2泊以上"].includes(duration)) errors.push(`${where}: 行程が不正 "${duration}"`);
    const sm = get("sm");
    if (!sm || sm.length < 8) errors.push(`${where}: 紹介文が短すぎます`);
    else if (FOREIGN.test(sm.replace(/[A-Za-z]{0,0}/g, ""))) {
      if (/[Ѐ-ӿ]/.test(sm)) errors.push(`${where}: 紹介文にキリル文字 "${sm}"`);
      else warnings.push(`${where}: 紹介文にラテン文字 "${sm}"`);
    }
  }
}

const missingHighest = PREFECTURES.filter((p) => !highest.has(p));
if (missingHighest.length) warnings.push(`都道府県最高峰が未登録: ${missingHighest.join("、")}`);

const prefCount = new Map(PREFECTURES.map((p) => [p, 0]));
for (const file of files) {
  const src = readFileSync(join(dir, file), "utf8");
  for (const m of src.matchAll(/\bp: "([^"]+)"/g)) {
    for (const p of m[1].split("|")) prefCount.set(p, (prefCount.get(p) ?? 0) + 1);
  }
}
for (const [p, c] of prefCount) if (c === 0) errors.push(`${p}: 登録された山が1座もありません`);

console.log(`山データ: ${count} 座 / ${files.length} ファイル`);
console.log(
  "都道府県別: " +
    [...prefCount.entries()].map(([p, c]) => `${p}:${c}`).join(" "),
);
for (const w of warnings) console.log("警告: " + w);
if (errors.length) {
  for (const e of errors) console.error("エラー: " + e);
  console.error(`\n${errors.length} 件のエラー`);
  process.exit(1);
}
console.log("チェック OK");

import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

async function readEvaluationsDir(baseDir: string) {
  const results: Array<Record<string, unknown>> = [];

  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        await walk(full);
      } else if (ent.isFile() && ent.name.endsWith(".json")) {
        try {
          const txt = await fs.readFile(full, "utf-8");
          const obj = JSON.parse(txt);
          if (obj && obj.danhGia) {
            results.push({ ...obj.danhGia, answers: obj.answers || [] });
          }
        } catch (err) {
          console.error("Failed to parse evaluation file:", full, err);
        }
      }
    }
  }

  try {
    const stat = await fs.stat(baseDir);
    if (!stat.isDirectory()) return results;
  } catch (e) {
    return results;
  }

  await walk(baseDir);
  return results;
}

function sanitizeFolderName(name: string) {
  if (!name) return null;
  const m = name.match(/^[-_a-zA-Z0-9]+$/);
  return m ? name : null;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    let phongban = url.searchParams.get("phongban");
    if (!phongban) {
      const seg = url.pathname.split("/").pop() || "";
      if (seg.startsWith("phongban=")) {
        phongban = seg.split("=")[1];
      }
    }

    const safeName = sanitizeFolderName(phongban || "");

    const baseParent = path.join(process.cwd(), "data", "evaluations");
    const base = safeName ? path.join(baseParent, safeName) : baseParent;

    const resolved = path.resolve(base);
    if (!resolved.startsWith(path.resolve(baseParent))) {
      return new Response(JSON.stringify({ error: "Invalid folder" }), { status: 400 });
    }

    const items = await readEvaluationsDir(resolved);
    items.sort((a, b) => {
      const ta = a.submittedAt ? new Date(String(a.submittedAt)).getTime() : 0;
      const tb = b.submittedAt ? new Date(String(b.submittedAt)).getTime() : 0;
      return tb - ta;
    });
    return NextResponse.json(items);
  } catch (err) {
    console.error("/api/evaluations catch-all error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}

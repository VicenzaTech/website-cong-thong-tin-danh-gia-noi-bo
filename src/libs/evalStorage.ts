import fs from "fs/promises";
import path from "path";

const BASE_DIR = path.join(process.cwd(), "data", "evaluations");

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    // ignore
  }
}

function getEvaluationFileName(payload: any) {
  // Ưu tiên lấy từ payload.meta, fallback sang payload.danhGia
  const meta = payload?.meta || payload?.danhGia || {};
  const nguoiDanhGiaId = meta.nguoiDanhGiaId || "unknown";
  const nguoiDuocDanhGiaId = meta.nguoiDuocDanhGiaId || "unknown";
  const bieuMauId = meta.bieuMauId || "unknown";
  const kyDanhGiaId = meta.kyDanhGiaId || "unknown";
  return `danhgia_${nguoiDanhGiaId}_${nguoiDuocDanhGiaId}_${bieuMauId}_${kyDanhGiaId}.json`;
}

export async function writeEvaluationFile(
  phongBanId: string,
  _danhGiaId: string, // không dùng nữa, giữ để không lỗi các chỗ gọi cũ
  payload: any
) {
  const dir = path.join(BASE_DIR, phongBanId);
  await ensureDir(dir);
  const fileName = getEvaluationFileName(payload);
  const filePath = path.join(dir, fileName);
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf-8");
}

export async function readEvaluationsForDepartment(phongBanId: string) {
  const dir = path.join(BASE_DIR, phongBanId);
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = entries.filter((e) => e.isFile() && e.name.endsWith(".json"));
    const items = [];
    for (const f of files) {
      try {
        const content = await fs.readFile(path.join(dir, f.name), "utf-8");
        items.push(JSON.parse(content));
      } catch (err) {
        // skip invalid file
      }
    }
    // sort newest first if payload has danhGia.submittedAt
    items.sort((a: any, b: any) => {
      const ta = a?.danhGia?.submittedAt ? new Date(a.danhGia.submittedAt).getTime() : 0;
      const tb = b?.danhGia?.submittedAt ? new Date(b.danhGia.submittedAt).getTime() : 0;
      return tb - ta;
    });
    return items;
  } catch (err) {
    return [];
  }
}
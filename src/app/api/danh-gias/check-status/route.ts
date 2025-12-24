import { NextResponse } from "next/server";
import { readEvaluationsForDepartment } from "@/libs/evalStorage"; // Đường dẫn đúng tới hàm đọc file thực tế

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nguoiDanhGiaId,
      bieuMauId,
      kyDanhGiaId,
      nguoiDuocDanhGiaIds = [],
      phongBanId, // Nếu cần lọc theo phòng ban
    } = body as {
      nguoiDanhGiaId: string;
      bieuMauId: string;
      kyDanhGiaId: string;
      nguoiDuocDanhGiaIds: string[];
      phongBanId?: string;
    };

    // Đọc tất cả đánh giá từ file thực tế (hoặc DB)
    let evaluations: any[] = [];
    console.log("BODY:", body);
    console.log("PHONG BAN ID:", phongBanId);
    if (phongBanId) {
      evaluations = await readEvaluationsForDepartment(phongBanId);
      console.log("EVALUATIONS FROM FS:", evaluations);
    } else {
      // Nếu không có phòng ban, có thể đọc toàn bộ hoặc xử lý khác
      // evaluations = await readAllEvaluations();
    }

    const statuses: Record<string, boolean> = {};
    for (const id of nguoiDuocDanhGiaIds) {
      const existing = evaluations.find(
        (f) =>
          f.danhGia.nguoiDanhGiaId === nguoiDanhGiaId &&
          f.danhGia.nguoiDuocDanhGiaId === id &&
          f.danhGia.bieuMauId === bieuMauId &&
          f.danhGia.kyDanhGiaId === kyDanhGiaId
      );
      statuses[id] = !!existing && !!existing.danhGia.daHoanThanh;
    }

    return NextResponse.json({ statuses });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
import { NextResponse } from "next/server";
import { readEvaluationsForDepartment } from "@/libs/evalStorage"; // Đường dẫn đúng tới hàm đọc file thực tế

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nguoiDanhGiaId = searchParams.get('nguoiDanhGiaId');
    const nguoiDuocDanhGiaId = searchParams.get('nguoiDuocDanhGiaId');
    const bieuMauId = searchParams.get('bieuMauId');
    const kyDanhGiaId = searchParams.get('kyDanhGiaId');
    const phongBanId = searchParams.get('phongBanId');

    if (!nguoiDanhGiaId || !nguoiDuocDanhGiaId || !bieuMauId || !kyDanhGiaId || !phongBanId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const evaluations = await readEvaluationsForDepartment(phongBanId);
    const existing = evaluations.find(
      (f) =>
        f.danhGia.nguoiDanhGiaId === nguoiDanhGiaId &&
        f.danhGia.nguoiDuocDanhGiaId === nguoiDuocDanhGiaId &&
        f.danhGia.bieuMauId === bieuMauId &&
        f.danhGia.kyDanhGiaId === kyDanhGiaId
    );

    const hasEvaluated = !!existing;
    const daHoanThanh = hasEvaluated && !!existing.danhGia.daHoanThanh;

    return NextResponse.json({ hasEvaluated, daHoanThanh });
  } catch (err) {
    console.error("Error in check-status GET:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
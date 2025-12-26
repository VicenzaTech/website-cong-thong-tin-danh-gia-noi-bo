import { NextResponse } from "next/server";
import { users, bieuMaus, danhGias } from "@/_mock/db";
import { readEvaluationsForDepartment } from "@/libs/evalStorage";
import { LoaiDanhGia } from "@/types/schema";
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const phongBanId = url.searchParams.get("phongBanId");
    if (!phongBanId) {
      return NextResponse.json({ items: [] });
    }

    // Try to read from filesystem first
    try {
      const files = await readEvaluationsForDepartment(phongBanId);
      if (files && files.length > 0) {
        // files are objects like { danhGia, answers, meta }
        // Filter: only NHAN_VIEN evaluations (not LANH_DAO)
        const items = files
          .filter((f: any) => {
            const bieu = bieuMaus.find((b) => b.id === f.danhGia.bieuMauId);
            return bieu?.loaiDanhGia === LoaiDanhGia.NHAN_VIEN;
          })
          .map((f: any) => {
            const dg = f.danhGia;
            const rater = users.find((u) => u.id === dg.nguoiDanhGiaId);
            const ratee = users.find((u) => u.id === dg.nguoiDuocDanhGiaId);
            const bieu = bieuMaus.find((b) => b.id === dg.bieuMauId);
            return {
              id: dg.id,
              nguoiDanhGiaId: dg.nguoiDanhGiaId,
              nguoiDanhGiaName: rater?.hoTen || dg.nguoiDanhGiaId,
              nguoiDuocDanhGiaId: dg.nguoiDuocDanhGiaId,
              nguoiDuocDanhGiaName: ratee?.hoTen || dg.nguoiDuocDanhGiaId,
              bieuMauId: dg.bieuMauId,
              bieuMauName: bieu?.tenBieuMau || "",
              kyDanhGiaId: dg.kyDanhGiaId,
              daHoanThanh: !!dg.daHoanThanh,
              tongDiem: dg.tongDiem,
              diemTrungBinh: dg.diemTrungBinh,
              submittedAt: dg.submittedAt,
              chiTietTieuChi: f.answers || [],
            };
          });
        return NextResponse.json({ items });
      }
    } catch (err) {
      // if reading files fails, fallback to in-memory
      console.error("readEvaluationsForDepartment failed:", err);
    }

    // Fallback: original in-memory behavior (keeps compatibility)
    // Filter: only NHAN_VIEN evaluations (not LANH_DAO)
    const userIds = users.filter((u) => u.phongBanId === phongBanId && !u.deletedAt).map((u) => u.id);
    const items = danhGias
      .filter((dg) => {
        const bieu = bieuMaus.find((b) => b.id === dg.bieuMauId);
        return userIds.includes(dg.nguoiDuocDanhGiaId) && bieu?.loaiDanhGia === LoaiDanhGia.NHAN_VIEN;
      })
      .map((dg) => {
        const rater = users.find((u) => u.id === dg.nguoiDanhGiaId);
        const ratee = users.find((u) => u.id === dg.nguoiDuocDanhGiaId);
        const bieu = bieuMaus.find((b) => b.id === dg.bieuMauId);
        return {
          id: dg.id,
          nguoiDanhGiaId: dg.nguoiDanhGiaId,
          nguoiDanhGiaName: rater?.hoTen || dg.nguoiDanhGiaId,
          nguoiDuocDanhGiaId: dg.nguoiDuocDanhGiaId,
          nguoiDuocDanhGiaName: ratee?.hoTen || dg.nguoiDuocDanhGiaId,
          bieuMauId: dg.bieuMauId,
          bieuMauName: bieu?.tenBieuMau || "",
          kyDanhGiaId: dg.kyDanhGiaId,
          daHoanThanh: !!dg.daHoanThanh,
          tongDiem: dg.tongDiem,
          diemTrungBinh: dg.diemTrungBinh,
          submittedAt: dg.submittedAt,
          chiTietTieuChi: dg.chiTietTieuChi || [],
        };
      })
      .sort((a, b) => +new Date(b.submittedAt ?? 0) - +new Date(a.submittedAt ?? 0));

    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json({ items: [] });
  }
}
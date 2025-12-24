import { NextResponse } from "next/server";
import { danhGias, cauTraLois, users } from "@/_mock/db";
import { writeEvaluationFile } from "@/libs/evalStorage";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nguoiDanhGiaId,
      nguoiDuocDanhGiaId,
      bieuMauId,
      kyDanhGiaId,
      nhanXetChung,
      answers = [],
    } = body as {
      nguoiDanhGiaId: string;
      nguoiDuocDanhGiaId: string;
      bieuMauId: string;
      kyDanhGiaId: string;
      nhanXetChung?: string;
      answers?: Array<{ cauHoiId: string; diem: number; nhanXet?: string }>;
    };

    if (!nguoiDanhGiaId || !nguoiDuocDanhGiaId || !bieuMauId || !kyDanhGiaId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingIndex = danhGias.findIndex(
      (dg) =>
        dg.nguoiDanhGiaId === nguoiDanhGiaId &&
        dg.nguoiDuocDanhGiaId === nguoiDuocDanhGiaId &&
        dg.bieuMauId === bieuMauId &&
        dg.kyDanhGiaId === kyDanhGiaId
    );

    // Lọc các câu trả lời có điểm (bỏ qua mandatory: diem === 0)
    const scoringAnswers = answers.filter((a) => a.diem > 0);
    const tongDiem = scoringAnswers.reduce((s: number, a) => s + (a.diem || 0), 0);
    const diemTrungBinh = scoringAnswers.length > 0 ? tongDiem / scoringAnswers.length : 0;
    const danhGia = {
      id: existingIndex !== -1 ? danhGias[existingIndex].id : `dg_${Date.now()}`,
      nguoiDanhGiaId,
      nguoiDuocDanhGiaId,
      bieuMauId,
      kyDanhGiaId,
      nhanXetChung: nhanXetChung || "",
      tongDiem,
      diemTrungBinh,
      daHoanThanh: true,
      submittedAt: new Date(),
      createdAt: existingIndex !== -1 ? danhGias[existingIndex].createdAt : new Date(),
      updatedAt: new Date(),
    };

    if (existingIndex !== -1) {
      danhGias[existingIndex] = danhGia as any;
    } else {
      danhGias.push(danhGia as any);
    }

    // store answers as cauTraLois (in-memory)
    for (const ans of answers) {
      const existingAnsIndex = cauTraLois.findIndex(
        (ctl) => ctl.danhGiaId === danhGia.id && ctl.cauHoiId === ans.cauHoiId
      );
      const ctl = {
        id:
          existingAnsIndex !== -1
            ? cauTraLois[existingAnsIndex].id
            : `ctl_${Date.now()}_${ans.cauHoiId}`,
        danhGiaId: danhGia.id,
        cauHoiId: ans.cauHoiId,
        nguoiDungId: nguoiDanhGiaId,
        diem: ans.diem,
        nhanXet: ans.nhanXet || "",
        createdAt:
          existingAnsIndex !== -1 ? cauTraLois[existingAnsIndex].createdAt : new Date(),
        updatedAt: new Date(),
      };

      if (existingAnsIndex !== -1) {
        cauTraLois[existingAnsIndex] = ctl as any;
      } else {
        cauTraLois.push(ctl as any);
      }
    }

    // Persist to filesystem: folder per phongBan of nguoiDuocDanhGia
    try {
      const user = users.find((u) => u.id === nguoiDuocDanhGiaId);
      const phongBanId = user?.phongBanId || "unknown";
      const payload = {
        danhGia,
        answers,
        meta: {
          nguoiDanhGiaId,
          nguoiDuocDanhGiaId,
          phongBanId,
          bieuMauId,
          kyDanhGiaId,
          savedAt: new Date(),
        },
      };
      await writeEvaluationFile(phongBanId, danhGia.id, payload);
    } catch (err) {
      // ignore file write errors in dev
      console.error("Failed to write evaluation file:", err);
    }

    return NextResponse.json({ success: true, danhGia });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
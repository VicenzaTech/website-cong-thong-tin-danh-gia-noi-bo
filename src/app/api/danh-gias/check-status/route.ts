import { NextResponse } from "next/server";
import { danhGias } from "@/_mock/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nguoiDanhGiaId,
      bieuMauId,
      kyDanhGiaId,
      nguoiDuocDanhGiaIds = [],
    } = body as {
      nguoiDanhGiaId: string;
      bieuMauId: string;
      kyDanhGiaId: string;
      nguoiDuocDanhGiaIds: string[];
    };

    const statuses: Record<string, boolean> = {};
    for (const id of nguoiDuocDanhGiaIds) {
      const existing = danhGias.find(
        (dg) =>
          dg.nguoiDanhGiaId === nguoiDanhGiaId &&
          dg.nguoiDuocDanhGiaId === id &&
          dg.bieuMauId === bieuMauId &&
          dg.kyDanhGiaId === kyDanhGiaId
      );
      statuses[id] = !!existing && !!existing.daHoanThanh;
    }

    return NextResponse.json({ statuses });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { users, danhGias, bieuMaus } from "@/_mock/db";

export async function GET(request: Request) {
    try {
        console.log("adfasdfdsaf")
        const url = new URL(request.url);
        const phongBanId = url.searchParams.get("phongBanId");
        console.log("PHÒNG BAN ID: ", phongBanId);
        if (!phongBanId) {
            return NextResponse.json({ items: [] });
        }

        const userIds = users.filter((u) => u.phongBanId === phongBanId && !u.deletedAt).map((u) => u.id);
        console.log("ĐÂNHS GIÁ  : // ", danhGias);
        // evaluations where both rater and ratee are in the department
        const items = danhGias
            .filter((dg) => userIds.includes(dg.nguoiDuocDanhGiaId)) // chỉ cần người được đánh giá thuộc phòng ban
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

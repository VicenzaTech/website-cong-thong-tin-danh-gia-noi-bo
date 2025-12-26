import { NextResponse } from "next/server";
import { users } from "@/_mock/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const phongBanId = url.searchParams.get("phongBanId");
  const boPhan = url.searchParams.get("boPhan");
  const role = url.searchParams.get("role");
  const page = Number(url.searchParams.get("page") || "1");
  const perPage = Number(url.searchParams.get("perPage") || "50");
  const excludeId = url.searchParams.get("excludeId");

  let result = users.filter((u) => !u.deletedAt && u.trangThaiKH);
  if (phongBanId) result = result.filter((u) => u.phongBanId === phongBanId);
  // Only filter by boPhan if parameter is provided and not empty
  // This ensures we don't filter when boPhan is null, undefined, or empty string
  if (boPhan && boPhan.trim() !== "") {
    result = result.filter((u) => u.boPhan === boPhan);
  }
  if (role) result = result.filter((u) => u.role === role);
  if (excludeId) result = result.filter((u) => u.id !== excludeId);

  const total = result.length;
  const start = (page - 1) * perPage;
  const items = result.slice(start, start + perPage).map((u) => ({
    id: u.id,
    hoTen: u.hoTen,
    maNhanVien: u.maNhanVien,
    phongBanId: u.phongBanId,
    boPhan: u.boPhan,
    role: u.role,
  }));

  return NextResponse.json(
    { total, items },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    }
  );
}
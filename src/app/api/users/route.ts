import { NextResponse } from "next/server";
import { users as mockUsers, phongBans as mockPhongBans } from "@/_mock/db";
import { authService, sqliteDb } from "@/libs/sqlite.server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const phongBanId = url.searchParams.get("phongBanId");
  const boPhan = url.searchParams.get("boPhan");
  const role = url.searchParams.get("role");
  const page = Number(url.searchParams.get("page") || "1");
  const perPage = Number(url.searchParams.get("perPage") || "50");
  const excludeId = url.searchParams.get("excludeId");
  const currentUserId = url.searchParams.get("currentUserId");
  // read users from local sqlite database
  const db = sqliteDb.get();
  const rows = db
    .prepare(`SELECT * FROM users WHERE deleted_at IS NULL`)
    .all() as any[];

  const allUsers = rows.map((r) => ({
    id: r.id,
    hoTen: r.ho_ten,
    maNhanVien: r.ma_nhan_vien,
    email: r.email,
    phongBanId: r.phong_ban_id,
    boPhan: r.bo_phan,
    role: r.role,
    trangThaiKH: r.trang_thai_kh === 1,
    daDangKy: r.da_dang_ky === 1,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    deletedAt: r.deleted_at,
  }));

  let result = allUsers.filter((u) => !u.deletedAt && u.trangThaiKH);

  // Nếu có currentUserId, lấy thông tin user đó và lọc những người cùng phòng ban và bộ phận (nếu có)
  // Hỗ trợ multi-department: user có thể thuộc nhiều bộ phận (phân cách bởi dấu `;`)
  if (currentUserId) {
    const currentUser = allUsers.find((u) => u.id === currentUserId);
    if (currentUser) {
      // Parse multi-department: split by `;` and trim
      const currentUserBoPhanList = currentUser.boPhan
        ? currentUser.boPhan.split(";").map((bp: string) => bp.trim()).filter((bp: string) => bp !== "")
        : [];

      let filterConditions: (u: any) => boolean;

      if (currentUserBoPhanList.length > 0) {
        // Multi-department logic: user can see all colleagues in any of their departments
        filterConditions = (u: any) => {
          if (u.phongBanId !== currentUser.phongBanId) return false;
          if (u.id === currentUserId) return false;

          // Parse the candidate user's boPhan
          const candidateBoPhanList = u.boPhan
            ? u.boPhan.split(";").map((bp: string) => bp.trim()).filter((bp: string) => bp !== "")
            : [];

          // Check if there's any overlap between the two department lists
          const hasOverlap = currentUserBoPhanList.some((bp: string) =>
            candidateBoPhanList.includes(bp)
          );

          return hasOverlap;
        };
      } else {
        // No boPhan means they can see all in same phongBan
        filterConditions = (u: any) => u.phongBanId === currentUser.phongBanId && u.id !== currentUserId;
      }
      result = result.filter(filterConditions);
    } else {
      // Nếu không tìm thấy user, trả về empty
      result = [];
    }
  } else {
    // Logic cũ nếu không có currentUserId
    if (phongBanId) {
      result = result.filter((u) => u.phongBanId === phongBanId);
    }
    // Only filter by boPhan if parameter is provided and not empty
    // This ensures we don't filter when boPhan is null, undefined, or empty string
    if (boPhan && boPhan.trim() !== "") {
      result = result.filter((u) => u.boPhan === boPhan);
    }
    if (role) result = result.filter((u) => u.role === role);
    if (excludeId) result = result.filter((u) => u.id !== excludeId);
  }

  const total = result.length;
  const start = (page - 1) * perPage;
  const items = result.slice(start, start + perPage).map((u) => ({
    id: u.id,
    hoTen: u.hoTen,
    maNhanVien: u.maNhanVien,
    phongBanId: u.phongBanId,
    boPhan: u.boPhan,
    role: u.role,
    email: u.email,
    trangThaiKH: u.trangThaiKH,
    daDangKy: u.daDangKy,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
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

export async function POST(request: Request) {
  try {
    // ensure sqlite and initial data exist
    await authService.initializeFromMockData(mockUsers, mockPhongBans as any);

    const body = await request.json();
    const {
      maNhanVien,
      hoTen,
      email,
      phongBanId,
      role,
      trangThaiKH = true,
      boPhan,
    } = body;

    if (!maNhanVien || typeof maNhanVien !== "string") {
      return NextResponse.json({ error: "Mã nhân viên không hợp lệ" }, { status: 400 });
    }
    if (!phongBanId || typeof phongBanId !== "string") {
      return NextResponse.json({ error: "Phòng ban không hợp lệ" }, { status: 400 });
    }

    // check existing
    const existing = authService.getUserByMaNhanVien(maNhanVien);
    if (existing) {
      return NextResponse.json({ error: "Mã nhân viên đã tồn tại" }, { status: 400 });
    }

    const id = `user_${Date.now()}`;
    // default password (hashed)
    const defaultPassword = await authService.hashPassword("123456");

    const createdRow = authService.createUserAndGet({
      id,
      maNhanVien,
      hoTen,
      email,
      matKhau: defaultPassword,
      role: role || "nhan_vien",
      phongBanId,
      boPhan: boPhan || null,
      daDangKy: false,
      trangThaiKH: !!trangThaiKH,
    } as any);

    const created = createdRow || authService.getUserByMaNhanVien(maNhanVien);
    if (!created) {
      return NextResponse.json({ error: "Không thể tạo người dùng" }, { status: 500 });
    }

    return NextResponse.json({
      user: {
        id: created.id,
        maNhanVien: created.ma_nhan_vien,
        hoTen: created.ho_ten,
        email: created.email,
        role: created.role,
        phongBanId: created.phong_ban_id,
        daDangKy: created.da_dang_ky === 1,
        trangThaiKH: created.trang_thai_kh === 1,
        boPhan: created.bo_phan,
        createdAt: created.created_at,
        updatedAt: created.updated_at,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Lỗi khi tạo người dùng", details: (error && (error as any).message) || String(error) },
      { status: 500 }
    );
  }
}
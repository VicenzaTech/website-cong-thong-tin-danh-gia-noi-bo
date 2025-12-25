import { NextResponse } from "next/server";
import { authService } from "@/libs/sqlite.server";
import { users as mockUsers, phongBans as mockPhongBans } from "@/_mock/db";

export async function POST(request: Request) {
  try {
    await authService.initializeFromMockData(mockUsers, mockPhongBans);
    
    const body = await request.json();
    const { maNhanVien } = body;

    if (!maNhanVien) {
      return NextResponse.json(
        { error: "Vui long nhap ma nhan vien" },
        { status: 400 }
      );
    }

    const user = authService.getUserByMaNhanVien(maNhanVien);
    
    if (!user) {
      return NextResponse.json(
        { error: "Khong tim thay ma nhan vien nay" },
        { status: 404 }
      );
    }

    if (!user.trang_thai_kh) {
      return NextResponse.json(
        { error: "Tai khoan cua ban da bi vo hieu hoa" },
        { status: 403 }
      );
    }

    const phongBan = authService.getPhongBanById(user.phong_ban_id);

    const userData = {
      id: user.id,
      maNhanVien: user.ma_nhan_vien,
      hoTen: user.ho_ten,
      email: user.email,
      role: user.role,
      phongBanId: user.phong_ban_id,
      phongBanName: phongBan?.ten_phong_ban || "N/A",
      daDangKy: user.da_dang_ky === 1,
      trangThaiKH: user.trang_thai_kh === 1,
      hasPassword: !!user.mat_khau,
      daDoiMatKhau: user.da_doi_mat_khau === 1,
    };

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error("Check user error:", error);
    return NextResponse.json(
      { error: "Da xay ra loi" },
      { status: 500 }
    );
  }
}


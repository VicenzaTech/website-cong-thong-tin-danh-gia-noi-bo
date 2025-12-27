import { NextResponse } from "next/server";
import { authService } from "@/libs/sqlite.server";
import { users as mockUsers, phongBans as mockPhongBans } from "@/_mock/db";

export async function POST(request: Request) {
  try {
    await authService.initializeFromMockData(mockUsers, mockPhongBans);
    
    const body = await request.json();
    const { maNhanVien } = body;

    // Validate input
    if (!maNhanVien || typeof maNhanVien !== 'string') {
      return NextResponse.json(
        { error: "Vui lòng nhập mã nhân viên hợp lệ" },
        { status: 400 }
      );
    }

    // Sanitize input - trim whitespace
    const sanitizedMaNhanVien = maNhanVien.trim();
    
    if (!sanitizedMaNhanVien) {
      return NextResponse.json(
        { error: "Vui lòng nhập mã nhân viên" },
        { status: 400 }
      );
    }

    const user = authService.getUserByMaNhanVien(sanitizedMaNhanVien);
    
    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy mã nhân viên này" },
        { status: 404 }
      );
    }

    if (!user.trang_thai_kh) {
      return NextResponse.json(
        { error: "Tài khoản của bạn đã bị vô hiệu hóa" },
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
      boPhan: user.bo_phan,
    };

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error("Check user error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi" },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import { authService } from "@/libs/sqlite.server";
import { users as mockUsers, phongBans as mockPhongBans } from "@/_mock/db";

export async function POST(request: Request) {
  try {
    await authService.initializeFromMockData(mockUsers, mockPhongBans);
    
    const body = await request.json();
    const { maNhanVien, matKhau } = body;

    if (!maNhanVien || !matKhau) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    const user = await authService.verifyPassword(maNhanVien, matKhau);
    
    if (!user) {
      return NextResponse.json(
        { error: "Mã nhân viên hoặc mật khẩu không chính xác" },
        { status: 401 }
      );
    }

    if (!user.trang_thai_kh) {
      return NextResponse.json(
        { error: "Tài khoản của bạn đã bị vô hiệu hóa" },
        { status: 403 }
      );
    }

    authService.updateUser(user.id, {
      lastLoginAt: new Date(),
    });

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
      daDoiMatKhau: user.da_doi_mat_khau === 1,
      boPhan: user.bo_phan,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi đăng nhập" },
      { status: 500 }
    );
  }
}


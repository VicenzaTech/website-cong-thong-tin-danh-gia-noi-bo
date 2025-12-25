import { NextResponse } from "next/server";
import { authService } from "@/libs/sqlite.server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, currentPassword, newPassword } = body;

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    const result = authService.changePassword(userId, currentPassword, newPassword);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    const user = authService.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    const userData = {
      id: user.id,
      maNhanVien: user.ma_nhan_vien,
      hoTen: user.ho_ten,
      email: user.email,
      role: user.role,
      phongBanId: user.phong_ban_id,
      daDangKy: user.da_dang_ky === 1,
      trangThaiKH: user.trang_thai_kh === 1,
      daDoiMatKhau: user.da_doi_mat_khau === 1,
      matKhau: user.mat_khau,
      matKhauCu: user.mat_khau_cu,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };

    return NextResponse.json({ 
      success: true,
      user: userData 
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi đổi mật khẩu" },
      { status: 500 }
    );
  }
}


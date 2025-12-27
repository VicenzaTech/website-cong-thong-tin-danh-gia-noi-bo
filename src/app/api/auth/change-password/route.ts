import { NextResponse } from "next/server";
import { authService } from "@/libs/sqlite.server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, currentPassword, newPassword, forceChange } = body;

    // Validate userId
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: "ID người dùng không hợp lệ" },
        { status: 400 }
      );
    }

    // Validate newPassword
    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json(
        { error: "Vui lòng nhập mật khẩu mới" },
        { status: 400 }
      );
    }

    if (!forceChange && (!currentPassword || typeof currentPassword !== 'string')) {
      return NextResponse.json(
        { error: "Vui lòng nhập mật khẩu hiện tại" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    // Verify user exists before attempting password change
    const existingUser = authService.getUserById(userId);
    if (!existingUser) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    // Check if user account is active
    if (!existingUser.trang_thai_kh) {
      return NextResponse.json(
        { error: "Tài khoản của bạn đã bị vô hiệu hóa" },
        { status: 403 }
      );
    }

    const result = await authService.changePassword(
      userId, 
      forceChange ? "" : (currentPassword || ""), 
      newPassword, 
      forceChange || false
    );

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


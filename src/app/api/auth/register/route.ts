import { NextResponse } from "next/server";
import { authService } from "@/libs/sqlite.server";
import { users as mockUsers, phongBans as mockPhongBans } from "@/_mock/db";

export async function POST(request: Request) {
  try {
    await authService.initializeFromMockData(mockUsers, mockPhongBans);
    
    const body = await request.json();
    const { userId, hoTen, email, matKhau } = body;

    // Validate required fields
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: "ID người dùng không hợp lệ" },
        { status: 400 }
      );
    }

    if (!hoTen || typeof hoTen !== 'string' || hoTen.trim().length < 3) {
      return NextResponse.json(
        { error: "Họ tên phải có ít nhất 3 ký tự" },
        { status: 400 }
      );
    }

    if (!matKhau || typeof matKhau !== 'string') {
      return NextResponse.json(
        { error: "Vui lòng nhập mật khẩu" },
        { status: 400 }
      );
    }

    if (matKhau.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedHoTen = hoTen.trim();
    const sanitizedEmail = email?.trim() || undefined;

    const user = authService.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    // Check if user already registered
    if (user.da_dang_ky === 1) {
      return NextResponse.json(
        { error: "Tài khoản này đã được đăng ký" },
        { status: 400 }
      );
    }

    const hashedPassword = await authService.hashPassword(matKhau);

    authService.updateUser(userId, {
      hoTen: sanitizedHoTen,
      email: sanitizedEmail,
      matKhau: hashedPassword,
      daDangKy: true,
      daDoiMatKhau: true,
    });

    const updatedUser = authService.getUserById(userId);
    if (!updatedUser) {
      return NextResponse.json(
        { error: "Không thể cập nhật thông tin" },
        { status: 500 }
      );
    }

    const phongBan = authService.getPhongBanById(updatedUser.phong_ban_id);

    const userData = {
      id: updatedUser.id,
      maNhanVien: updatedUser.ma_nhan_vien,
      hoTen: updatedUser.ho_ten,
      email: updatedUser.email,
      role: updatedUser.role,
      phongBanId: updatedUser.phong_ban_id,
      phongBanName: phongBan?.ten_phong_ban || "N/A",
      daDangKy: updatedUser.da_dang_ky === 1,
      trangThaiKH: updatedUser.trang_thai_kh === 1,
      daDoiMatKhau: updatedUser.da_doi_mat_khau === 1,
      boPhan: updatedUser.bo_phan,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at,
    };

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi đăng ký" },
      { status: 500 }
    );
  }
}


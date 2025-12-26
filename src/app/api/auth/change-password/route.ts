import { NextResponse } from "next/server";
import { authService } from "@/libs/sqlite.server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, currentPassword, newPassword, forceChange } = body;

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: "Vui long nhap day du thong tin" },
        { status: 400 }
      );
    }

    if (!forceChange && !currentPassword) {
      return NextResponse.json(
        { error: "Vui long nhap mat khau hien tai" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Mat khau moi phai co it nhat 6 ky tu" },
        { status: 400 }
      );
    }

    const result = await authService.changePassword(userId, currentPassword || "", newPassword, forceChange || false);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    const user = authService.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "Khong tim thay nguoi dung" },
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
      { error: "Da xay ra loi khi doi mat khau" },
      { status: 500 }
    );
  }
}


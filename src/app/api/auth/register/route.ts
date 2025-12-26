import { NextResponse } from "next/server";
import { authService } from "@/libs/sqlite.server";
import { users as mockUsers, phongBans as mockPhongBans } from "@/_mock/db";

export async function POST(request: Request) {
  try {
    await authService.initializeFromMockData(mockUsers, mockPhongBans);
    
    const body = await request.json();
    const { userId, hoTen, email, matKhau } = body;

    if (!userId || !hoTen || !matKhau) {
      return NextResponse.json(
        { error: "Vui long nhap day du thong tin" },
        { status: 400 }
      );
    }

    if (matKhau.length < 6) {
      return NextResponse.json(
        { error: "Mat khau phai co it nhat 6 ky tu" },
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

    const hashedPassword = await authService.hashPassword(matKhau);

    authService.updateUser(userId, {
      hoTen,
      email: email || undefined,
      matKhau: hashedPassword,
      daDangKy: true,
      daDoiMatKhau: true,
    });

    const updatedUser = authService.getUserById(userId);
    if (!updatedUser) {
      return NextResponse.json(
        { error: "Khong the cap nhat thong tin" },
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
      { error: "Da xay ra loi khi dang ky" },
      { status: 500 }
    );
  }
}


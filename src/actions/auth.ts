"use server";

import { prisma } from "@/libs/prisma";
import bcrypt from "bcryptjs";

export async function checkUserByMaNhanVien(maNhanVien: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        maNhanVien,
        deletedAt: null,
      },
      include: {
        phongBan: true,
      },
    });

    if (!user) {
      return { success: false, error: "Không tìm thấy mã nhân viên" };
    }

    if (!user.trangThaiKH) {
      return { success: false, error: "Tài khoản đã bị vô hiệu hóa" };
    }

    return {
      success: true,
      user: {
        id: user.id,
        maNhanVien: user.maNhanVien,
        hoTen: user.hoTen,
        email: user.email,
        phongBanId: user.phongBanId,
        phongBanName: user.phongBan?.tenPhongBan || "N/A",
        daDangKy: user.daDangKy,
        hasPassword: !!user.matKhau,
      },
    };
  } catch (error) {
    console.error("Error checking user:", error);
    return { success: false, error: "Đã xảy ra lỗi khi kiểm tra người dùng" };
  }
}

export async function updateUserPassword(
  userId: string,
  hoTen: string,
  email: string | null,
  password: string
) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        hoTen,
        email,
        matKhau: hashedPassword,
        daDangKy: true,
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "Đã xảy ra lỗi khi cập nhật thông tin" };
  }
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.matKhau) {
      return { success: false, error: "Người dùng không tồn tại" };
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.matKhau
    );

    if (!isPasswordValid) {
      return { success: false, error: "Mật khẩu hiện tại không chính xác" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        matKhau: hashedPassword,
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, error: "Đã xảy ra lỗi khi đổi mật khẩu" };
  }
}


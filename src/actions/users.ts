"use server";

import { prisma } from "@/libs/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@/types/schema";

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      include: {
        phongBan: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: users };
  } catch (error) {
    console.error("Error getting users:", error);
    return { success: false, error: "Không thể lấy danh sách người dùng" };
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: {
        phongBan: true,
      },
    });
    return { success: true, data: user };
  } catch (error) {
    console.error("Error getting user:", error);
    return { success: false, error: "Không thể lấy thông tin người dùng" };
  }
}

export async function getUsersByPhongBan(phongBanId: string) {
  try {
    const users = await prisma.user.findMany({
      where: { phongBanId, deletedAt: null },
      include: {
        phongBan: true,
      },
      orderBy: { hoTen: "asc" },
    });
    return { success: true, data: users };
  } catch (error) {
    console.error("Error getting users by phong ban:", error);
    return { success: false, error: "Không thể lấy danh sách người dùng" };
  }
}

export async function createUser(data: {
  maNhanVien: string;
  hoTen: string;
  email?: string;
  matKhau: string;
  role: Role;
  phongBanId: string;
}) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { maNhanVien: data.maNhanVien },
    });

    if (existingUser) {
      return { success: false, error: "Mã nhân viên đã tồn tại" };
    }

    const hashedPassword = await bcrypt.hash(data.matKhau, 10);

    const user = await prisma.user.create({
      data: {
        maNhanVien: data.maNhanVien,
        hoTen: data.hoTen,
        email: data.email || null,
        matKhau: hashedPassword,
        role: data.role,
        phongBanId: data.phongBanId,
        daDangKy: true,
        trangThaiKH: true,
      },
      include: {
        phongBan: true,
      },
    });

    return { success: true, data: user };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Không thể tạo người dùng mới" };
  }
}

export async function updateUser(
  id: string,
  data: {
    hoTen?: string;
    email?: string;
    role?: Role;
    phongBanId?: string;
    trangThaiKH?: boolean;
  }
) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        phongBan: true,
      },
    });

    return { success: true, data: user };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "Không thể cập nhật người dùng" };
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Không thể xóa người dùng" };
  }
}


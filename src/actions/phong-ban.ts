"use server";

import { prisma } from "@/libs/prisma";

export async function getAllPhongBans() {
  try {
    const phongBans = await prisma.phongBan.findMany({
      where: { deletedAt: null },
      include: {
        truongPhong: {
          select: {
            id: true,
            maNhanVien: true,
            hoTen: true,
            email: true,
          },
        },
        _count: {
          select: {
            users: {
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: { tenPhongBan: "asc" },
    });
    return { success: true, data: phongBans };
  } catch (error) {
    console.error("Error getting phong bans:", error);
    return { success: false, error: "Không thể lấy danh sách phòng ban" };
  }
}

export async function getPhongBanById(id: string) {
  try {
    const phongBan = await prisma.phongBan.findUnique({
      where: { id, deletedAt: null },
      include: {
        truongPhong: true,
        users: {
          where: { deletedAt: null },
          orderBy: { hoTen: "asc" },
        },
      },
    });
    return { success: true, data: phongBan };
  } catch (error) {
    console.error("Error getting phong ban:", error);
    return { success: false, error: "Không thể lấy thông tin phòng ban" };
  }
}

export async function createPhongBan(data: {
  tenPhongBan: string;
  moTa?: string;
  truongPhongId?: string;
}) {
  try {
    const existing = await prisma.phongBan.findFirst({
      where: { tenPhongBan: data.tenPhongBan, deletedAt: null },
    });

    if (existing) {
      return { success: false, error: "Tên phòng ban đã tồn tại" };
    }

    const phongBan = await prisma.phongBan.create({
      data: {
        tenPhongBan: data.tenPhongBan,
        moTa: data.moTa || null,
        truongPhongId: data.truongPhongId || null,
      },
      include: {
        truongPhong: true,
      },
    });

    return { success: true, data: phongBan };
  } catch (error) {
    console.error("Error creating phong ban:", error);
    return { success: false, error: "Không thể tạo phòng ban mới" };
  }
}

export async function updatePhongBan(
  id: string,
  data: {
    tenPhongBan?: string;
    moTa?: string;
    truongPhongId?: string;
  }
) {
  try {
    const phongBan = await prisma.phongBan.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        truongPhong: true,
      },
    });

    return { success: true, data: phongBan };
  } catch (error) {
    console.error("Error updating phong ban:", error);
    return { success: false, error: "Không thể cập nhật phòng ban" };
  }
}

export async function deletePhongBan(id: string) {
  try {
    await prisma.phongBan.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting phong ban:", error);
    return { success: false, error: "Không thể xóa phòng ban" };
  }
}


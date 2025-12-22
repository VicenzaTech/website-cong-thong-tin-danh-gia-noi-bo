"use server";

import { prisma } from "@/libs/prisma";

export async function getAllKyDanhGias() {
  try {
    const kyDanhGias = await prisma.kyDanhGia.findMany({
      include: {
        _count: {
          select: {
            danhGias: true,
          },
        },
      },
      orderBy: { ngayBatDau: "desc" },
    });
    return { success: true, data: kyDanhGias };
  } catch (error) {
    console.error("Error getting ky danh gias:", error);
    return { success: false, error: "Không thể lấy danh sách kỳ đánh giá" };
  }
}

export async function getActiveKyDanhGias() {
  try {
    const kyDanhGias = await prisma.kyDanhGia.findMany({
      where: { dangMo: true },
      orderBy: { ngayBatDau: "desc" },
    });
    return { success: true, data: kyDanhGias };
  } catch (error) {
    console.error("Error getting active ky danh gias:", error);
    return { success: false, error: "Không thể lấy kỳ đánh giá đang mở" };
  }
}

export async function getKyDanhGiaById(id: string) {
  try {
    const kyDanhGia = await prisma.kyDanhGia.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            danhGias: true,
          },
        },
      },
    });
    return { success: true, data: kyDanhGia };
  } catch (error) {
    console.error("Error getting ky danh gia:", error);
    return { success: false, error: "Không thể lấy thông tin kỳ đánh giá" };
  }
}

export async function createKyDanhGia(data: {
  tenKy: string;
  moTa?: string;
  ngayBatDau: Date;
  ngayKetThuc: Date;
  dangMo: boolean;
}) {
  try {
    const kyDanhGia = await prisma.kyDanhGia.create({
      data: {
        tenKy: data.tenKy,
        moTa: data.moTa || null,
        ngayBatDau: data.ngayBatDau,
        ngayKetThuc: data.ngayKetThuc,
        dangMo: data.dangMo,
      },
    });

    return { success: true, data: kyDanhGia };
  } catch (error) {
    console.error("Error creating ky danh gia:", error);
    return { success: false, error: "Không thể tạo kỳ đánh giá mới" };
  }
}

export async function updateKyDanhGia(
  id: string,
  data: {
    tenKy?: string;
    moTa?: string;
    ngayBatDau?: Date;
    ngayKetThuc?: Date;
    dangMo?: boolean;
  }
) {
  try {
    const kyDanhGia = await prisma.kyDanhGia.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return { success: true, data: kyDanhGia };
  } catch (error) {
    console.error("Error updating ky danh gia:", error);
    return { success: false, error: "Không thể cập nhật kỳ đánh giá" };
  }
}

export async function toggleKyDanhGia(id: string, dangMo: boolean) {
  try {
    const kyDanhGia = await prisma.kyDanhGia.update({
      where: { id },
      data: {
        dangMo,
        updatedAt: new Date(),
      },
    });

    return { success: true, data: kyDanhGia };
  } catch (error) {
    console.error("Error toggling ky danh gia:", error);
    return { success: false, error: "Không thể thay đổi trạng thái kỳ đánh giá" };
  }
}

export async function deleteKyDanhGia(id: string) {
  try {
    const kyDanhGia = await prisma.kyDanhGia.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            danhGias: true,
          },
        },
      },
    });

    if (!kyDanhGia) {
      return { success: false, error: "Không tìm thấy kỳ đánh giá" };
    }

    if (kyDanhGia._count.danhGias > 0) {
      return {
        success: false,
        error: `Không thể xóa kỳ đánh giá này vì đã có ${kyDanhGia._count.danhGias} đánh giá liên quan`,
      };
    }

    await prisma.kyDanhGia.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting ky danh gia:", error);
    return { success: false, error: "Không thể xóa kỳ đánh giá" };
  }
}


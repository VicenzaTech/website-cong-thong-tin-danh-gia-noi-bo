"use server";

import { prisma } from "@/libs/prisma";
import { LoaiDanhGia, PhamViApDung, TrangThaiBieuMau } from "@/types/schema";
import { TrangThaiBieuMau as PrismaTrangThaiBieuMau } from "@prisma/client";

export async function getAllBieuMaus() {
  try {
    const bieuMaus = await prisma.bieuMau.findMany({
      where: { deletedAt: null },
      include: {
        phongBan: true,
        nguoiTao: {
          select: {
            id: true,
            hoTen: true,
            maNhanVien: true,
          },
        },
        _count: {
          select: {
            cauHois: true,
            danhGias: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: bieuMaus };
  } catch (error) {
    console.error("Error getting bieu maus:", error);
    return { success: false, error: "Không thể lấy danh sách biểu mẫu" };
  }
}

export async function getActiveBieuMaus() {
  try {
    const bieuMaus = await prisma.bieuMau.findMany({
      where: {
        trangThai: TrangThaiBieuMau.KICH_HOAT,
        deletedAt: null,
      },
      include: {
        cauHois: {
          orderBy: { thuTu: "asc" },
        },
        phongBan: true,
      },
    });
    return { success: true, data: bieuMaus };
  } catch (error) {
    console.error("Error getting active bieu maus:", error);
    return { success: false, error: "Không thể lấy danh sách biểu mẫu kích hoạt" };
  }
}

export async function getBieuMauById(id: string) {
  try {
    const bieuMau = await prisma.bieuMau.findUnique({
      where: { id, deletedAt: null },
      include: {
        phongBan: true,
        nguoiTao: true,
        cauHois: {
          orderBy: { thuTu: "asc" },
        },
      },
    });
    return { success: true, data: bieuMau };
  } catch (error) {
    console.error("Error getting bieu mau:", error);
    return { success: false, error: "Không thể lấy thông tin biểu mẫu" };
  }
}

export async function getBieuMausByLoai(loaiDanhGia: LoaiDanhGia) {
  try {
    const bieuMaus = await prisma.bieuMau.findMany({
      where: {
        loaiDanhGia,
        trangThai: TrangThaiBieuMau.KICH_HOAT,
        deletedAt: null,
      },
      include: {
        cauHois: {
          orderBy: { thuTu: "asc" },
        },
        phongBan: true,
      },
    });
    return { success: true, data: bieuMaus };
  } catch (error) {
    console.error("Error getting bieu maus by loai:", error);
    return { success: false, error: "Không thể lấy danh sách biểu mẫu" };
  }
}

export async function createBieuMau(data: {
  tenBieuMau: string;
  loaiDanhGia: LoaiDanhGia;
  phamViApDung: PhamViApDung;
  phongBanId?: string;
  moTa?: string;
  nguoiTaoId: string;
  trangThai?: TrangThaiBieuMau;
  cauHois: Array<{
    noiDung: string;
    thuTu: number;
    diemToiDa: number;
    batBuoc: boolean;
  }>;
}) {
  try {
    let trangThai: PrismaTrangThaiBieuMau;
    if (data.trangThai) {
      trangThai = data.trangThai as PrismaTrangThaiBieuMau;
    } else {
      trangThai = PrismaTrangThaiBieuMau.NHAP;
    }

    const createData: any = {
      tenBieuMau: data.tenBieuMau,
      loaiDanhGia: data.loaiDanhGia,
      phamViApDung: data.phamViApDung,
      phongBanId: data.phongBanId || null,
      moTa: data.moTa || null,
      nguoiTaoId: data.nguoiTaoId,
      trangThai,
      cauHois: {
        create: data.cauHois,
      },
    };

    if (trangThai === PrismaTrangThaiBieuMau.KICH_HOAT) {
      createData.ngayPhatHanh = new Date();
    }

    const bieuMau = await prisma.bieuMau.create({
      data: createData,
      include: {
        cauHois: true,
        phongBan: true,
      },
    });

    return { success: true, data: bieuMau };
  } catch (error) {
    console.error("Error creating bieu mau:", error);
    return { success: false, error: "Không thể tạo biểu mẫu mới" };
  }
}

export async function updateBieuMau(
  id: string,
  data: {
    tenBieuMau?: string;
    moTa?: string;
    trangThai?: TrangThaiBieuMau;
    phongBanId?: string;
  }
) {
  try {
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    if (data.trangThai === TrangThaiBieuMau.KICH_HOAT) {
      updateData.ngayPhatHanh = new Date();
    }

    const bieuMau = await prisma.bieuMau.update({
      where: { id },
      data: updateData,
      include: {
        cauHois: true,
        phongBan: true,
      },
    });

    return { success: true, data: bieuMau };
  } catch (error) {
    console.error("Error updating bieu mau:", error);
    return { success: false, error: "Không thể cập nhật biểu mẫu" };
  }
}

export async function deleteBieuMau(id: string) {
  try {
    await prisma.bieuMau.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting bieu mau:", error);
    return { success: false, error: "Không thể xóa biểu mẫu" };
  }
}

export async function getCauHoisByBieuMau(bieuMauId: string) {
  try {
    const cauHois = await prisma.cauHoi.findMany({
      where: { bieuMauId },
      orderBy: { thuTu: "asc" },
    });
    return { success: true, data: cauHois };
  } catch (error) {
    console.error("Error getting cau hois:", error);
    return { success: false, error: "Không thể lấy danh sách câu hỏi" };
  }
}


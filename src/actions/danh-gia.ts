"use server";

import { prisma } from "@/libs/prisma";

export async function getAllDanhGias() {
  try {
    const danhGias = await prisma.danhGia.findMany({
      include: {
        nguoiDanhGia: {
          select: {
            id: true,
            maNhanVien: true,
            hoTen: true,
            phongBan: true,
          },
        },
        nguoiDuocDanhGia: {
          select: {
            id: true,
            maNhanVien: true,
            hoTen: true,
            phongBan: true,
          },
        },
        bieuMau: {
          select: {
            id: true,
            tenBieuMau: true,
            loaiDanhGia: true,
          },
        },
        kyDanhGia: true,
        cauTraLois: {
          include: {
            cauHoi: true,
          },
          orderBy: {
            cauHoi: {
              thuTu: "asc",
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: danhGias };
  } catch (error) {
    console.error("Error getting danh gias:", error);
    return { success: false, error: "Không thể lấy danh sách đánh giá" };
  }
}

export async function getDanhGiaById(id: string) {
  try {
    const danhGia = await prisma.danhGia.findUnique({
      where: { id },
      include: {
        nguoiDanhGia: {
          include: {
            phongBan: true,
          },
        },
        nguoiDuocDanhGia: {
          include: {
            phongBan: true,
          },
        },
        bieuMau: {
          include: {
            cauHois: {
              orderBy: { thuTu: "asc" },
            },
          },
        },
        kyDanhGia: true,
        cauTraLois: {
          include: {
            cauHoi: true,
          },
          orderBy: {
            cauHoi: {
              thuTu: "asc",
            },
          },
        },
      },
    });
    return { success: true, data: danhGia };
  } catch (error) {
    console.error("Error getting danh gia:", error);
    return { success: false, error: "Không thể lấy thông tin đánh giá" };
  }
}

export async function getDanhGiasByNguoiDanhGia(nguoiDanhGiaId: string) {
  try {
    const danhGias = await prisma.danhGia.findMany({
      where: { nguoiDanhGiaId },
      include: {
        nguoiDuocDanhGia: {
          select: {
            id: true,
            maNhanVien: true,
            hoTen: true,
            phongBan: true,
          },
        },
        bieuMau: {
          select: {
            id: true,
            tenBieuMau: true,
            loaiDanhGia: true,
          },
        },
        kyDanhGia: true,
        cauTraLois: {
          include: {
            cauHoi: true,
          },
          orderBy: {
            cauHoi: {
              thuTu: "asc",
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: danhGias };
  } catch (error) {
    console.error("Error getting danh gias by nguoi danh gia:", error);
    return { success: false, error: "Không thể lấy danh sách đánh giá" };
  }
}

export async function getDanhGiasByNguoiDuocDanhGia(nguoiDuocDanhGiaId: string) {
  try {
    const danhGias = await prisma.danhGia.findMany({
      where: { nguoiDuocDanhGiaId },
      include: {
        nguoiDanhGia: {
          select: {
            id: true,
            maNhanVien: true,
            hoTen: true,
            phongBan: true,
          },
        },
        bieuMau: {
          select: {
            id: true,
            tenBieuMau: true,
            loaiDanhGia: true,
          },
        },
        kyDanhGia: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: danhGias };
  } catch (error) {
    console.error("Error getting danh gias by nguoi duoc danh gia:", error);
    return { success: false, error: "Không thể lấy danh sách đánh giá" };
  }
}

export async function getDanhGiasByPhongBan(phongBanId: string) {
  try {
    const danhGias = await prisma.danhGia.findMany({
      where: {
        nguoiDanhGia: {
          phongBanId,
        },
      },
      include: {
        nguoiDanhGia: {
          select: {
            id: true,
            maNhanVien: true,
            hoTen: true,
          },
        },
        nguoiDuocDanhGia: {
          select: {
            id: true,
            maNhanVien: true,
            hoTen: true,
          },
        },
        bieuMau: {
          select: {
            id: true,
            tenBieuMau: true,
            loaiDanhGia: true,
          },
        },
        kyDanhGia: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: danhGias };
  } catch (error) {
    console.error("Error getting danh gias by phong ban:", error);
    return { success: false, error: "Không thể lấy danh sách đánh giá" };
  }
}

export async function checkExistingDanhGia(
  nguoiDanhGiaId: string,
  nguoiDuocDanhGiaId: string,
  bieuMauId: string,
  kyDanhGiaId: string
) {
  try {
    const existing = await prisma.danhGia.findUnique({
      where: {
        nguoiDanhGiaId_nguoiDuocDanhGiaId_bieuMauId_kyDanhGiaId: {
          nguoiDanhGiaId,
          nguoiDuocDanhGiaId,
          bieuMauId,
          kyDanhGiaId,
        },
      },
    });
    return { success: true, exists: !!existing, data: existing };
  } catch (error) {
    console.error("Error checking existing danh gia:", error);
    return { success: false, error: "Không thể kiểm tra đánh giá" };
  }
}

export async function createDanhGia(data: {
  nguoiDanhGiaId: string;
  nguoiDuocDanhGiaId: string;
  bieuMauId: string;
  kyDanhGiaId: string;
  nhanXetChung: string;
  cauTraLois: Array<{
    cauHoiId: string;
    diem: number;
    nhanXet?: string;
  }>;
}) {
  try {
    // Validate: Phải có ít nhất một câu trả lời
    if (!data.cauTraLois || data.cauTraLois.length === 0) {
      return { success: false, error: "Phải có ít nhất một câu trả lời" };
    }

    const existing = await checkExistingDanhGia(
      data.nguoiDanhGiaId,
      data.nguoiDuocDanhGiaId,
      data.bieuMauId,
      data.kyDanhGiaId
    );

    if (existing.exists) {
      return { success: false, error: "Bạn đã đánh giá người này rồi" };
    }

    const tongDiem = data.cauTraLois.reduce((sum, ctl) => sum + ctl.diem, 0);
    const diemTrungBinh = tongDiem / data.cauTraLois.length;

    const danhGia = await prisma.danhGia.create({
      data: {
        nguoiDanhGiaId: data.nguoiDanhGiaId,
        nguoiDuocDanhGiaId: data.nguoiDuocDanhGiaId,
        bieuMauId: data.bieuMauId,
        kyDanhGiaId: data.kyDanhGiaId,
        nhanXetChung: data.nhanXetChung,
        tongDiem,
        diemTrungBinh,
        daHoanThanh: true,
        submittedAt: new Date(),
        cauTraLois: {
          create: data.cauTraLois.map((ctl) => ({
            cauHoiId: ctl.cauHoiId,
            nguoiDungId: data.nguoiDanhGiaId,
            diem: ctl.diem,
            nhanXet: ctl.nhanXet || null,
          })),
        },
      },
      include: {
        nguoiDanhGia: true,
        nguoiDuocDanhGia: true,
        bieuMau: true,
        cauTraLois: true,
      },
    });

    return { success: true, data: danhGia };
  } catch (error) {
    console.error("Error creating danh gia:", error);
    return { success: false, error: "Không thể tạo đánh giá mới" };
  }
}

export async function updateDanhGia(
  id: string,
  data: {
    nhanXetChung?: string;
    cauTraLois?: Array<{
      id?: string;
      cauHoiId: string;
      diem: number;
      nhanXet?: string;
    }>;
  }
) {
  try {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.nhanXetChung) {
      updateData.nhanXetChung = data.nhanXetChung;
    }

    if (data.cauTraLois) {
      // Validate: Phải có ít nhất một câu trả lời
      if (data.cauTraLois.length === 0) {
        return { success: false, error: "Phải có ít nhất một câu trả lời" };
      }

      await prisma.cauTraLoi.deleteMany({
        where: { danhGiaId: id },
      });

      const danhGia = await prisma.danhGia.findUnique({
        where: { id },
        select: { nguoiDanhGiaId: true },
      });

      const tongDiem = data.cauTraLois.reduce((sum, ctl) => sum + ctl.diem, 0);
      const diemTrungBinh = tongDiem / data.cauTraLois.length;

      updateData.tongDiem = tongDiem;
      updateData.diemTrungBinh = diemTrungBinh;
      updateData.cauTraLois = {
        create: data.cauTraLois.map((ctl) => ({
          cauHoiId: ctl.cauHoiId,
          nguoiDungId: danhGia!.nguoiDanhGiaId,
          diem: ctl.diem,
          nhanXet: ctl.nhanXet || null,
        })),
      };
    }

    const danhGia = await prisma.danhGia.update({
      where: { id },
      data: updateData,
      include: {
        nguoiDanhGia: true,
        nguoiDuocDanhGia: true,
        bieuMau: true,
        cauTraLois: true,
      },
    });

    return { success: true, data: danhGia };
  } catch (error) {
    console.error("Error updating danh gia:", error);
    return { success: false, error: "Không thể cập nhật đánh giá" };
  }
}

export async function deleteDanhGia(id: string) {
  try {
    await prisma.danhGia.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting danh gia:", error);
    return { success: false, error: "Không thể xóa đánh giá" };
  }
}


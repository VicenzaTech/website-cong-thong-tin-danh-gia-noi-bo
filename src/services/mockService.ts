import {
  users,
  phongBans,
  kyDanhGias,
  bieuMaus,
  cauHois,
  danhGias,
  cauTraLois,
} from "@/_mock/db";
import type {
  User,
  PhongBan,
  KyDanhGia,
  BieuMau,
  CauHoi,
  DanhGia,
  CauTraLoi,
} from "@/types/schema";

export const fakeDelay = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const mockService = {
  users: {
    getAll: async (): Promise<User[]> => {
      await fakeDelay();
      return users.filter((u) => !u.deletedAt);
    },

    getById: async (id: string): Promise<User | undefined> => {
      await fakeDelay();
      return users.find((u) => u.id === id && !u.deletedAt);
    },

    getByMaNhanVien: async (maNhanVien: string): Promise<User | undefined> => {
      await fakeDelay();
      return users.find((u) => u.maNhanVien === maNhanVien && !u.deletedAt);
    },

    getByPhongBan: async (phongBanId: string): Promise<User[]> => {
      await fakeDelay();
      return users.filter((u) => u.phongBanId === phongBanId && !u.deletedAt);
    },

    create: async (data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> => {
      await fakeDelay();
      const newUser: User = {
        ...data,
        id: `user_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.push(newUser);
      return newUser;
    },

    update: async (id: string, data: Partial<User>): Promise<User | undefined> => {
      await fakeDelay();
      const index = users.findIndex((u) => u.id === id);
      if (index === -1) return undefined;

      users[index] = {
        ...users[index],
        ...data,
        updatedAt: new Date(),
      };
      return users[index];
    },

    delete: async (id: string): Promise<boolean> => {
      await fakeDelay();
      const index = users.findIndex((u) => u.id === id);
      if (index === -1) return false;

      users[index].deletedAt = new Date();
      users[index].updatedAt = new Date();
      return true;
    },
  },

  phongBans: {
    getAll: async (): Promise<PhongBan[]> => {
      await fakeDelay();
      return phongBans.filter((pb) => !pb.deletedAt);
    },

    getById: async (id: string): Promise<PhongBan | undefined> => {
      await fakeDelay();
      return phongBans.find((pb) => pb.id === id && !pb.deletedAt);
    },

    create: async (
      data: Omit<PhongBan, "id" | "createdAt" | "updatedAt">
    ): Promise<PhongBan> => {
      await fakeDelay();
      const newPhongBan: PhongBan = {
        ...data,
        id: `pb_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      phongBans.push(newPhongBan);
      return newPhongBan;
    },

    update: async (id: string, data: Partial<PhongBan>): Promise<PhongBan | undefined> => {
      await fakeDelay();
      const index = phongBans.findIndex((pb) => pb.id === id);
      if (index === -1) return undefined;

      phongBans[index] = {
        ...phongBans[index],
        ...data,
        updatedAt: new Date(),
      };
      return phongBans[index];
    },

    delete: async (id: string): Promise<boolean> => {
      await fakeDelay();
      const index = phongBans.findIndex((pb) => pb.id === id);
      if (index === -1) return false;

      phongBans[index].deletedAt = new Date();
      phongBans[index].updatedAt = new Date();
      return true;
    },
  },

  kyDanhGias: {
    getAll: async (): Promise<KyDanhGia[]> => {
      await fakeDelay();
      return kyDanhGias;
    },

    getActive: async (): Promise<KyDanhGia[]> => {
      await fakeDelay();
      return kyDanhGias.filter((ky) => ky.dangMo);
    },

    getById: async (id: string): Promise<KyDanhGia | undefined> => {
      await fakeDelay();
      return kyDanhGias.find((ky) => ky.id === id);
    },

    create: async (
      data: Omit<KyDanhGia, "id" | "createdAt" | "updatedAt">
    ): Promise<KyDanhGia> => {
      await fakeDelay();
      const newKy: KyDanhGia = {
        ...data,
        id: `ky_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      kyDanhGias.push(newKy);
      return newKy;
    },

    update: async (id: string, data: Partial<KyDanhGia>): Promise<KyDanhGia | undefined> => {
      await fakeDelay();
      const index = kyDanhGias.findIndex((ky) => ky.id === id);
      if (index === -1) return undefined;

      kyDanhGias[index] = {
        ...kyDanhGias[index],
        ...data,
        updatedAt: new Date(),
      };
      return kyDanhGias[index];
    },
  },

  bieuMaus: {
    getAll: async (): Promise<BieuMau[]> => {
      await fakeDelay();
      return bieuMaus.filter((bm) => !bm.deletedAt);
    },

    getActive: async (): Promise<BieuMau[]> => {
      await fakeDelay();
      return bieuMaus.filter((bm) => bm.trangThai === "KICH_HOAT" && !bm.deletedAt);
    },

    getById: async (id: string): Promise<BieuMau | undefined> => {
      await fakeDelay();
      return bieuMaus.find((bm) => bm.id === id && !bm.deletedAt);
    },

    getByLoai: async (loaiDanhGia: string): Promise<BieuMau[]> => {
      await fakeDelay();
      return bieuMaus.filter(
        (bm) => bm.loaiDanhGia === loaiDanhGia && bm.trangThai === "KICH_HOAT" && !bm.deletedAt
      );
    },

    create: async (data: Omit<BieuMau, "id" | "createdAt" | "updatedAt">): Promise<BieuMau> => {
      await fakeDelay();
      const newBieuMau: BieuMau = {
        ...data,
        id: `bm_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      bieuMaus.push(newBieuMau);
      return newBieuMau;
    },

    update: async (id: string, data: Partial<BieuMau>): Promise<BieuMau | undefined> => {
      await fakeDelay();
      const index = bieuMaus.findIndex((bm) => bm.id === id);
      if (index === -1) return undefined;

      bieuMaus[index] = {
        ...bieuMaus[index],
        ...data,
        updatedAt: new Date(),
      };
      return bieuMaus[index];
    },

    delete: async (id: string): Promise<boolean> => {
      await fakeDelay();
      const index = bieuMaus.findIndex((bm) => bm.id === id);
      if (index === -1) return false;

      bieuMaus[index].deletedAt = new Date();
      bieuMaus[index].updatedAt = new Date();
      return true;
    },
  },

  cauHois: {
    getByBieuMau: async (bieuMauId: string): Promise<CauHoi[]> => {
      await fakeDelay();
      return cauHois.filter((ch) => ch.bieuMauId === bieuMauId).sort((a, b) => a.thuTu - b.thuTu);
    },

    getById: async (id: string): Promise<CauHoi | undefined> => {
      await fakeDelay();
      return cauHois.find((ch) => ch.id === id);
    },

    create: async (data: Omit<CauHoi, "id" | "createdAt" | "updatedAt">): Promise<CauHoi> => {
      await fakeDelay();
      const newCauHoi: CauHoi = {
        ...data,
        id: `ch_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      cauHois.push(newCauHoi);
      return newCauHoi;
    },

    update: async (id: string, data: Partial<CauHoi>): Promise<CauHoi | undefined> => {
      await fakeDelay();
      const index = cauHois.findIndex((ch) => ch.id === id);
      if (index === -1) return undefined;

      cauHois[index] = {
        ...cauHois[index],
        ...data,
        updatedAt: new Date(),
      };
      return cauHois[index];
    },

    delete: async (id: string): Promise<boolean> => {
      await fakeDelay();
      const index = cauHois.findIndex((ch) => ch.id === id);
      if (index === -1) return false;

      cauHois.splice(index, 1);
      return true;
    },
  },

  danhGias: {
    getAll: async (): Promise<DanhGia[]> => {
      await fakeDelay();
      return danhGias;
    },

    getById: async (id: string): Promise<DanhGia | undefined> => {
      await fakeDelay();
      return danhGias.find((dg) => dg.id === id);
    },

    getByNguoiDanhGia: async (nguoiDanhGiaId: string): Promise<DanhGia[]> => {
      await fakeDelay();
      return danhGias.filter((dg) => dg.nguoiDanhGiaId === nguoiDanhGiaId);
    },

    getByNguoiDuocDanhGia: async (nguoiDuocDanhGiaId: string): Promise<DanhGia[]> => {
      await fakeDelay();
      return danhGias.filter((dg) => dg.nguoiDuocDanhGiaId === nguoiDuocDanhGiaId);
    },

    checkExisting: async (
      nguoiDanhGiaId: string,
      nguoiDuocDanhGiaId: string,
      bieuMauId: string,
      kyDanhGiaId: string
    ): Promise<DanhGia | undefined> => {
      await fakeDelay();
      return danhGias.find(
        (dg) =>
          dg.nguoiDanhGiaId === nguoiDanhGiaId &&
          dg.nguoiDuocDanhGiaId === nguoiDuocDanhGiaId &&
          dg.bieuMauId === bieuMauId &&
          dg.kyDanhGiaId === kyDanhGiaId
      );
    },

    create: async (data: Omit<DanhGia, "id" | "createdAt" | "updatedAt">): Promise<DanhGia> => {
      await fakeDelay();
      const newDanhGia: DanhGia = {
        ...data,
        id: `dg_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      danhGias.push(newDanhGia);
      return newDanhGia;
    },

    update: async (id: string, data: Partial<DanhGia>): Promise<DanhGia | undefined> => {
      await fakeDelay();
      const index = danhGias.findIndex((dg) => dg.id === id);
      if (index === -1) return undefined;

      danhGias[index] = {
        ...danhGias[index],
        ...data,
        updatedAt: new Date(),
      };
      return danhGias[index];
    },

    submitEvaluation: async (
      nguoiDanhGiaId: string,
      nguoiDuocDanhGiaId: string,
      bieuMauId: string,
      kyDanhGiaId: string,
      nhanXetChung: string,
      answers: Array<{ cauHoiId: string; diem: number; nhanXet?: string }>
    ): Promise<DanhGia> => {
      await fakeDelay(800);

      const existing = await mockService.danhGias.checkExisting(
        nguoiDanhGiaId,
        nguoiDuocDanhGiaId,
        bieuMauId,
        kyDanhGiaId
      );

      if (existing && existing.daHoanThanh) {
        throw new Error("Bạn đã hoàn thành đánh giá này rồi");
      }

      const tongDiem = answers.reduce((sum, ans) => sum + ans.diem, 0);
      const diemTrungBinh = answers.length > 0 ? tongDiem / answers.length : 0;

      const danhGia: DanhGia = {
        id: existing?.id || `dg_${Date.now()}`,
        nguoiDanhGiaId,
        nguoiDuocDanhGiaId,
        bieuMauId,
        kyDanhGiaId,
        nhanXetChung,
        tongDiem,
        diemTrungBinh,
        daHoanThanh: true,
        submittedAt: new Date(),
        createdAt: existing?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      if (existing) {
        const index = danhGias.findIndex((dg) => dg.id === existing.id);
        danhGias[index] = danhGia;
      } else {
        danhGias.push(danhGia);
      }

      for (const answer of answers) {
        const existingAnswer = cauTraLois.find(
          (ctl) => ctl.danhGiaId === danhGia.id && ctl.cauHoiId === answer.cauHoiId
        );

        const cauTraLoi: CauTraLoi = {
          id: existingAnswer?.id || `ctl_${Date.now()}_${answer.cauHoiId}`,
          danhGiaId: danhGia.id,
          cauHoiId: answer.cauHoiId,
          nguoiDungId: nguoiDanhGiaId,
          diem: answer.diem,
          nhanXet: answer.nhanXet,
          createdAt: existingAnswer?.createdAt || new Date(),
          updatedAt: new Date(),
        };

        if (existingAnswer) {
          const index = cauTraLois.findIndex((ctl) => ctl.id === existingAnswer.id);
          cauTraLois[index] = cauTraLoi;
        } else {
          cauTraLois.push(cauTraLoi);
        }
      }

      return danhGia;
    },
  },

  cauTraLois: {
    getByDanhGia: async (danhGiaId: string): Promise<CauTraLoi[]> => {
      await fakeDelay();
      return cauTraLois.filter((ctl) => ctl.danhGiaId === danhGiaId);
    },
  },
};


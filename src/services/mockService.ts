import {
  users as mockUsers,
  phongBans as mockPhongBans,
  kyDanhGias as mockKyDanhGias,
  bieuMaus as mockBieuMaus,
  cauHois as mockCauHois,
  danhGias as mockDanhGias,
  cauTraLois as mockCauTraLois,
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

export interface ChiTietTieuChi {
  tenTieuChi: string;
  diem: number | null;
  nhanXet: string;
}

export const mockService = {
  users: {
    getAll: async (): Promise<User[]> => {
      await fakeDelay();
      return mockUsers.filter((u) => !u.deletedAt);
    },

    getById: async (id: string): Promise<User | undefined> => {
      await fakeDelay();
      return mockUsers.find((u) => u.id === id && !u.deletedAt);
    },

    getByMaNhanVien: async (maNhanVien: string): Promise<User | undefined> => {
      await fakeDelay();
      return mockUsers.find((u) => u.maNhanVien === maNhanVien && !u.deletedAt);
    },

    getByPhongBan: async (phongBanId: string): Promise<User[]> => {
      await fakeDelay();
      return mockUsers.filter((u) => u.phongBanId === phongBanId && !u.deletedAt);
    },

    create: async (data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> => {
      await fakeDelay();
      const newUser: User = {
        ...data,
        id: `user_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockUsers.push(newUser);
      return newUser;
    },

    update: async (id: string, data: Partial<User>): Promise<User | undefined> => {
      await fakeDelay();
      const index = mockUsers.findIndex((u) => u.id === id);
      if (index === -1) return undefined;

      mockUsers[index] = {
        ...mockUsers[index],
        ...data,
        updatedAt: new Date(),
      };
      return mockUsers[index];
    },

    delete: async (id: string): Promise<boolean> => {
      await fakeDelay();
      const index = mockUsers.findIndex((u) => u.id === id);
      if (index === -1) return false;

      mockUsers[index].deletedAt = new Date();
      mockUsers[index].updatedAt = new Date();
      return true;
    },
  },

  phongBans: {
    getAll: async (): Promise<PhongBan[]> => {
      await fakeDelay();
      return mockPhongBans.filter((pb) => !pb.deletedAt);
    },

    getById: async (id: string): Promise<PhongBan | undefined> => {
      await fakeDelay();
      return mockPhongBans.find((pb) => pb.id === id && !pb.deletedAt);
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
      
      mockPhongBans.push(newPhongBan);
      return newPhongBan;
    },

    update: async (id: string, data: Partial<PhongBan>): Promise<PhongBan | undefined> => {
      await fakeDelay();
      const index = mockPhongBans.findIndex((pb) => pb.id === id);
      if (index === -1) return undefined;

      mockPhongBans[index] = {
        ...mockPhongBans[index],
        ...data,
        updatedAt: new Date(),
      };
      return mockPhongBans[index];
    },

    delete: async (id: string): Promise<boolean> => {
      await fakeDelay();
      const index = mockPhongBans.findIndex((pb) => pb.id === id);
      if (index === -1) return false;

      mockPhongBans[index].deletedAt = new Date();
      mockPhongBans[index].updatedAt = new Date();
      return true;
    },
  },

  kyDanhGias: {
    getAll: async (): Promise<KyDanhGia[]> => {
      await fakeDelay();
      return mockKyDanhGias;
    },

    getActive: async (): Promise<KyDanhGia[]> => {
      await fakeDelay();
      return mockKyDanhGias.filter((ky) => ky.dangMo);
    },

    getById: async (id: string): Promise<KyDanhGia | undefined> => {
      await fakeDelay();
      return mockKyDanhGias.find((ky) => ky.id === id);
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
      
      mockKyDanhGias.push(newKy);
      return newKy;
    },

    update: async (id: string, data: Partial<KyDanhGia>): Promise<KyDanhGia | undefined> => {
      await fakeDelay();
      const index = mockKyDanhGias.findIndex((ky) => ky.id === id);
      if (index === -1) return undefined;

      mockKyDanhGias[index] = {
        ...mockKyDanhGias[index],
        ...data,
        updatedAt: new Date(),
      };
      return mockKyDanhGias[index];
    },
  },

  bieuMaus: {
    getAll: async (): Promise<BieuMau[]> => {
      await fakeDelay();
      return mockBieuMaus.filter((bm) => !bm.deletedAt);
    },

    getActive: async (): Promise<BieuMau[]> => {
      await fakeDelay();
      return mockBieuMaus.filter((bm) => bm.trangThai === "KICH_HOAT" && !bm.deletedAt);
    },

    getById: async (id: string): Promise<BieuMau | undefined> => {
      await fakeDelay();
      return mockBieuMaus.find((bm) => bm.id === id && !bm.deletedAt);
    },

    getByLoai: async (loaiDanhGia: string): Promise<BieuMau[]> => {
      await fakeDelay();
      return mockBieuMaus.filter(
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
      
      mockBieuMaus.push(newBieuMau);
      return newBieuMau;
    },

    update: async (id: string, data: Partial<BieuMau>): Promise<BieuMau | undefined> => {
      await fakeDelay();
      const index = mockBieuMaus.findIndex((bm) => bm.id === id);
      if (index === -1) return undefined;

      mockBieuMaus[index] = {
        ...mockBieuMaus[index],
        ...data,
        updatedAt: new Date(),
      };
      return mockBieuMaus[index];
    },

    delete: async (id: string): Promise<boolean> => {
      await fakeDelay();
      const index = mockBieuMaus.findIndex((bm) => bm.id === id);
      if (index === -1) return false;

      mockBieuMaus[index].deletedAt = new Date();
      mockBieuMaus[index].updatedAt = new Date();
      return true;
    },
  },

  cauHois: {
    getByBieuMau: async (bieuMauId: string): Promise<CauHoi[]> => {
      await fakeDelay();
      return mockCauHois.filter((ch) => ch.bieuMauId === bieuMauId).sort((a, b) => a.thuTu - b.thuTu);
    },

    getById: async (id: string): Promise<CauHoi | undefined> => {
      await fakeDelay();
      return mockCauHois.find((ch) => ch.id === id);
    },

    create: async (data: Omit<CauHoi, "id" | "createdAt" | "updatedAt">): Promise<CauHoi> => {
      await fakeDelay();
      const newCauHoi: CauHoi = {
        ...data,
        id: `ch_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockCauHois.push(newCauHoi);
      return newCauHoi;
    },

    update: async (id: string, data: Partial<CauHoi>): Promise<CauHoi | undefined> => {
      await fakeDelay();
      const index = mockCauHois.findIndex((ch) => ch.id === id);
      if (index === -1) return undefined;

      mockCauHois[index] = {
        ...mockCauHois[index],
        ...data,
        updatedAt: new Date(),
      };
      return mockCauHois[index];
    },

    delete: async (id: string): Promise<boolean> => {
      await fakeDelay();
      const index = mockCauHois.findIndex((ch) => ch.id === id);
      if (index === -1) return false;

      mockCauHois.splice(index, 1);
      return true;
    },
  },
  
  cauTraLois: {
    getByDanhGia: async (danhGiaId: string): Promise<CauTraLoi[]> => {
      await fakeDelay();
      return mockCauTraLois.filter((ctl) => ctl.danhGiaId === danhGiaId);
    },
  },
  
  danhGias: {
    getAll: async (): Promise<DanhGia[]> => {
      await fakeDelay();
      return mockDanhGias;
    },

    getById: async (id: string): Promise<DanhGia | undefined> => {
      await fakeDelay();
      return mockDanhGias.find((dg) => dg.id === id);
    },

    getByNguoiDanhGia: async (nguoiDanhGiaId: string): Promise<DanhGia[]> => {
      await fakeDelay();
      return mockDanhGias.filter((dg) => dg.nguoiDanhGiaId === nguoiDanhGiaId);
    },

    getByNguoiDuocDanhGia: async (nguoiDuocDanhGiaId: string): Promise<DanhGia[]> => {
      await fakeDelay();
      return mockDanhGias.filter((dg) => dg.nguoiDuocDanhGiaId === nguoiDuocDanhGiaId);
    },

    checkExisting: async (
      nguoiDanhGiaId: string,
      nguoiDuocDanhGiaId: string,
      bieuMauId: string,
      kyDanhGiaId: string
    ): Promise<DanhGia | undefined> => {
      await fakeDelay();
      return mockDanhGias.find(
        (dg) =>
          dg.nguoiDanhGiaId === nguoiDanhGiaId &&
          dg.nguoiDuocDanhGiaId === nguoiDuocDanhGiaId &&
          dg.bieuMauId === bieuMauId &&
          dg.kyDanhGiaId === kyDanhGiaId
      );
    },

    canEdit: async (danhGiaId: string): Promise<boolean> => {
      await fakeDelay();
      const danhGia = mockDanhGias.find((dg) => dg.id === danhGiaId);
      if (!danhGia) return false;

      const kyDanhGia = mockKyDanhGias.find((ky) => ky.id === danhGia.kyDanhGiaId);
      if (!kyDanhGia) return false;

      const now = new Date();
      const endDate = new Date(kyDanhGia.ngayKetThuc);
      return now <= endDate;
    },

    create: async (data: Omit<DanhGia, "id" | "createdAt" | "updatedAt">): Promise<DanhGia> => {
      await fakeDelay();
      const newDanhGia: DanhGia = {
        ...data,
        id: `dg_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockDanhGias.push(newDanhGia);
      return newDanhGia;
    },

    update: async (id: string, data: Partial<DanhGia>): Promise<DanhGia | undefined> => {
      await fakeDelay();
      const index = mockDanhGias.findIndex((dg) => dg.id === id);
      if (index === -1) return undefined;

      mockDanhGias[index] = {
        ...mockDanhGias[index],
        ...data,
        updatedAt: new Date(),
      };
      return mockDanhGias[index];
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

      const cauHoiList = mockCauHois.filter((ch) => ch.bieuMauId === bieuMauId);

      const scoringQuestions = cauHoiList.filter((ch) => ch.diemToiDa > 0);
      const scoringAnswers = answers.filter((a) =>
        scoringQuestions.some((ch) => ch.id === a.cauHoiId)
      );
      
      const totalScore = scoringAnswers.reduce((sum, a) => sum + (a.diem || 0), 0);
      const diemTrungBinh =
        scoringQuestions.length > 0
          ? totalScore / scoringQuestions.length
          : 0;

      const tongDiem = scoringAnswers.reduce((sum, ans) => sum + (ans.diem ?? 0), 0);

      const khongXetThiDua = cauHoiList.some(
        (ch) => ch.diemToiDa === 0 && answers.find((a) => a.cauHoiId === ch.id && a.diem === 1)
      );

      const chiTietTieuChi: ChiTietTieuChi[] = cauHoiList.map((ch) => {
        const answer = answers.find((a) => a.cauHoiId === ch.id);
        return {
          tenTieuChi: ch.noiDung,
          diem: answer?.diem ?? null,
          nhanXet: answer?.nhanXet ?? "",
        };
      });

      const danhGia: DanhGia = {
        id: existing?.id || `dg_${Date.now()}`,
        nguoiDanhGiaId,
        nguoiDuocDanhGiaId,
        bieuMauId,
        kyDanhGiaId,
        nhanXetChung,
        tongDiem,
        diemTrungBinh: khongXetThiDua ? 0 : diemTrungBinh,
        daHoanThanh: true,
        submittedAt: new Date(),
        createdAt: existing?.createdAt || new Date(),
        updatedAt: new Date(),
        khongXetThiDua,
        chiTietTieuChi,
      };

      if (existing) {
        const index = mockDanhGias.findIndex((dg) => dg.id === existing.id);
        mockDanhGias[index] = danhGia;
      } else {
        mockDanhGias.push(danhGia);
      }

      for (const answer of answers) {
        const existingAnswer = mockCauTraLois.find(
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
          const index = mockCauTraLois.findIndex((ctl) => ctl.id === existingAnswer.id);
          mockCauTraLois[index] = cauTraLoi;
        } else {
          mockCauTraLois.push(cauTraLoi);
        }
      }

      return danhGia;
    },
  },
};


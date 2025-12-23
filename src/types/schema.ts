export enum Role {
  admin = "admin",
  truong_phong = "truong_phong",
  nhan_vien = "nhan_vien",
}

export enum LoaiDanhGia {
  LANH_DAO = "LANH_DAO",
  NHAN_VIEN = "NHAN_VIEN",
}

export enum PhamViApDung {
  PHONG_BAN = "PHONG_BAN",
  TOAN_CONG_TY = "TOAN_CONG_TY",
}

export enum TrangThaiBieuMau {
  NHAP = "NHAP",
  KICH_HOAT = "KICH_HOAT",
  VO_HIEU = "VO_HIEU",
}

export interface PhongBan {
  id: string;
  tenPhongBan: string;
  moTa?: string;
  truongPhongId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface User {
  id: string;
  maNhanVien: string;
  hoTen?: string;
  email?: string;
  matKhau?: string;
  role: Role;
  phongBanId: string;
  daDangKy: boolean;
  trangThaiKH: boolean;
  lastLoginAt?: Date;
  emailVerified?: Date;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface BieuMau {
  id: string;
  tenBieuMau: string;
  loaiDanhGia: LoaiDanhGia;
  phamViApDung: PhamViApDung;
  phongBanId?: string;
  trangThai: TrangThaiBieuMau;
  moTa?: string;
  nguoiTaoId?: string;
  ngayPhatHanh?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CauHoi {
  id: string;
  bieuMauId: string;
  noiDung: string;
  thuTu: number;
  diemToiDa: number;
  batBuoc: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChiTietTieuChi {
  tenTieuChi: string;
  diem: number | null;
  nhanXet: string;
}

export interface DanhGia {
  id: string;
  nguoiDanhGiaId: string;
  nguoiDuocDanhGiaId: string;
  bieuMauId: string;
  kyDanhGiaId: string;
  nhanXetChung: string;
  tongDiem?: number;
  diemTrungBinh?: number;
  daHoanThanh: boolean;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  chiTietTieuChi: ChiTietTieuChi[];

}

export interface CauTraLoi {
  id: string;
  danhGiaId: string;
  cauHoiId: string;
  nguoiDungId: string;
  diem: number;
  nhanXet?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KyDanhGia {
  id: string;
  tenKy: string;
  moTa?: string;
  ngayBatDau: Date;
  ngayKetThuc: Date;
  dangMo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LichSuThayDoi {
  id: string;
  nguoiDungId: string;
  hanhDong: string;
  bangTable: string;
  recordId?: string;
  noiDung?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}


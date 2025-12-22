-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'truong_phong', 'nhan_vien');

-- CreateEnum
CREATE TYPE "LoaiDanhGia" AS ENUM ('LANH_DAO', 'NHAN_VIEN');

-- CreateEnum
CREATE TYPE "PhamViApDung" AS ENUM ('PHONG_BAN', 'TOAN_CONG_TY');

-- CreateEnum
CREATE TYPE "TrangThaiBieuMau" AS ENUM ('NHAP', 'KICH_HOAT', 'VO_HIEU');

-- CreateTable
CREATE TABLE "phong_ban" (
    "id" TEXT NOT NULL,
    "tenPhongBan" TEXT NOT NULL,
    "moTa" TEXT,
    "truongPhongId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "phong_ban_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "maNhanVien" TEXT NOT NULL,
    "hoTen" TEXT,
    "email" TEXT,
    "matKhau" TEXT,
    "role" "Role" NOT NULL DEFAULT 'nhan_vien',
    "phongBanId" TEXT NOT NULL,
    "daDangKy" BOOLEAN NOT NULL DEFAULT false,
    "trangThaiKH" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bieu_mau" (
    "id" TEXT NOT NULL,
    "tenBieuMau" TEXT NOT NULL,
    "loaiDanhGia" "LoaiDanhGia" NOT NULL,
    "phamViApDung" "PhamViApDung" NOT NULL,
    "phongBanId" TEXT,
    "trangThai" "TrangThaiBieuMau" NOT NULL DEFAULT 'NHAP',
    "moTa" TEXT,
    "nguoiTaoId" TEXT,
    "ngayPhatHanh" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "bieu_mau_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cau_hoi" (
    "id" TEXT NOT NULL,
    "bieuMauId" TEXT NOT NULL,
    "noiDung" TEXT NOT NULL,
    "thuTu" INTEGER NOT NULL,
    "diemToiDa" INTEGER NOT NULL DEFAULT 5,
    "batBuoc" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cau_hoi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "danh_gia" (
    "id" TEXT NOT NULL,
    "nguoiDanhGiaId" TEXT NOT NULL,
    "nguoiDuocDanhGiaId" TEXT NOT NULL,
    "bieuMauId" TEXT NOT NULL,
    "kyDanhGiaId" TEXT NOT NULL,
    "nhanXetChung" TEXT NOT NULL,
    "tongDiem" DOUBLE PRECISION,
    "diemTrungBinh" DOUBLE PRECISION,
    "daHoanThanh" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "danh_gia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cau_tra_loi" (
    "id" TEXT NOT NULL,
    "danhGiaId" TEXT NOT NULL,
    "cauHoiId" TEXT NOT NULL,
    "nguoiDungId" TEXT NOT NULL,
    "diem" INTEGER NOT NULL,
    "nhanXet" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cau_tra_loi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ky_danh_gia" (
    "id" TEXT NOT NULL,
    "tenKy" TEXT NOT NULL,
    "moTa" TEXT,
    "ngayBatDau" TIMESTAMP(3) NOT NULL,
    "ngayKetThuc" TIMESTAMP(3) NOT NULL,
    "dangMo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ky_danh_gia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lich_su_thay_doi" (
    "id" TEXT NOT NULL,
    "nguoiDungId" TEXT NOT NULL,
    "hanhDong" TEXT NOT NULL,
    "bangTable" TEXT NOT NULL,
    "recordId" TEXT,
    "noiDung" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lich_su_thay_doi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "phong_ban_tenPhongBan_key" ON "phong_ban"("tenPhongBan");

-- CreateIndex
CREATE UNIQUE INDEX "phong_ban_truongPhongId_key" ON "phong_ban"("truongPhongId");

-- CreateIndex
CREATE INDEX "phong_ban_truongPhongId_idx" ON "phong_ban"("truongPhongId");

-- CreateIndex
CREATE UNIQUE INDEX "users_maNhanVien_key" ON "users"("maNhanVien");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phongBanId_idx" ON "users"("phongBanId");

-- CreateIndex
CREATE INDEX "users_maNhanVien_idx" ON "users"("maNhanVien");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "bieu_mau_loaiDanhGia_idx" ON "bieu_mau"("loaiDanhGia");

-- CreateIndex
CREATE INDEX "bieu_mau_phongBanId_idx" ON "bieu_mau"("phongBanId");

-- CreateIndex
CREATE INDEX "bieu_mau_trangThai_idx" ON "bieu_mau"("trangThai");

-- CreateIndex
CREATE INDEX "bieu_mau_nguoiTaoId_idx" ON "bieu_mau"("nguoiTaoId");

-- CreateIndex
CREATE INDEX "cau_hoi_bieuMauId_idx" ON "cau_hoi"("bieuMauId");

-- CreateIndex
CREATE INDEX "cau_hoi_thuTu_idx" ON "cau_hoi"("thuTu");

-- CreateIndex
CREATE INDEX "danh_gia_nguoiDanhGiaId_idx" ON "danh_gia"("nguoiDanhGiaId");

-- CreateIndex
CREATE INDEX "danh_gia_nguoiDuocDanhGiaId_idx" ON "danh_gia"("nguoiDuocDanhGiaId");

-- CreateIndex
CREATE INDEX "danh_gia_bieuMauId_idx" ON "danh_gia"("bieuMauId");

-- CreateIndex
CREATE INDEX "danh_gia_kyDanhGiaId_idx" ON "danh_gia"("kyDanhGiaId");

-- CreateIndex
CREATE INDEX "danh_gia_daHoanThanh_idx" ON "danh_gia"("daHoanThanh");

-- CreateIndex
CREATE UNIQUE INDEX "danh_gia_nguoiDanhGiaId_nguoiDuocDanhGiaId_bieuMauId_kyDanh_key" ON "danh_gia"("nguoiDanhGiaId", "nguoiDuocDanhGiaId", "bieuMauId", "kyDanhGiaId");

-- CreateIndex
CREATE INDEX "cau_tra_loi_danhGiaId_idx" ON "cau_tra_loi"("danhGiaId");

-- CreateIndex
CREATE INDEX "cau_tra_loi_cauHoiId_idx" ON "cau_tra_loi"("cauHoiId");

-- CreateIndex
CREATE INDEX "cau_tra_loi_nguoiDungId_idx" ON "cau_tra_loi"("nguoiDungId");

-- CreateIndex
CREATE UNIQUE INDEX "cau_tra_loi_danhGiaId_cauHoiId_key" ON "cau_tra_loi"("danhGiaId", "cauHoiId");

-- CreateIndex
CREATE INDEX "ky_danh_gia_dangMo_idx" ON "ky_danh_gia"("dangMo");

-- CreateIndex
CREATE INDEX "ky_danh_gia_ngayBatDau_ngayKetThuc_idx" ON "ky_danh_gia"("ngayBatDau", "ngayKetThuc");

-- CreateIndex
CREATE INDEX "lich_su_thay_doi_nguoiDungId_idx" ON "lich_su_thay_doi"("nguoiDungId");

-- CreateIndex
CREATE INDEX "lich_su_thay_doi_hanhDong_idx" ON "lich_su_thay_doi"("hanhDong");

-- CreateIndex
CREATE INDEX "lich_su_thay_doi_bangTable_idx" ON "lich_su_thay_doi"("bangTable");

-- CreateIndex
CREATE INDEX "lich_su_thay_doi_createdAt_idx" ON "lich_su_thay_doi"("createdAt");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- AddForeignKey
ALTER TABLE "phong_ban" ADD CONSTRAINT "phong_ban_truongPhongId_fkey" FOREIGN KEY ("truongPhongId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_phongBanId_fkey" FOREIGN KEY ("phongBanId") REFERENCES "phong_ban"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bieu_mau" ADD CONSTRAINT "bieu_mau_phongBanId_fkey" FOREIGN KEY ("phongBanId") REFERENCES "phong_ban"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bieu_mau" ADD CONSTRAINT "bieu_mau_nguoiTaoId_fkey" FOREIGN KEY ("nguoiTaoId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cau_hoi" ADD CONSTRAINT "cau_hoi_bieuMauId_fkey" FOREIGN KEY ("bieuMauId") REFERENCES "bieu_mau"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "danh_gia" ADD CONSTRAINT "danh_gia_nguoiDanhGiaId_fkey" FOREIGN KEY ("nguoiDanhGiaId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "danh_gia" ADD CONSTRAINT "danh_gia_nguoiDuocDanhGiaId_fkey" FOREIGN KEY ("nguoiDuocDanhGiaId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "danh_gia" ADD CONSTRAINT "danh_gia_bieuMauId_fkey" FOREIGN KEY ("bieuMauId") REFERENCES "bieu_mau"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "danh_gia" ADD CONSTRAINT "danh_gia_kyDanhGiaId_fkey" FOREIGN KEY ("kyDanhGiaId") REFERENCES "ky_danh_gia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cau_tra_loi" ADD CONSTRAINT "cau_tra_loi_danhGiaId_fkey" FOREIGN KEY ("danhGiaId") REFERENCES "danh_gia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cau_tra_loi" ADD CONSTRAINT "cau_tra_loi_cauHoiId_fkey" FOREIGN KEY ("cauHoiId") REFERENCES "cau_hoi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cau_tra_loi" ADD CONSTRAINT "cau_tra_loi_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lich_su_thay_doi" ADD CONSTRAINT "lich_su_thay_doi_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

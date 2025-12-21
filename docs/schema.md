// Schema Version 2.0 - Đã sửa các vấn đề

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// ENUMS
// ============================================================================

enum Role {
  admin
  truong_phong
  nhan_vien
}

enum LoaiDanhGia {
  LANH_DAO   // Đánh giá năng lực lãnh đạo
  NHAN_VIEN  // Đánh giá năng lực nhân viên
}

enum PhamViApDung {
  PHONG_BAN       // Áp dụng cho phòng ban cụ thể
  TOAN_CONG_TY    // Áp dụng cho toàn công ty
}

enum TrangThaiBieuMau {
  NHAP       // Đang soạn thảo
  KICH_HOAT  // Đã phát hành và có thể sử dụng
  VO_HIEU    // Đã vô hiệu hóa
}

// ============================================================================
// MODELS
// ============================================================================

// Model: Phòng ban
model PhongBan {
  id            String   @id @default(cuid())
  tenPhongBan   String   @unique
  moTa          String?
  
  // [NEW] Trưởng phòng của phòng ban này
  truongPhongId String?  @unique
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Soft delete
  deletedAt     DateTime?

  // Relations
  users         User[]
  truongPhong   User?     @relation("TruongPhongCuaPhongBan", fields: [truongPhongId], references: [id], onDelete: SetNull)
  bieuMaus      BieuMau[]

  @@index([truongPhongId])
  @@map("phong_ban")
}

// Model: User (MERGED NguoiDung + NextAuth User)
model User {
  id            String    @id @default(cuid())
  
  // Core user info
  maNhanVien    String    @unique
  hoTen         String?
  email         String?   @unique
  matKhau       String?   // Hashed password
  role          Role      @default(nhan_vien)
  phongBanId    String
  
  // Registration & status
  daDangKy      Boolean   @default(false)
  trangThaiKH   Boolean   @default(true) // Trạng thái kích hoạt
  
  // [NEW] Additional tracking
  lastLoginAt   DateTime?
  
  // NextAuth fields (optional if using providers)
  emailVerified DateTime?
  image         String?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Soft delete
  deletedAt     DateTime?

  // Relations
  phongBan              PhongBan  @relation(fields: [phongBanId], references: [id], onDelete: Cascade)
  phongBanQuanLy        PhongBan? @relation("TruongPhongCuaPhongBan")
  
  // Các đánh giá mà người này thực hiện
  danhGiaThucHien       DanhGia[] @relation("NguoiDanhGia")
  
  // Các đánh giá mà người này nhận được
  danhGiaNhanDuoc       DanhGia[] @relation("NguoiDuocDanhGia")
  
  // Các câu trả lời đánh giá
  cauTraLois            CauTraLoi[]
  
  // Biểu mẫu do người này tạo (nếu là Admin)
  bieuMauTao            BieuMau[] @relation("BieuMauNguoiTao")
  
  // Lịch sử thay đổi
  lichSuThayDoi         LichSuThayDoi[]
  
  // NextAuth relations
  accounts              Account[]
  sessions              Session[]

  @@index([phongBanId])
  @@index([maNhanVien])
  @@index([email])
  @@index([role])
  @@map("users")
}

// Model: Biểu mẫu đánh giá
model BieuMau {
  id              String            @id @default(cuid())
  tenBieuMau      String
  loaiDanhGia     LoaiDanhGia
  phamViApDung    PhamViApDung
  phongBanId      String?           // Null nếu áp dụng toàn công ty
  trangThai       TrangThaiBieuMau  @default(NHAP)
  moTa            String?
  nguoiTaoId      String?           // Admin tạo biểu mẫu
  
  // [NEW] Tracking
  ngayPhatHanh    DateTime?         // Ngày chuyển sang KICH_HOAT
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  // Soft delete
  deletedAt       DateTime?

  // Relations
  phongBan        PhongBan?  @relation(fields: [phongBanId], references: [id], onDelete: SetNull)
  nguoiTao        User?      @relation("BieuMauNguoiTao", fields: [nguoiTaoId], references: [id], onDelete: SetNull)
  cauHois         CauHoi[]
  danhGias        DanhGia[]

  @@index([loaiDanhGia])
  @@index([phongBanId])
  @@index([trangThai])
  @@index([nguoiTaoId])
  @@map("bieu_mau")
}

// Model: Câu hỏi đánh giá
model CauHoi {
  id          String   @id @default(cuid())
  bieuMauId   String
  noiDung     String
  thuTu       Int      // Thứ tự hiển thị câu hỏi
  diemToiDa   Int      @default(5) // Thang điểm 1-5
  batBuoc     Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  bieuMau     BieuMau     @relation(fields: [bieuMauId], references: [id], onDelete: Cascade)
  cauTraLois  CauTraLoi[]

  @@index([bieuMauId])
  @@index([thuTu])
  @@map("cau_hoi")
}

// Model: Đánh giá (Bản ghi đánh giá tổng thể)
model DanhGia {
  id                  String    @id @default(cuid())
  nguoiDanhGiaId      String    // Người thực hiện đánh giá
  nguoiDuocDanhGiaId  String    // Người được đánh giá
  bieuMauId           String
  kyDanhGiaId         String    // [CHANGED] Bắt buộc - mỗi đánh giá phải thuộc 1 kỳ
  
  // Nội dung đánh giá
  nhanXetChung        String    // Nhận xét văn bản - bắt buộc
  tongDiem            Float?    // Tổng điểm của đánh giá này
  diemTrungBinh       Float?    // Điểm trung bình
  
  // Status & tracking
  daHoanThanh         Boolean   @default(false)
  submittedAt         DateTime? // [NEW] Thời điểm submit (khác với createdAt)
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  // Relations
  nguoiDanhGia        User      @relation("NguoiDanhGia", fields: [nguoiDanhGiaId], references: [id], onDelete: Cascade)
  nguoiDuocDanhGia    User      @relation("NguoiDuocDanhGia", fields: [nguoiDuocDanhGiaId], references: [id], onDelete: Cascade)
  bieuMau             BieuMau   @relation(fields: [bieuMauId], references: [id], onDelete: Cascade)
  kyDanhGia           KyDanhGia @relation(fields: [kyDanhGiaId], references: [id], onDelete: Cascade)
  cauTraLois          CauTraLoi[]

  // [FIXED] Constraint: Mỗi người chỉ đánh giá 1 lần cho mỗi đối tượng với mỗi biểu mẫu trong 1 kỳ
  @@unique([nguoiDanhGiaId, nguoiDuocDanhGiaId, bieuMauId, kyDanhGiaId])
  @@index([nguoiDanhGiaId])
  @@index([nguoiDuocDanhGiaId])
  @@index([bieuMauId])
  @@index([kyDanhGiaId])
  @@index([daHoanThanh])
  @@map("danh_gia")
}

// Model: Câu trả lời cho từng câu hỏi
model CauTraLoi {
  id          String   @id @default(cuid())
  danhGiaId   String
  cauHoiId    String
  nguoiDungId String   // Người trả lời
  diem        Int      // Điểm số (1-5)
  nhanXet     String?  // Nhận xét cho câu hỏi cụ thể (optional)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  danhGia     DanhGia  @relation(fields: [danhGiaId], references: [id], onDelete: Cascade)
  cauHoi      CauHoi   @relation(fields: [cauHoiId], references: [id], onDelete: Cascade)
  nguoiDung   User     @relation(fields: [nguoiDungId], references: [id], onDelete: Cascade)

  // Constraint: Mỗi câu hỏi trong 1 đánh giá chỉ được trả lời 1 lần
  @@unique([danhGiaId, cauHoiId])
  @@index([danhGiaId])
  @@index([cauHoiId])
  @@index([nguoiDungId])
  @@map("cau_tra_loi")
}

// Model: Kỳ đánh giá (Quản lý các đợt đánh giá)
model KyDanhGia {
  id           String    @id @default(cuid())
  tenKy        String    // VD: "Quý 1/2024", "Đánh giá cuối năm 2024"
  moTa         String?
  ngayBatDau   DateTime
  ngayKetThuc  DateTime
  dangMo       Boolean   @default(true) // Kỳ đánh giá có đang mở không
  
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  // Relations
  danhGias     DanhGia[]

  @@index([dangMo])
  @@index([ngayBatDau, ngayKetThuc])
  @@map("ky_danh_gia")
}

// Model: Lịch sử thay đổi (Audit log)
model LichSuThayDoi {
  id          String   @id @default(cuid())
  nguoiDungId String   // Người thực hiện thay đổi
  
  // Audit info
  hanhDong    String   // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.
  bangTable   String   // Tên bảng bị ảnh hưởng
  recordId    String?  // ID của record bị thay đổi
  noiDung     Json?    // Chi tiết thay đổi (before/after)
  ipAddress   String?
  userAgent   String?
  
  createdAt   DateTime @default(now())

  // Relations
  nguoiDung   User     @relation(fields: [nguoiDungId], references: [id], onDelete: Cascade)

  @@index([nguoiDungId])
  @@index([hanhDong])
  @@index([bangTable])
  @@index([createdAt])
  @@map("lich_su_thay_doi")
}

// ============================================================================
// NextAuth Models
// ============================================================================

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ============================================================================
// CHANGES SUMMARY
// ============================================================================

// ✅ FIXED:
// 1. Merged User và NguoiDung vào 1 model
// 2. Added PhongBan.truongPhongId để explicit assignment
// 3. Made kyDanhGiaId required trong DanhGia (đánh giá phải thuộc kỳ)
// 4. Added soft delete (deletedAt) cho các model quan trọng
// 5. Added tracking fields (lastLoginAt, submittedAt, ngayPhatHanh)
// 6. Làm rõ LichSuThayDoi structure
// 7. Added indexes cho performance
// 8. Removed duplicate User model

// 📝 NOTES:
// - Nếu không cần NextAuth providers, có thể bỏ Account/Session
// - Soft delete: Thêm @@map("deletedAt") filter vào queries
// - Audit log: Có thể dùng Prisma middleware để auto-log
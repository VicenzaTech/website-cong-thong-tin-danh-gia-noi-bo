import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import {
  phongBans,
  users,
  kyDanhGias,
  bieuMaus,
  cauHois,
} from "../src/_mock/db";
import { Role } from "../src/types/schema";

const DB_PATH = path.join(process.cwd(), "data", "app.db");

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log("Initializing SQLite database...");
console.log("Database path:", DB_PATH);

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

console.log("Creating tables...");

db.exec(`
  CREATE TABLE IF NOT EXISTS phong_bans (
    id TEXT PRIMARY KEY,
    ten_phong_ban TEXT UNIQUE NOT NULL,
    mo_ta TEXT,
    truong_phong_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_phong_bans_deleted_at ON phong_bans(deleted_at);

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    ma_nhan_vien TEXT UNIQUE NOT NULL,
    ho_ten TEXT,
    email TEXT UNIQUE,
    mat_khau TEXT,
    mat_khau_cu TEXT,
    da_doi_mat_khau INTEGER DEFAULT 0,
    role TEXT NOT NULL DEFAULT 'nhan_vien',
    phong_ban_id TEXT NOT NULL,
    da_dang_ky INTEGER DEFAULT 0,
    trang_thai_kh INTEGER DEFAULT 1,
    last_login_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (phong_ban_id) REFERENCES phong_bans(id)
  );

  CREATE INDEX IF NOT EXISTS idx_users_ma_nhan_vien ON users(ma_nhan_vien);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_phong_ban_id ON users(phong_ban_id);
  CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);

  CREATE TABLE IF NOT EXISTS ky_danh_gia (
    id TEXT PRIMARY KEY,
    ten_ky TEXT NOT NULL,
    mo_ta TEXT,
    ngay_bat_dau TEXT NOT NULL,
    ngay_ket_thuc TEXT NOT NULL,
    dang_mo INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_ky_danh_gia_dang_mo ON ky_danh_gia(dang_mo);

  CREATE TABLE IF NOT EXISTS bieu_mau (
    id TEXT PRIMARY KEY,
    ten_bieu_mau TEXT NOT NULL,
    loai_danh_gia TEXT NOT NULL,
    pham_vi_ap_dung TEXT NOT NULL,
    phong_ban_id TEXT,
    trang_thai TEXT NOT NULL DEFAULT 'NHAP',
    mo_ta TEXT,
    nguoi_tao_id TEXT,
    ngay_phat_hanh TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (phong_ban_id) REFERENCES phong_bans(id),
    FOREIGN KEY (nguoi_tao_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_bieu_mau_loai_danh_gia ON bieu_mau(loai_danh_gia);
  CREATE INDEX IF NOT EXISTS idx_bieu_mau_phong_ban_id ON bieu_mau(phong_ban_id);
  CREATE INDEX IF NOT EXISTS idx_bieu_mau_trang_thai ON bieu_mau(trang_thai);

  CREATE TABLE IF NOT EXISTS cau_hoi (
    id TEXT PRIMARY KEY,
    bieu_mau_id TEXT NOT NULL,
    noi_dung TEXT NOT NULL,
    thu_tu INTEGER NOT NULL,
    diem_toi_da INTEGER DEFAULT 5,
    bat_buoc INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (bieu_mau_id) REFERENCES bieu_mau(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_cau_hoi_bieu_mau_id ON cau_hoi(bieu_mau_id);
  CREATE INDEX IF NOT EXISTS idx_cau_hoi_thu_tu ON cau_hoi(thu_tu);
`);

console.log("Tables created successfully!");

const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as {
  count: number;
};
if (userCount.count > 0) {
  console.log("Database already has data. Skipping import.");
  db.close();
  process.exit(0);
}

async function importData() {
  console.log("Importing data from mock database...");

  const phongBanStmt = db.prepare(`
    INSERT INTO phong_bans (id, ten_phong_ban, mo_ta, truong_phong_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const pb of phongBans) {
    phongBanStmt.run(
      pb.id,
      pb.tenPhongBan,
      pb.moTa || null,
      pb.truongPhongId || null,
      pb.createdAt.toISOString(),
      pb.updatedAt.toISOString()
    );
  }

  console.log(`Imported ${phongBans.length} phong ban`);

  const userStmt = db.prepare(`
    INSERT INTO users (
      id, ma_nhan_vien, ho_ten, email, mat_khau, mat_khau_cu,
      da_doi_mat_khau, role, phong_ban_id, da_dang_ky, trang_thai_kh,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let adminUser: typeof users[0] | undefined;
  const otherUsers: typeof users = [];

  for (const user of users) {
    if (user.role === Role.admin && user.maNhanVien === "ADMIN001") {
      adminUser = user;
    } else {
      otherUsers.push(user);
    }
  }

  if (adminUser) {
    const hashedPassword = await bcrypt.hash(adminUser.matKhau || "vicenza", 10);
    userStmt.run(
      adminUser.id,
      adminUser.maNhanVien,
      adminUser.hoTen || null,
      adminUser.email || null,
      hashedPassword,
      null,
      adminUser.daDoiMatKhau ? 1 : 0,
      adminUser.role,
      adminUser.phongBanId,
      adminUser.daDangKy ? 1 : 0,
      adminUser.trangThaiKH ? 1 : 0,
      adminUser.createdAt.toISOString(),
      adminUser.updatedAt.toISOString()
    );
    console.log("Imported admin user");
  }

  for (const user of otherUsers) {
    let hashedPassword: string | null = null;
    if (user.matKhau) {
      hashedPassword = await bcrypt.hash(user.matKhau, 10);
    }

    userStmt.run(
      user.id,
      user.maNhanVien,
      user.hoTen || null,
      user.email || null,
      hashedPassword,
      null,
      user.daDoiMatKhau ? 1 : 0,
      user.role,
      user.phongBanId,
      user.daDangKy ? 1 : 0,
      user.trangThaiKH ? 1 : 0,
      user.createdAt.toISOString(),
      user.updatedAt.toISOString()
    );
  }

  console.log(`Imported ${otherUsers.length} other users`);

  const kyDanhGiaStmt = db.prepare(`
    INSERT INTO ky_danh_gia (
      id, ten_ky, mo_ta, ngay_bat_dau, ngay_ket_thuc,
      dang_mo, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const ky of kyDanhGias) {
    kyDanhGiaStmt.run(
      ky.id,
      ky.tenKy,
      ky.moTa || null,
      ky.ngayBatDau.toISOString(),
      ky.ngayKetThuc.toISOString(),
      ky.dangMo ? 1 : 0,
      ky.createdAt.toISOString(),
      ky.updatedAt.toISOString()
    );
  }

  console.log(`Imported ${kyDanhGias.length} ky danh gia`);

  const bieuMauStmt = db.prepare(`
    INSERT INTO bieu_mau (
      id, ten_bieu_mau, loai_danh_gia, pham_vi_ap_dung,
      phong_ban_id, trang_thai, mo_ta, nguoi_tao_id,
      ngay_phat_hanh, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const bm of bieuMaus) {
    bieuMauStmt.run(
      bm.id,
      bm.tenBieuMau,
      bm.loaiDanhGia,
      bm.phamViApDung,
      bm.phongBanId || null,
      bm.trangThai,
      bm.moTa || null,
      bm.nguoiTaoId || null,
      bm.ngayPhatHanh ? bm.ngayPhatHanh.toISOString() : null,
      bm.createdAt.toISOString(),
      bm.updatedAt.toISOString()
    );
  }

  console.log(`Imported ${bieuMaus.length} bieu mau`);

  const cauHoiStmt = db.prepare(`
    INSERT INTO cau_hoi (
      id, bieu_mau_id, noi_dung, thu_tu, diem_toi_da,
      bat_buoc, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const ch of cauHois) {
    cauHoiStmt.run(
      ch.id,
      ch.bieuMauId,
      ch.noiDung,
      ch.thuTu,
      ch.diemToiDa,
      ch.batBuoc ? 1 : 0,
      ch.createdAt.toISOString(),
      ch.updatedAt.toISOString()
    );
  }

  console.log(`Imported ${cauHois.length} cau hoi`);
}

importData()
  .then(() => {
    console.log("\n✅ Database initialized successfully!");
    console.log("\nAdmin account:");
    console.log("  Admin: ADMIN001 / vicenza");
    console.log("\nDatabase file:", DB_PATH);
    db.close();
  })
  .catch((error) => {
    console.error("Error initializing database:", error);
    db.close();
    process.exit(1);
  });


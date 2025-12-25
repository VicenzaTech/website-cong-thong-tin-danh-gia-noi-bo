import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "app.db");

let db: Database.Database | null = null;

function getDatabase(): Database.Database {
  if (db) return db;

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  
  initializeTables();
  
  return db;
}

function initializeTables() {
  if (!db) return;

  db.exec(`
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
  `);
}

export const sqliteDb = {
  get: getDatabase,
  
  close: () => {
    if (db) {
      db.close();
      db = null;
    }
  },
};

export interface SqliteUser {
  id: string;
  ma_nhan_vien: string;
  ho_ten?: string;
  email?: string;
  mat_khau?: string;
  mat_khau_cu?: string;
  da_doi_mat_khau: number;
  role: string;
  phong_ban_id: string;
  da_dang_ky: number;
  trang_thai_kh: number;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface SqlitePhongBan {
  id: string;
  ten_phong_ban: string;
  mo_ta?: string;
  truong_phong_id?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export const authService = {
  getUserByMaNhanVien: (maNhanVien: string): SqliteUser | undefined => {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM users 
      WHERE ma_nhan_vien = ? AND deleted_at IS NULL
    `);
    return stmt.get(maNhanVien) as SqliteUser | undefined;
  },

  getUserById: (id: string): SqliteUser | undefined => {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM users 
      WHERE id = ? AND deleted_at IS NULL
    `);
    return stmt.get(id) as SqliteUser | undefined;
  },

  getPhongBanById: (id: string): SqlitePhongBan | undefined => {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM phong_bans 
      WHERE id = ? AND deleted_at IS NULL
    `);
    return stmt.get(id) as SqlitePhongBan | undefined;
  },

  createUser: (user: {
    id: string;
    maNhanVien: string;
    hoTen?: string;
    email?: string;
    matKhau?: string;
    role: string;
    phongBanId: string;
    daDangKy: boolean;
    trangThaiKH: boolean;
  }): void => {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO users (
        id, ma_nhan_vien, ho_ten, email, mat_khau, 
        role, phong_ban_id, da_dang_ky, trang_thai_kh,
        da_doi_mat_khau, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const now = new Date().toISOString();
    stmt.run(
      user.id,
      user.maNhanVien,
      user.hoTen || null,
      user.email || null,
      user.matKhau || null,
      user.role,
      user.phongBanId,
      user.daDangKy ? 1 : 0,
      user.trangThaiKH ? 1 : 0,
      0,
      now,
      now
    );
  },

  updateUser: (id: string, data: {
    hoTen?: string;
    email?: string;
    matKhau?: string;
    matKhauCu?: string;
    daDoiMatKhau?: boolean;
    daDangKy?: boolean;
    lastLoginAt?: Date;
  }): void => {
    const db = getDatabase();
    const updates: string[] = [];
    const values: any[] = [];

    if (data.hoTen !== undefined) {
      updates.push("ho_ten = ?");
      values.push(data.hoTen);
    }
    if (data.email !== undefined) {
      updates.push("email = ?");
      values.push(data.email);
    }
    if (data.matKhau !== undefined) {
      updates.push("mat_khau = ?");
      values.push(data.matKhau);
    }
    if (data.matKhauCu !== undefined) {
      updates.push("mat_khau_cu = ?");
      values.push(data.matKhauCu);
    }
    if (data.daDoiMatKhau !== undefined) {
      updates.push("da_doi_mat_khau = ?");
      values.push(data.daDoiMatKhau ? 1 : 0);
    }
    if (data.daDangKy !== undefined) {
      updates.push("da_dang_ky = ?");
      values.push(data.daDangKy ? 1 : 0);
    }
    if (data.lastLoginAt !== undefined) {
      updates.push("last_login_at = ?");
      values.push(data.lastLoginAt.toISOString());
    }

    if (updates.length === 0) return;

    updates.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = db.prepare(`
      UPDATE users 
      SET ${updates.join(", ")}
      WHERE id = ?
    `);
    stmt.run(...values);
  },

  verifyPassword: (maNhanVien: string, password: string): SqliteUser | null => {
    const user = authService.getUserByMaNhanVien(maNhanVien);
    if (!user || !user.mat_khau) return null;
    if (user.mat_khau !== password) return null;
    return user;
  },

  changePassword: (userId: string, currentPassword: string, newPassword: string): { success: boolean; error?: string } => {
    const user = authService.getUserById(userId);
    if (!user) {
      return { success: false, error: "Không tìm thấy người dùng" };
    }

    if (user.mat_khau !== currentPassword) {
      return { success: false, error: "Mật khẩu hiện tại không chính xác" };
    }

    if (newPassword === currentPassword) {
      return { success: false, error: "Mật khẩu mới không được trùng với mật khẩu cũ" };
    }

    if (user.mat_khau_cu && newPassword === user.mat_khau_cu) {
      return { success: false, error: "Mật khẩu mới không được trùng với mật khẩu đã sử dụng trước đó" };
    }

    authService.updateUser(userId, {
      matKhau: newPassword,
      matKhauCu: currentPassword,
      daDoiMatKhau: true,
    });

    return { success: true };
  },

  initializeFromMockData: (mockUsers: any[], mockPhongBans: any[]): void => {
    const db = getDatabase();
    
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
    if (userCount.count > 0) {
      console.log("Database already initialized, skipping...");
      return;
    }

    console.log("Initializing database from mock data...");

    const phongBanStmt = db.prepare(`
      INSERT INTO phong_bans (id, ten_phong_ban, mo_ta, truong_phong_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const pb of mockPhongBans) {
      phongBanStmt.run(
        pb.id,
        pb.tenPhongBan,
        pb.moTa || null,
        pb.truongPhongId || null,
        pb.createdAt.toISOString(),
        pb.updatedAt.toISOString()
      );
    }

    const userStmt = db.prepare(`
      INSERT INTO users (
        id, ma_nhan_vien, ho_ten, email, mat_khau, mat_khau_cu,
        da_doi_mat_khau, role, phong_ban_id, da_dang_ky, trang_thai_kh,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const user of mockUsers) {
      userStmt.run(
        user.id,
        user.maNhanVien,
        user.hoTen || null,
        user.email || null,
        user.matKhau || null,
        user.matKhauCu || null,
        user.daDoiMatKhau ? 1 : 0,
        user.role,
        user.phongBanId,
        user.daDangKy ? 1 : 0,
        user.trangThaiKH ? 1 : 0,
        user.createdAt.toISOString(),
        user.updatedAt.toISOString()
      );
    }

    console.log(`Initialized ${mockPhongBans.length} phong bans and ${mockUsers.length} users`);
  },
};


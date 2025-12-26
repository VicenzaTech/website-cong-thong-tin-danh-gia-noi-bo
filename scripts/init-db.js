const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(process.cwd(), 'data', 'app.db');
const MOCK_DATA_PATH = path.join(process.cwd(), 'src', '_mock', 'db.ts');

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log('Initializing SQLite database...');
console.log('Database path:', DB_PATH);

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Create tables
console.log('Creating tables...');

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
`);

console.log('Tables created successfully!');

// Check if data already exists
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count > 0) {
  console.log('Database already has data. Skipping import.');
  db.close();
  process.exit(0);
}

console.log('Importing sample data...');

// Import phong ban (only one needed for admin user's foreign key)
const phongBanStmt = db.prepare(`
  INSERT INTO phong_bans (id, ten_phong_ban, mo_ta, truong_phong_id, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const phongBans = [
  { id: 'pb1', tenPhongBan: 'Ban kinh doanh', moTa: 'Ban kinh doanh', truongPhongId: null },
];

const now = new Date().toISOString();

for (const pb of phongBans) {
  phongBanStmt.run(
    pb.id,
    pb.tenPhongBan,
    pb.moTa || null,
    pb.truongPhongId || null,
    now,
    now
  );
}

console.log(`Imported ${phongBans.length} phong ban`);

// Import admin user only
const userStmt = db.prepare(`
  INSERT INTO users (
    id, ma_nhan_vien, ho_ten, email, mat_khau, mat_khau_cu,
    da_doi_mat_khau, role, phong_ban_id, da_dang_ky, trang_thai_kh,
    created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const adminUser = {
  id: 'admin1',
  maNhanVien: 'ADMIN001',
  hoTen: 'Quản trị viên',
  email: 'admin@company.com',
  matKhau: 'vicenza',
  role: 'admin',
  phongBanId: 'pb1',
};

userStmt.run(
  adminUser.id,
  adminUser.maNhanVien,
  adminUser.hoTen,
  adminUser.email || null,
  adminUser.matKhau,
  null,
  0,
  adminUser.role,
  adminUser.phongBanId,
  1,
  1,
  now,
  now
);

console.log(`Imported admin user`);
console.log('\n✅ Database initialized successfully!');
console.log('\nAdmin account:');
console.log('  Admin: ADMIN001 / vicenza');
console.log('\nDatabase file:', DB_PATH);

db.close();


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

// Import phong bans
const phongBanStmt = db.prepare(`
  INSERT INTO phong_bans (id, ten_phong_ban, mo_ta, truong_phong_id, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const phongBans = [
  { id: 'pb1', tenPhongBan: 'Ban kinh doanh', moTa: 'Ban kinh doanh', truongPhongId: 'upb1_1' },
  { id: 'pb2', tenPhongBan: 'Ban kiểm soát', moTa: 'Ban kiểm soát', truongPhongId: 'upb2_1' },
  { id: 'pb3', tenPhongBan: 'Ban tổng giám đốc', moTa: 'Ban tổng giám đốc', truongPhongId: 'upb3_2' },
  { id: 'pb4', tenPhongBan: 'Ban đầu tư', moTa: 'Ban đầu tư', truongPhongId: 'upb4_2' },
  { id: 'pb5', tenPhongBan: 'Dự án cát nhân tạo', moTa: 'Dự án cát nhân tạo', truongPhongId: 'upb5_2' },
  { id: 'pb6', tenPhongBan: 'Hội đồng Quản trị', moTa: 'Hội đồng Quản trị', truongPhongId: 'upb6_1' },
  { id: 'pb7', tenPhongBan: 'Hội đồng cổ đông', moTa: 'Hội đồng cổ đông', truongPhongId: 'upb7_1' },
  { id: 'pb8', tenPhongBan: 'Phòng Kế toán', moTa: 'Phòng Kế toán', truongPhongId: 'upb8_1' },
  { id: 'pb9', tenPhongBan: 'Phòng Tổ chức - Hành chính', moTa: 'Phòng Tổ chức - Hành chính', truongPhongId: 'upb9_1' },
  { id: 'pb10', tenPhongBan: 'Phòng khai thác', moTa: 'Phòng khai thác', truongPhongId: 'upb10_1' },
  { id: 'pb11', tenPhongBan: 'Thanh tra sản xuất - KCS', moTa: 'Thanh tra sản xuất - KCS', truongPhongId: 'upb11_7' },
  { id: 'pb12', tenPhongBan: 'Thuê ngoài', moTa: 'Thuê ngoài', truongPhongId: null },
  { id: 'pb13', tenPhongBan: 'Văn phòng Chủ tịch', moTa: 'Văn phòng Chủ tịch', truongPhongId: 'upb13_4' },
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

console.log(`Imported ${phongBans.length} phong bans`);

// Import sample users (admin + a few test users)
const userStmt = db.prepare(`
  INSERT INTO users (
    id, ma_nhan_vien, ho_ten, email, mat_khau, mat_khau_cu,
    da_doi_mat_khau, role, phong_ban_id, da_dang_ky, trang_thai_kh,
    created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const sampleUsers = [
  {
    id: 'admin1',
    maNhanVien: 'ADMIN001',
    hoTen: 'Quản trị viên',
    email: 'admin@company.com',
    matKhau: 'vicenza',
    role: 'admin',
    phongBanId: 'pb1',
  },
  {
    id: 'upb1_1',
    maNhanVien: 'NV0041',
    hoTen: 'Nguyễn Thị Bích Hường',
    email: 'nv0041@company.com',
    matKhau: 'vicenza',
    role: 'truong_phong',
    phongBanId: 'pb1',
  },
  {
    id: 'upb1_2',
    maNhanVien: 'NV3214',
    hoTen: 'Nguyễn Mạnh Uyên',
    email: 'nv3214@company.com',
    matKhau: 'vicenza',
    role: 'nhan_vien',
    phongBanId: 'pb1',
  },
];

for (const user of sampleUsers) {
  userStmt.run(
    user.id,
    user.maNhanVien,
    user.hoTen,
    user.email || null,
    user.matKhau,
    null,
    0,
    user.role,
    user.phongBanId,
    1,
    1,
    now,
    now
  );
}

console.log(`Imported ${sampleUsers.length} sample users`);
console.log('\n✅ Database initialized successfully!');
console.log('\nTest accounts:');
console.log('  Admin: ADMIN001 / vicenza');
console.log('  Trưởng phòng: NV0041 / vicenza');
console.log('  Nhân viên: NV3214 / vicenza');
console.log('\nDatabase file:', DB_PATH);

db.close();


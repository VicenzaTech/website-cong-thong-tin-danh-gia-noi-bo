# SQLite Authentication Setup

## Vấn đề đã giải quyết

Trước đây, mật khẩu được lưu trong mock data (bộ nhớ), dẫn đến:
- Đổi mật khẩu nhưng reload là mất
- Dữ liệu không persistent
- Không phù hợp cho production

## Giải pháp

Đã chuyển sang SQLite database với:
- ✅ Lưu trữ persistent trong file `data/app.db`
- ✅ Authentication hoàn toàn qua API
- ✅ Mật khẩu được lưu an toàn
- ✅ Tự động khởi tạo từ mock data

## Cài đặt

```bash
npm install
```

## Chạy Development

### Windows (Khuyến nghị - WSL)

```bash
# Trong WSL Ubuntu
wsl
cd /mnt/d/VICENZA/Du-an/website-cong-thong-tin-danh-gia-noi-bo
npm run dev
```

### Windows (PowerShell - Có warning)

```bash
npm run dev
# Sẽ có warning về Turbopack nhưng app vẫn hoạt động
```

### Linux/Mac

```bash
npm run dev
```

## Build Production

### Trên Linux/WSL (Khuyến nghị)

```bash
npm run build
npm start
```

### Trên Windows

Cần run PowerShell as Administrator:

```powershell
# Right-click PowerShell -> Run as Administrator
cd D:\VICENZA\Du-an\website-cong-thong-tin-danh-gia-noi-bo
npm run build
```

## Kiểm tra Database

```bash
# Cài SQLite CLI
# Windows: choco install sqlite
# Mac: brew install sqlite  
# Linux: apt install sqlite3

# Xem dữ liệu
sqlite3 data/app.db

# Trong SQLite prompt:
SELECT ma_nhan_vien, ho_ten, da_doi_mat_khau FROM users LIMIT 10;

# Kiểm tra user đã đổi password
SELECT ma_nhan_vien, ho_ten, da_doi_mat_khau 
FROM users 
WHERE da_doi_mat_khau = 1;

# Thoát
.exit
```

## API Endpoints

### Check User
```bash
POST /api/auth/check-user
Body: { "maNhanVien": "NV0001" }
```

### Login
```bash
POST /api/auth/login
Body: { 
  "maNhanVien": "NV0001",
  "matKhau": "vicenza"
}
```

### Change Password
```bash
POST /api/auth/change-password
Body: {
  "userId": "user_id",
  "currentPassword": "vicenza",
  "newPassword": "newpass123"
}
```

## Cấu trúc Database

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  ma_nhan_vien TEXT UNIQUE NOT NULL,
  ho_ten TEXT,
  email TEXT UNIQUE,
  mat_khau TEXT,
  mat_khau_cu TEXT,
  da_doi_mat_khau INTEGER DEFAULT 0,
  role TEXT NOT NULL,
  phong_ban_id TEXT NOT NULL,
  da_dang_ky INTEGER DEFAULT 0,
  trang_thai_kh INTEGER DEFAULT 1,
  last_login_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

-- Phong bans table
CREATE TABLE phong_bans (
  id TEXT PRIMARY KEY,
  ten_phong_ban TEXT UNIQUE NOT NULL,
  mo_ta TEXT,
  truong_phong_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);
```

## Troubleshooting

### Lỗi: "Turbopack Error: create symlink"

**Nguyên nhân:** Turbopack không hỗ trợ native modules như better-sqlite3

**Giải pháp:**
1. Chạy trên WSL/Linux (khuyến nghị)
2. Hoặc run PowerShell as Administrator
3. App vẫn hoạt động trong dev mode dù có warning

### Database bị lock

```bash
# Xóa các file lock
rm data/app.db-shm
rm data/app.db-wal
```

### Reset database

```bash
# Xóa database để khởi tạo lại
rm data/app.db
# Chạy lại app, database sẽ được tạo mới từ mock data
npm run dev
```

## Roadmap

- [x] SQLite cho authentication
- [x] API routes cho login/logout/change-password
- [ ] Chuyển phongBans sang SQLite
- [ ] Chuyển kyDanhGias sang SQLite
- [ ] Chuyển bieuMaus sang SQLite
- [ ] Loại bỏ hoàn toàn mock data


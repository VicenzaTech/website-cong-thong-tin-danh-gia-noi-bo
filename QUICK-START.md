# Quick Start Guide

## Khởi tạo Database (Chỉ cần làm 1 lần)

```bash
npm run init-db
```

Kết quả:
```
✅ Database initialized successfully!

Test accounts:
  Admin: ADMIN001 / vicenza
  Trưởng phòng: NV0041 / vicenza
  Nhân viên: NV3214 / vicenza
```

## Chạy Development Server

### ⚠️ QUAN TRỌNG: Cần quyền Administrator

**Cách 1: Run PowerShell as Administrator (Khuyến nghị)**
```powershell
# Nhấn Windows + X → chọn "Terminal (Admin)"
cd D:\VICENZA\Du-an\website-cong-thong-tin-danh-gia-noi-bo
npm run dev
```

**Cách 2: Dùng WSL**
```bash
wsl
cd /mnt/d/VICENZA/Du-an/website-cong-thong-tin-danh-gia-noi-bo
npm run dev
```

**Cách 3: Enable Developer Mode**
- Settings → Update & Security → For Developers → Bật "Developer Mode"
- Restart máy
- Chạy `npm run dev` bình thường

Server sẽ chạy tại: http://localhost:3000

**Lưu ý:** Nếu không chạy với Admin, bạn sẽ thấy lỗi:
```
FATAL: Turbopack error - os error 1314
POST /api/auth/check-user 500
```

## Test Login

1. Mở trình duyệt: http://localhost:3000/login

2. Đăng nhập với tài khoản test:
   - Mã nhân viên: `ADMIN001`
   - Mật khẩu: `vicenza`

3. Hệ thống yêu cầu đổi mật khẩu (lần đầu)
   - Nhập mật khẩu hiện tại: `vicenza`
   - Nhập mật khẩu mới: `admin123` (hoặc bất kỳ)
   - Xác nhận mật khẩu mới

4. Đăng nhập lại với mật khẩu mới
   - Mã nhân viên: `ADMIN001`
   - Mật khẩu: `admin123`

5. ✅ Thành công! Mật khẩu đã được lưu vào SQLite

## Kiểm tra Database

```bash
# Cài SQLite CLI (nếu chưa có)
# Windows: choco install sqlite
# Mac: brew install sqlite
# Linux: apt install sqlite3

# Xem dữ liệu
sqlite3 data/app.db

# Trong SQLite prompt:
SELECT ma_nhan_vien, ho_ten, da_doi_mat_khau FROM users;

# Kiểm tra user đã đổi password
SELECT ma_nhan_vien, ho_ten, da_doi_mat_khau 
FROM users 
WHERE da_doi_mat_khau = 1;

# Thoát
.exit
```

## Troubleshooting

### Database chưa được tạo?
```bash
npm run init-db
```

### Muốn reset database?
```bash
# Xóa database cũ
rm data/app.db data/app.db-shm data/app.db-wal

# Tạo lại
npm run init-db
```

### Lỗi Turbopack?
Bỏ qua warning, app vẫn hoạt động. Hoặc chạy trên WSL:
```bash
wsl
cd /mnt/d/VICENZA/Du-an/website-cong-thong-tin-danh-gia-noi-bo
npm run dev
```

## Cấu trúc Files

```
data/
├── app.db          # SQLite database chính
├── app.db-shm      # Shared memory
└── app.db-wal      # Write-ahead log

Database tables:
- users (313 users khi import đầy đủ)
- phong_bans (13 phòng ban)
```

## Import Toàn Bộ Dữ Liệu

Script hiện tại chỉ import 3 users mẫu. Để import 313 users:

1. Chỉnh sửa `src/libs/sqlite.server.ts`
2. Gọi `authService.initializeFromMockData()` với full mock data
3. Hoặc sử dụng API endpoint để import

## Next Steps

- ✅ Database đã được tạo
- ✅ Login/logout hoạt động
- ✅ Đổi password được lưu vào SQLite
- 🔄 Tiếp theo: Import toàn bộ 313 users
- 🔄 Sau đó: Chuyển các module khác sang SQLite


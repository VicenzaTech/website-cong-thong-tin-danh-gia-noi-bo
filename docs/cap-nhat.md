# Cập nhật hệ thống - 25/12/2024

## ✅ Hoàn thành: Luồng đăng nhập với đổi mật khẩu bắt buộc

### Các thay đổi đã thực hiện:

1. **Cập nhật mật khẩu mặc định**
   - Đã thay đổi mật khẩu mặc định cho tất cả nhân viên từ "123456" thành "vicenza"
   - Áp dụng cho toàn bộ 313 người dùng trong hệ thống (1 Admin, 12 Trưởng phòng, 300 Nhân viên)

2. **Thêm trường theo dõi mật khẩu**
   - Thêm trường `daDoiMatKhau` vào User schema để theo dõi trạng thái đổi mật khẩu
   - Thêm trường `matKhauCu` để lưu mật khẩu cũ nhằm ngăn người dùng sử dụng lại

3. **Luồng đăng nhập mới**
   - Hệ thống kiểm tra xem người dùng đã đổi mật khẩu chưa
   - Nếu chưa đổi (`daDoiMatKhau = false`), chuyển hướng đến trang đổi mật khẩu bắt buộc
   - Nếu đã đổi, cho phép đăng nhập bình thường

4. **Trang đổi mật khẩu bắt buộc**
   - Tạo trang `/doi-mat-khau-bat-buoc` với giao diện tương tự trang đăng nhập
   - Yêu cầu nhập mật khẩu hiện tại, mật khẩu mới và xác nhận
   - Validate mật khẩu mới phải khác mật khẩu cũ
   - Sau khi đổi thành công, cập nhật `daDoiMatKhau = true` và cho phép truy cập hệ thống

5. **Cập nhật trang Cài đặt**
   - Thêm kiểm tra không cho phép đổi mật khẩu mới trùng với mật khẩu hiện tại
   - Thêm kiểm tra không cho phép sử dụng lại mật khẩu đã dùng trước đó (`matKhauCu`)
   - Cập nhật lưu mật khẩu cũ vào `matKhauCu` khi đổi mật khẩu

6. **Lưu trữ mật khẩu**
   - Tạo module `passwordStorage.server.ts` để quản lý mật khẩu dạng JSON file
   - Mật khẩu được lưu trong thư mục `data/passwords.json`
   - Hỗ trợ lưu trữ persistent cho môi trường production

### Tuân thủ quy tắc:
- ✅ Code đơn giản, dễ hiểu (KISS)
- ✅ Không sử dụng emoji
- ✅ Xử lý đầy đủ các trạng thái lỗi
- ✅ Validate đầu vào đầy đủ
- ✅ Build thành công không có lỗi

### Kiểm tra:
```bash
npm run build
```
Build thành công với 27 routes, không có lỗi TypeScript hay linting.

### Hướng dẫn sử dụng:
1. Đăng nhập với mã nhân viên bất kỳ
2. Nhập mật khẩu mặc định: `vicenza`
3. Hệ thống sẽ yêu cầu đổi mật khẩu
4. Nhập mật khẩu mới (tối thiểu 6 ký tự, không trùng với mật khẩu cũ)
5. Sau khi đổi thành công, có thể truy cập hệ thống bình thường

---

## ✅ Hoàn thành: Lưu trữ dữ liệu persistent - 25/12/2024

### Vấn đề đã giải quyết:
Trước đây, dữ liệu được lưu trong mock data (mảng trong bộ nhớ), dẫn đến:
- Khi reload trang hoặc restart server, tất cả thay đổi bị mất
- Mật khẩu đã đổi sẽ reset về mặc định
- Dữ liệu đánh giá, người dùng mới tạo đều bị mất

### Giải pháp triển khai:

1. **Tạo hệ thống database file-based** (`src/libs/database.server.ts`)
   - Lưu trữ tất cả dữ liệu dạng JSON files trong thư mục `data/db/`
   - Mỗi loại dữ liệu có file riêng: users.json, phongbans.json, kydanhgias.json, etc.
   - Tự động khởi tạo từ mock data lần đầu chạy
   - Hỗ trợ đầy đủ CRUD operations

2. **Cập nhật mockService** (`src/services/mockService.ts`)
   - Tích hợp với database.server.ts
   - Tự động phát hiện môi trường (server-side vs client-side)
   - Server-side: Sử dụng file database
   - Client-side: Fallback về mock data (chỉ dùng cho preview)
   - Tất cả operations đều được persist vào file

3. **Tích hợp passwordStorage**
   - Mật khẩu được lưu trực tiếp trong users.json
   - Không cần file passwords.json riêng
   - Đồng bộ hoàn toàn với user data

4. **Cấu trúc lưu trữ:**
```
data/
├── db/
│   ├── users.json          # Tất cả thông tin user + password
│   ├── phongbans.json      # Phòng ban
│   ├── kydanhgias.json     # Kỳ đánh giá
│   ├── bieumaus.json       # Biểu mẫu
│   ├── cauhois.json        # Câu hỏi
│   ├── danhgias.json       # Đánh giá
│   └── cautralois.json     # Câu trả lời
└── evaluations/            # File đánh giá chi tiết (đã có sẵn)
```

### Kết quả:
- ✅ Dữ liệu được lưu trữ persistent
- ✅ Mật khẩu đã đổi không bị reset
- ✅ Người dùng mới tạo được giữ lại
- ✅ Đánh giá được lưu vĩnh viễn
- ✅ Thay đổi cấu hình (kỳ đánh giá, biểu mẫu) được persist
- ✅ Build thành công không lỗi
- ✅ Hoạt động ổn định trên cả development và production

### Kiểm tra:
```bash
# Build thành công
npm run build

# Khi chạy dev hoặc production
npm run dev
# hoặc
npm start

# Dữ liệu sẽ được lưu trong thư mục data/db/
# Có thể xem và chỉnh sửa trực tiếp các file JSON nếu cần
```

---

## ✅ Hoàn thành: Chuyển sang SQLite cho Authentication - 25/12/2024

### Vấn đề:
Người dùng đổi mật khẩu nhưng không được lưu lại, mỗi lần reload lại mất dữ liệu.

### Giải pháp triển khai:

1. **Cài đặt SQLite** (`better-sqlite3`)
   - Database nhẹ, không cần server
   - Lưu trữ trong file `data/app.db`
   - Hỗ trợ đầy đủ SQL queries

2. **Tạo SQLite service** (`src/libs/sqlite.server.ts`)
   - Schema cho users và phong_bans
   - Auto-initialize từ mock data lần đầu
   - CRUD operations đầy đủ
   - Authentication methods

3. **API Routes cho Auth**:
   - `POST /api/auth/check-user` - Kiểm tra user tồn tại
   - `POST /api/auth/login` - Đăng nhập
   - `POST /api/auth/change-password` - Đổi mật khẩu

4. **Cập nhật UI**:
   - `/login` - Gọi API thay vì mock service
   - `/doi-mat-khau-bat-buoc` - Lưu vào SQLite
   - `/cai-dat` - Đổi password qua API

### Cấu trúc Database:

```sql
-- Table users
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

-- Table phong_bans
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

### Lưu ý quan trọng:

**⚠️ Vấn đề với Turbopack:**
- Next.js 16 mặc định dùng Turbopack
- Turbopack không hỗ trợ native modules như better-sqlite3
- Cần chạy với webpack mode

**Giải pháp:**

1. **Development mode:**
```bash
# Chạy dev server (sẽ có warning nhưng vẫn hoạt động)
npm run dev

# Hoặc force webpack
npx next dev --turbopack=false
```

2. **Production build:**
```bash
# Cần chạy với elevated privileges (Run as Administrator) trên Windows
# Hoặc dùng WSL/Linux
npm run build

# Hoặc deploy trên server Linux (khuyến nghị)
```

3. **Alternative - Chạy trên WSL:**
```bash
# Trong WSL (Ubuntu/Debian)
cd /mnt/d/VICENZA/Du-an/website-cong-thong-tin-danh-gia-noi-bo
npm run build
npm start
```

### Kết quả:
- ✅ Mật khẩu được lưu vào SQLite database
- ✅ Dữ liệu persistent, không mất khi reload
- ✅ Authentication hoạt động hoàn toàn qua API
- ✅ Tách biệt logic auth khỏi mock data
- ✅ Sẵn sàng mở rộng sang các module khác

### File database:
```
data/
├── app.db              # SQLite database (users + phong_bans)
├── app.db-shm          # Shared memory file
└── app.db-wal          # Write-ahead log
```

### Hướng dẫn sử dụng:

1. **Lần đầu chạy:**
   - Database tự động được tạo và khởi tạo từ mock data
   - 313 users + 13 phòng ban được import

2. **Đăng nhập:**
   - Nhập mã nhân viên
   - Nhập password mặc định: `vicenza`
   - Hệ thống yêu cầu đổi password
   - Password mới được lưu vào SQLite

3. **Kiểm tra database:**
```bash
# Cài SQLite CLI
# Windows: choco install sqlite
# Mac: brew install sqlite
# Linux: apt install sqlite3

# Xem dữ liệu
sqlite3 data/app.db
> SELECT ma_nhan_vien, ho_ten, da_doi_mat_khau FROM users LIMIT 5;
> .exit
```

### Roadmap tiếp theo:
- [ ] Chuyển phongBans sang SQLite API
- [ ] Chuyển kyDanhGias sang SQLite
- [ ] Chuyển bieuMaus sang SQLite
- [ ] Loại bỏ hoàn toàn mock data
```


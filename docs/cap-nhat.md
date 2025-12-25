# Cap nhat he thong

## [X] Hoan thanh: Chuyen doi authentication sang SQLite - 25/12/2024

### Tong quan:
Chuyen doi he thong dang nhap tu mock data sang SQLite database de dam bao du lieu duoc luu tru persistent.

### Cac thay doi:

1. **API Routes cho Authentication**
   - `/api/auth/check-user`: Kiem tra user theo ma nhan vien
   - `/api/auth/login`: Dang nhap va xac thuc mat khau
   - `/api/auth/change-password`: Doi mat khau
   - `/api/auth/register`: Dang ky thong tin lan dau (user chua co password)

2. **SQLite Service** (`src/libs/sqlite.server.ts`)
   - Su dung better-sqlite3 de luu tru du lieu
   - Database file: `data/app.db`
   - Tu dong khoi tao tu mock data lan dau chay
   - Ho tro CRUD cho users va phong_bans

3. **Cap nhat cac trang**
   - `/login`: Chuyen sang goi API thay vi mockService
   - `/register`: Chuyen sang goi API thay vi mockService
   - `/doi-mat-khau-bat-buoc`: Chuyen sang goi API thay vi mockService
   - `/cai-dat`: Da su dung API tu truoc

4. **Build Configuration**
   - Cap nhat `package.json`: `"build": "next build --webpack"` de ho tro Next.js 16

5. **User Schema**
   - Them `phongBanName` vao User interface de hien thi ten phong ban

### Luong dang nhap:
1. Nhap ma nhan vien -> He thong kiem tra user
2. Neu user chua co password -> Redirect `/register`
3. Neu user co password -> Hien thi field nhap password
4. Nhap password mac dinh "vicenza" -> Login
5. Neu `daDoiMatKhau = false` -> Redirect `/doi-mat-khau-bat-buoc`
6. Doi mat khau thanh cong -> Vao he thong binh thuong

### Tuan thu quy tac:
- [X] Code don gian, de hieu (KISS)
- [X] Khong su dung emoji trong code
- [X] Xu ly day du cac trang thai loi
- [X] Validate dau vao day du
- [X] Build thanh cong khong co loi

### Kiem tra:
```bash
npm run build
```
Build thanh cong voi 31 routes, khong co loi TypeScript hay linting.

---

## [X] Hoan thanh: Luong dang nhap voi doi mat khau bat buoc

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


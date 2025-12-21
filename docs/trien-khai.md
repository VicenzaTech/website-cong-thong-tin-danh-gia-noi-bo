# KẾ HOẠCH TRIỂN KHAI DỰ ÁN ĐÁNH GIÁ NỘI BỘ (FRONTEND-FIRST)

## 📌 Giai đoạn 1: Khởi tạo & Kiến trúc Mock Data (Foundation)

**Mục tiêu:** Thiết lập dự án Next.js chuẩn, cài đặt Mantine UI và xây dựng "Mock Database" trong bộ nhớ để giả lập API.

### Bước 1.1: Thiết lập môi trường & UI Library

- [x] **Khởi tạo Project Next.js 14+ (App Router)**
  - Sử dụng TypeScript
  - Cấu hình path alias (`@/*`)

- [x] **Cài đặt Mantine UI v7**
  - Packages: `@mantine/core`, `@mantine/hooks`, `@mantine/dates`, `@mantine/notifications`, `@mantine/form`
  - Cài đặt `dayjs` xử lý ngày tháng

- [x] **Cấu hình Code Quality (theo rule.md)**
  - Setup ESLint, Prettier (tắt rule unused vars nếu gây phiền khi dev)
  - Cấu hình `theme.ts` cho Mantine (Màu sắc thương hiệu, font, spacing)

- [x] **Tạo cấu trúc thư mục Feature-based**
  - `app/(dashboard)/...`, `components/shared`, `features/auth`, `features/evaluation`, `libs/mock-service`

### Bước 1.2: Định nghĩa Data Schema & Mock Service

- [x] **Định nghĩa TypeScript Interfaces**
  - Tạo file `types/schema.ts`
  - Copy các model từ `schema.md` chuyển sang Interface (User, PhongBan, KyDanhGia, BieuMau, DanhGia...)
  - Lưu ý: Merge model User theo thiết kế mới nhất

- [x] **Tạo Mock Data (Seed Data)**
  - Tạo `_mock/db.ts`: Chứa các mảng dữ liệu cố định (5 phòng ban, 1 Admin, 5 Trưởng phòng, 20 Nhân viên)
  - Tạo dữ liệu Kỳ đánh giá (1 kỳ Active, 1 kỳ Closed)
  - Tạo dữ liệu Biểu mẫu mẫu (Lãnh đạo, Nhân viên)

- [x] **Viết Mock Service (Giả lập Server Actions)**
  - Tạo `services/mockService.ts`
  - Viết hàm `fakeDelay(ms)` để mô phỏng độ trễ mạng (Loading state)
  - Viết các hàm CRUD cơ bản thao tác trên mảng dữ liệu (ví dụ: `getUserByCode`, `getAllUsers`, `submitEvaluation`)

---

## 💻 Giai đoạn 2: Layout & Giả lập Xác thực (App Shell)

**Mục tiêu:** Xây dựng khung sườn ứng dụng và luồng đăng nhập giả (không cần Backend thật).

### Bước 2.1: Authentication UI (Mock)

- [x] **Trang Đăng nhập (`/login`)**
  - UI: Form nhập Mã NV + Chọn Phòng ban (Select) + Mật khẩu
  - Logic: Check `maNhanVien` trong Mock DB. Nếu đúng → lưu user vào localStorage hoặc Context

- [x] **Trang Đăng ký/Update Info (`/register`)**
  - UI: Form cho user lần đầu (cập nhật Họ tên, Email, Password)
  - Logic: Update trường `daDangKy = true` trong Mock User

- [x] **Mock Auth Context**
  - Tạo `AuthProvider` quản lý state user đang đăng nhập
  - Xử lý hàm `login`, `logout`, `checkPermission` (phân quyền Admin/Trưởng phòng/Nhân viên)

### Bước 2.2: App Layout (Dashboard Shell)

- [x] **Component Sidebar**
  - Menu động dựa theo role của user đang login
    - Admin: Full menu
    - Trưởng phòng: Menu báo cáo phòng
    - Nhân viên: Chỉ menu đánh giá cá nhân

- [x] **Component Header**
  - Hiển thị Logo, User Avatar, Dropdown Profile (Logout)
  - Toggle Dark/Light mode (Mantine feature)

- [x] **Layout Wrapper**
  - Kết hợp Sidebar + Header + Main Content
  - Xử lý Loading bar khi chuyển trang (sử dụng `nprogress` hoặc Mantine NavigationProgress)

---

## 🛠️ Giai đoạn 3: Tính năng Quản trị (Admin Features)

**Mục tiêu:** Xây dựng các trang quản lý cấu hình hệ thống.

### Bước 3.1: Quản lý Người dùng

- [x] **Trang Danh sách User**
  - Sử dụng Mantine Table
  - Tính năng: Search, Filter theo Phòng ban, Pagination (giả lập cắt mảng)

- [x] **Modal Thêm/Sửa User**
  - Form validate: Mã NV (bắt buộc), Role, Phòng ban
  - Xử lý submit gọi Mock Service

- [x] **Chức năng Xóa/Vô hiệu hóa**
  - Modal confirm xóa (Soft delete - cập nhật `deletedAt`)

### Bước 3.2: Quản lý Kỳ & Phòng ban

- [x] **Trang Quản lý Phòng ban**
  - List danh sách, gán Trưởng phòng

- [x] **Trang Quản lý Kỳ đánh giá**
  - CRUD Kỳ đánh giá
  - Logic: Chỉ cho phép 1 hoặc nhiều kỳ Active
  - Switch Toggle: Mở/Đóng kỳ

### Bước 3.3: Quản lý Biểu mẫu (Form Builder) - Quan trọng

- [x] **Danh sách Biểu mẫu**
  - Filter theo Loại (Lãnh đạo/Nhân viên), Trạng thái

- [x] **Giao diện Tạo/Sửa Biểu mẫu**
  - Thông tin chung: Tên, Loại, Phạm vi áp dụng
  - Danh sách câu hỏi:
    - Button "Thêm câu hỏi"
    - Input nhập nội dung câu hỏi, điểm tối đa (mặc định 5)
    - Checkbox "Bắt buộc"
    - Nút Xóa/Kéo thả thứ tự (nếu kịp, dùng `@hello-pangea/dnd`)

- [x] **Preview Mode**
  - Button xem trước form sẽ hiển thị thế nào

- [x] **Logic Save**
  - Lưu cấu trúc JSON vào Mock DB

---

## 📝 Giai đoạn 4: Tính năng Đánh giá (Core Business)

**Mục tiêu:** Thực hiện luồng đánh giá theo nghiệp vụ. Đây là phần quan trọng nhất của Frontend.

### Bước 4.1: Luồng Đánh giá Lãnh đạo (Cho Nhân viên)

- [x] **Trang Dashboard Đánh giá**
  - Card hiển thị Kỳ đánh giá đang mở
  - Card "Đánh giá Trưởng phòng": Hiển thị thông tin Trưởng phòng cần đánh giá

- [x] **Form Thực hiện Đánh giá**
  - Header: Thông tin người được đánh giá
  - Body: Render câu hỏi từ Biểu mẫu (Radio Group 1-5 hoặc Rating Component)
  - Footer: Textarea "Nhận xét chung" (Validate bắt buộc)

- [x] **Logic Submit**
  - Validate đã trả lời hết câu hỏi bắt buộc chưa
  - Gọi Mock API `submitEvaluation`
  - Hiển thị thông báo thành công (Mantine Notifications)

### Bước 4.2: Luồng Đánh giá Đồng nghiệp (Peer Review)

- [ ] **Trang Danh sách Đồng nghiệp**
  - Lấy list user cùng `phongBanId`
  - Loại bỏ bản thân (User đang login)
  - Hiển thị trạng thái: "Chưa đánh giá" / "Đã đánh giá"

- [ ] **Form Đánh giá Đồng nghiệp**
  - Tương tự form Lãnh đạo nhưng load Biểu mẫu loại `NHAN_VIEN`
  - Logic check duplicate: Không cho đánh giá 2 lần 1 người trong cùng 1 kỳ

### Bước 4.3: Lịch sử & Chỉnh sửa

- [ ] **Trang Lịch sử Đánh giá**
  - Table liệt kê các phiếu đã gửi

- [ ] **Chức năng Sửa (Trong thời hạn)**
  - Load lại data cũ vào form
  - Cho phép update và lưu lại

---

## 📊 Giai đoạn 5: Dashboard & Báo cáo (Analytics)

**Mục tiêu:** Hiển thị dữ liệu trực quan cho các vai trò khác nhau.

### Bước 5.1: Các Widget Thống kê

- [ ] **Stat Cards**
  - Tổng số đánh giá, Điểm trung bình, Tỉ lệ hoàn thành

- [ ] **Progress Ring**
  - Hiển thị % tiến độ cá nhân/phòng ban

### Bước 5.2: Biểu đồ (Sử dụng Recharts hoặc Mantine Charts)

- [ ] **Biểu đồ Cột (Bar)**
  - Phân bố điểm số (1-5)

- [ ] **Biểu đồ Radar**
  - So sánh các tiêu chí năng lực (nếu biểu mẫu có nhóm tiêu chí)

- [ ] **Bảng Xếp hạng (Cho Admin/Trưởng phòng)**
  - Top nhân viên điểm cao

### Bước 5.3: Phân quyền View Báo cáo

- [ ] **View Trưởng phòng**
  - Filter dữ liệu theo phòng ban của mình (Mock logic: filter mảng theo `phongBanId`)

- [ ] **View Admin**
  - Dropdown chọn xem bất kỳ phòng ban nào hoặc toàn công ty

---

## 🔗 Giai đoạn 6: Backend Integration (Chuyển đổi)

**Mục tiêu:** Thay thế Mock Service bằng Real API & Database. Thực hiện khi Frontend đã chốt xong.

### Bước 6.1: Setup Database & Prisma

- [ ] **Cài đặt PostgreSQL**
  - Local hoặc Docker

- [ ] **Khởi tạo Prisma**
  - Chạy `npx prisma init`

- [ ] **Cấu hình Schema**
  - Copy nội dung `schema.md` vào `schema.prisma`

- [ ] **Migration**
  - Chạy `npx prisma migrate dev` để tạo bảng DB thật

- [ ] **Seed Data**
  - Viết script `seed.ts` để nạp dữ liệu mẫu ban đầu vào DB thật

### Bước 6.2: Implement Auth Thật (NextAuth.js)

- [ ] **Cài đặt Dependencies**
  - `next-auth`, `@next-auth/prisma-adapter`, `bcrypt`

- [ ] **Cấu hình NextAuth**
  - Cấu hình `route.ts` cho NextAuth (Credentials Provider)

- [ ] **Thay thế Mock Auth**
  - Thay thế `MockAuthProvider` bằng `SessionProvider` của NextAuth

- [ ] **Update Login Logic**
  - Cập nhật logic Login để gọi API NextAuth thực tế

### Bước 6.3: API Implementation (Server Actions)

- [ ] **Rewrite Service Layer**
  - Tạo các Server Actions thực tế (kết nối Prisma) thay thế cho các hàm trong `mockService.ts`
  - Ví dụ: `getUsers()` mock → `getUsers()` prisma query

- [ ] **Data Fetching**
  - Chuyển đổi cách gọi dữ liệu (dùng `useEffect` gọi API hoặc Server Components fetch trực tiếp)

### Bước 6.4: Testing & Cleanup

- [ ] **Cleanup Mock Files**
  - Xóa thư mục `_mock` và file `mockService.ts`

- [ ] **E2E Testing**
  - Kiểm tra toàn bộ luồng (E2E testing) trên dữ liệu thật

- [ ] **Deployment**
  - Build production và deploy thử nghiệm
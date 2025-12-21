# 🎯 Hệ Thống Đánh Giá Nội Bộ

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Mantine](https://img.shields.io/badge/Mantine-7.17-339af0?style=flat-square&logo=mantine)](https://mantine.dev/)
[![License](https://img.shields.io/badge/License-Private-red?style=flat-square)](LICENSE)

Hệ thống quản lý và đánh giá năng lực nội bộ cho doanh nghiệp, xây dựng với Next.js 14+ (App Router), Mantine UI v7 và TypeScript.

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Công nghệ](#️-công-nghệ)
- [Kiến trúc](#-kiến-trúc)
- [Cài đặt](#-cài-đặt)
- [Sử dụng](#-sử-dụng)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Phân quyền](#-phân-quyền)
- [Roadmap](#-roadmap)
- [Đóng góp](#-đóng-góp)

---

## 🌟 Giới thiệu

**Hệ Thống Đánh Giá Nội Bộ** là giải pháp toàn diện giúp doanh nghiệp quản lý và thực hiện đánh giá năng lực nhân viên một cách hiệu quả, minh bạch và khoa học.

### Vấn đề giải quyết

- ❌ Quy trình đánh giá nhân viên thủ công, không đồng bộ
- ❌ Khó khăn trong việc theo dõi tiến độ và kết quả đánh giá
- ❌ Thiếu công cụ phân tích và báo cáo trực quan
- ❌ Không có lịch sử đánh giá và so sánh theo thời gian

### Giải pháp

✅ Hệ thống tự động hóa toàn bộ quy trình đánh giá  
✅ Dashboard trực quan với biểu đồ và thống kê  
✅ Quản lý biểu mẫu linh hoạt theo từng phòng ban  
✅ Phân quyền rõ ràng (Admin, Trưởng phòng, Nhân viên)  
✅ Lịch sử đánh giá đầy đủ và có thể chỉnh sửa  

---

## 🚀 Tính năng

### 🔐 Xác thực & Phân quyền
- Đăng nhập bằng mã nhân viên
- 3 vai trò: **Admin**, **Trưởng phòng**, **Nhân viên**
- Đăng ký và cập nhật thông tin cá nhân

### 👥 Quản lý Người dùng (Admin)
- CRUD người dùng với phân quyền
- Tìm kiếm và lọc theo phòng ban
- Phân trang và sắp xếp dữ liệu
- Soft delete (xóa mềm)

### 🏢 Quản lý Phòng ban
- Tạo và quản lý phòng ban
- Gán Trưởng phòng cho từng phòng ban
- Xem danh sách nhân viên theo phòng ban

### 📅 Quản lý Kỳ đánh giá
- Tạo và quản lý các kỳ đánh giá (Quý, Năm)
- Mở/đóng kỳ đánh giá
- Theo dõi tiến độ từng kỳ

### 📝 Quản lý Biểu mẫu (Form Builder)
- Tạo biểu mẫu tùy chỉnh với câu hỏi động
- 2 loại biểu mẫu: **Đánh giá Lãnh đạo** & **Đánh giá Nhân viên**
- Phạm vi áp dụng: Phòng ban cụ thể hoặc Toàn công ty
- Kéo thả sắp xếp câu hỏi
- Xem trước biểu mẫu trước khi phát hành

### ⭐ Thực hiện Đánh giá
- **Đánh giá Lãnh đạo**: Nhân viên đánh giá Trưởng phòng
- **Đánh giá Đồng nghiệp**: Peer review trong cùng phòng ban
- Form đánh giá động dựa trên biểu mẫu
- Nhận xét văn bản cho từng câu hỏi
- Chỉnh sửa đánh giá trong thời hạn

### 📊 Dashboard & Báo cáo
- **Thống kê tổng quan**: Tổng số đánh giá, điểm trung bình, tỷ lệ hoàn thành
- **Biểu đồ trực quan**: Bar chart, Radar chart, Progress ring
- **Bảng xếp hạng**: Top nhân viên theo điểm số
- **Phân quyền view**:
  - Admin: Xem toàn bộ công ty hoặc theo từng phòng ban
  - Trưởng phòng: Chỉ xem phòng ban của mình
  - Nhân viên: Xem kết quả cá nhân

### 📜 Lịch sử Đánh giá
- Xem lại các đánh giá đã thực hiện
- Theo dõi xu hướng điểm số theo thời gian
- Xuất báo cáo (Coming soon)

---

## 🛠️ Công nghệ

### Frontend
- **[Next.js 16.1](https://nextjs.org/)** - React framework với App Router
- **[TypeScript 5.x](https://www.typescriptlang.org/)** - Type-safe development
- **[Mantine UI 7.17](https://mantine.dev/)** - Modern React component library
- **[Recharts](https://recharts.org/)** - Charts and data visualization
- **[@hello-pangea/dnd](https://github.com/hello-pangea/dnd)** - Drag and drop functionality
- **[Day.js](https://day.js.org/)** - Date manipulation
- **[NProgress](https://ricostacruz.com/nprogress/)** - Loading progress bar

### Backend (Coming Soon)
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database
- **[Prisma](https://www.prisma.io/)** - ORM for database operations
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS

---

## 🏗️ Kiến trúc

### Frontend-First Approach

Dự án được xây dựng theo phương pháp **Frontend-First**, sử dụng **Mock Data** để phát triển UI/UX hoàn chỉnh trước khi tích hợp Backend.

```
┌─────────────────────────────────────────────────────┐
│                  Next.js Frontend                    │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  Components  │  │   Features   │  │  Services │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│          │                 │                │        │
│          └─────────────────┴────────────────┘        │
│                         │                            │
│          ┌──────────────▼──────────────┐             │
│          │    Mock Service Layer       │ (Giai đoạn 1-5)
│          │   (_mock/db.ts)             │             │
│          └─────────────────────────────┘             │
└─────────────────────────────────────────────────────┘
                         │
        ┌────────────────▼───────────────┐
        │    Real Backend (Giai đoạn 6)  │
        │  ┌────────────────────────┐    │
        │  │  Server Actions        │    │
        │  └───────────┬────────────┘    │
        │              │                 │
        │  ┌───────────▼────────────┐    │
        │  │  Prisma ORM            │    │
        │  └───────────┬────────────┘    │
        │              │                 │
        │  ┌───────────▼────────────┐    │
        │  │  PostgreSQL Database   │    │
        │  └────────────────────────┘    │
        └────────────────────────────────┘
```

### Feature-Based Structure

Dự án sử dụng cấu trúc **feature-based**, tổ chức code theo tính năng thay vì theo loại file:

```
src/
├── features/
│   ├── auth/          # Authentication features
│   ├── evaluation/    # Evaluation features
│   ├── forms/         # Form builder
│   ├── users/         # User management
│   └── ky-danh-gia/   # Evaluation period management
├── components/shared/ # Shared UI components
├── services/          # Business logic & API calls
├── types/             # TypeScript type definitions
└── _mock/             # Mock data & services
```

---

## 💾 Cài đặt

### Yêu cầu hệ thống

- **Node.js** >= 18.x
- **npm** >= 9.x (hoặc **pnpm**, **yarn**)
- **Git**

### Bước 1: Clone repository

```bash
git clone https://github.com/your-username/website-cong-thong-tin-danh-gia-noi-bo.git
cd website-cong-thong-tin-danh-gia-noi-bo
```

### Bước 2: Cài đặt dependencies

```bash
npm install
# hoặc
pnpm install
# hoặc
yarn install
```

### Bước 3: Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

### Bước 4: Đăng nhập với tài khoản demo

**Admin:**
- Mã NV: `NV001`
- Mật khẩu: `admin123`

**Trưởng phòng:**
- Mã NV: `NV002` (IT)
- Mật khẩu: `tp123`

**Nhân viên:**
- Mã NV: `NV007` (IT)
- Mật khẩu: `nv123`

---

## 📖 Sử dụng

### Quy trình đánh giá cơ bản

#### 1. **Admin thiết lập hệ thống**
   - Tạo phòng ban và phân công Trưởng phòng
   - Thêm người dùng vào hệ thống
   - Tạo biểu mẫu đánh giá (Lãnh đạo & Nhân viên)
   - Tạo và mở kỳ đánh giá mới

#### 2. **Nhân viên thực hiện đánh giá**
   - Đăng nhập vào hệ thống
   - Đánh giá Trưởng phòng (nếu có biểu mẫu Lãnh đạo)
   - Đánh giá đồng nghiệp trong phòng ban

#### 3. **Xem báo cáo**
   - **Trưởng phòng**: Xem báo cáo tổng hợp phòng ban
   - **Admin**: Xem báo cáo toàn công ty
   - **Nhân viên**: Xem kết quả đánh giá cá nhân

---

## 📁 Cấu trúc thư mục

```
website-cong-thong-tin-danh-gia-noi-bo/
│
├── docs/                       # Documentation
│   ├── nghien-cuu.md          # Research & planning
│   ├── rule.md                # Coding rules & conventions
│   ├── schema.md              # Database schema (Prisma)
│   └── trien-khai.md          # Implementation roadmap
│
├── public/                     # Static assets
│   ├── logo-vicenza.png
│   └── logo-vicenza.ico
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (dashboard)/       # Dashboard layout group
│   │   │   ├── bao-cao/       # Reports page
│   │   │   ├── bieu-mau/      # Form management
│   │   │   ├── danh-gia-lanh-dao/  # Leader evaluation
│   │   │   ├── danh-gia-nhan-vien/ # Peer evaluation
│   │   │   ├── ky-danh-gia/   # Evaluation period
│   │   │   ├── nguoi-dung/    # User management
│   │   │   ├── phong-ban/     # Department management
│   │   │   └── lich-su-danh-gia/ # Evaluation history
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── layout.tsx         # Root layout
│   │   ├── providers.tsx      # Context providers
│   │   └── globals.css        # Global styles
│   │
│   ├── components/
│   │   └── shared/            # Reusable UI components
│   │       ├── DashboardLayout.tsx
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   │
│   ├── features/              # Feature modules
│   │   ├── auth/              # Authentication
│   │   │   ├── AuthContext.tsx
│   │   │   └── README.md
│   │   ├── dashboard/         # Dashboard widgets
│   │   ├── evaluation/        # Evaluation logic
│   │   ├── forms/             # Form builder
│   │   │   └── BieuMauFormBuilder.tsx
│   │   ├── ky-danh-gia/       # Period management
│   │   │   ├── KyDanhGiaFormModal.tsx
│   │   │   └── DeleteKyDanhGiaModal.tsx
│   │   └── users/             # User management
│   │       ├── UserFormModal.tsx
│   │       └── DeleteUserModal.tsx
│   │
│   ├── services/
│   │   └── mockService.ts     # Mock API (temporary)
│   │
│   ├── types/
│   │   └── schema.ts          # TypeScript interfaces
│   │
│   ├── _mock/
│   │   └── db.ts              # Mock database
│   │
│   ├── libs/
│   │   └── mock-service/      # Mock service utilities
│   │
│   └── styles/
│       └── theme.ts           # Mantine theme configuration
│
├── .eslintrc.json             # ESLint configuration
├── .prettierrc                # Prettier configuration
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── package.json               # Dependencies
└── README.md                  # This file
```

---

## 🔒 Phân quyền

| Chức năng | Admin | Trưởng phòng | Nhân viên |
|-----------|:-----:|:------------:|:---------:|
| Quản lý người dùng | ✅ | ❌ | ❌ |
| Quản lý phòng ban | ✅ | ❌ | ❌ |
| Quản lý kỳ đánh giá | ✅ | ❌ | ❌ |
| Quản lý biểu mẫu | ✅ | ❌ | ❌ |
| Đánh giá lãnh đạo | ❌ | ❌ | ✅ |
| Đánh giá đồng nghiệp | ❌ | ✅ | ✅ |
| Xem báo cáo phòng ban | ✅ | ✅ | ❌ |
| Xem báo cáo toàn công ty | ✅ | ❌ | ❌ |
| Xem kết quả cá nhân | ✅ | ✅ | ✅ |

---

## 🗺️ Roadmap

### ✅ Giai đoạn 1-5: Frontend Complete (Hiện tại)
- [x] Khởi tạo dự án & cấu hình
- [x] Mock Data & Services
- [x] Authentication UI (Mock)
- [x] Dashboard Layout & Navigation
- [x] Quản lý Người dùng
- [x] Quản lý Phòng ban
- [x] Quản lý Kỳ đánh giá
- [x] Form Builder (Biểu mẫu)
- [x] Luồng đánh giá (Lãnh đạo & Nhân viên)
- [x] Dashboard & Báo cáo
- [x] Lịch sử đánh giá

### 🚧 Giai đoạn 6: Backend Integration (Coming Soon)
- [ ] Setup PostgreSQL Database
- [ ] Prisma Schema & Migration
- [ ] NextAuth.js Authentication
- [ ] Server Actions Implementation
- [ ] Replace Mock Service với Real API
- [ ] Testing & Deployment

### 🔮 Tính năng tương lai
- [ ] Xuất báo cáo PDF/Excel
- [ ] Email thông báo tự động
- [ ] Mobile app (React Native)
- [ ] AI-powered insights & recommendations
- [ ] Multi-language support (English, Vietnamese)
- [ ] Advanced analytics & predictions
- [ ] Integration với HR systems

---

## 🤝 Đóng góp

Dự án này hiện tại đang trong quá trình phát triển nội bộ. Nếu bạn là thành viên của team và muốn đóng góp:

### Quy trình đóng góp

1. **Fork** repository này
2. Tạo **feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit** thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. **Push** lên branch (`git push origin feature/AmazingFeature`)
5. Tạo **Pull Request**

### Coding Standards

- Tuân thủ quy tắc trong `docs/rule.md`
- Viết code TypeScript với type-safety
- Component names sử dụng PascalCase
- File names sử dụng kebab-case
- Viết comments rõ ràng cho logic phức tạp
- Test kỹ trước khi tạo PR

---

## 📄 License

Private - Nội bộ công ty. Mọi quyền được bảo lưu.

---

## 📞 Liên hệ

- **Project Lead**: [Your Name]
- **Email**: your.email@company.com
- **Documentation**: [docs/](./docs/)

---

## 🙏 Acknowledgments

- [Next.js Team](https://nextjs.org/) - Amazing React framework
- [Mantine](https://mantine.dev/) - Beautiful UI library
- [Vercel](https://vercel.com/) - Deployment platform
- Team members who contributed to this project

---

<div align="center">
  <strong>Made with ❤️ by VICENZA Team</strong>
  <br />
  <sub>Hệ Thống Đánh Giá Nội Bộ © 2024</sub>
</div>

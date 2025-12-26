# Cập nhật hệ thống

## Thay đổi phân quyền xem đánh giá cho trưởng phòng

### Yêu cầu
- **trước đây**: truong_phong xem được đánh giá của mình (form nhan_vien đánh giá nhan_vien và nhan_vien đánh giá truong_phong) và các nhan_vien trong phòng ban (form nhan_vien đánh giá nhan_vien và nhan_vien đánh giá truong_phong trong phòng ban).
- **hiện tại**: truong_phong xem được đánh giá của mình (form nhan_vien đánh giá nhan_vien và nhan_vien đánh giá truong_phong) và **CHỈ form nhan_vien đánh giá nhan_vien trong cùng phòng**. Không xem được form nhan_vien đánh giá truong_phong nữa.

### Các file đã sửa

1. **src/app/xem-danh-gia/page.tsx**
   - Thêm filter để truong_phong chỉ xem các đánh giá có loaiDanhGia === NHAN_VIEN
   - Import LoaiDanhGia enum
   - Filter sau khi load details, loại bỏ các đánh giá LANH_DAO

2. **src/app/api/danh-gias/for-department/route.ts**
   - Thêm filter để API chỉ trả về các đánh giá loại NHAN_VIEN
   - Import LoaiDanhGia enum
   - Áp dụng filter cho cả hai trường hợp: đọc từ filesystem và fallback in-memory

3. **src/app/bao-cao/page.tsx**
   - Thêm filter cho truong_phong: chỉ tính các đánh giá có loaiDanhGia === NHAN_VIEN
   - Import LoaiDanhGia enum
   - Load tất cả bieuMaus trước để filter theo loaiDanhGia

### Trạng thái
✅ **Hoàn thành**

- [x] Sửa xem-danh-gia/page.tsx
- [x] Sửa api/danh-gias/for-department/route.ts
- [x] Sửa bao-cao/page.tsx
- [x] Build project thành công (không có lỗi)
- [x] Cập nhật tài liệu

---

## Cải thiện responsive cho trang đăng nhập

### Yêu cầu
- Sửa lại giao diện responsive cho trang đăng nhập và đăng ký để hiển thị tốt trên thiết bị di động
- Kích thước các thành phần phải hợp lý khi người dùng truy cập bằng điện thoại

### Các file đã sửa

1. **src/app/login/page.tsx**
   - Thêm responsive padding cho Container: `px={{ base: 16, sm: 20 }}`
   - Thêm responsive margin: `my={{ base: 20, sm: 40 }}`
   - Thêm responsive padding cho Paper: `p={{ base: 20, sm: 30 }}`
   - Giảm kích thước logo trên mobile: `maxWidth: "100px", maxHeight: "100px"`
   - Thêm padding cho Box container: `padding: "16px"`
   - Sử dụng clamp() cho font size của Title để tự động điều chỉnh
   - Giảm font size của text hướng dẫn trên mobile: `size="xs"` và thêm padding ngang

2. **src/app/register/page.tsx**
   - Thêm responsive padding cho Container: `px={{ base: 16, sm: 20 }}`
   - Thêm responsive margin: `my={{ base: 20, sm: 40 }}`
   - Thêm responsive padding cho Paper: `p={{ base: 20, sm: 30 }}`
   - Giảm kích thước logo trên mobile: `maxWidth: "100px", maxHeight: "100px"`
   - Sử dụng clamp() cho font size của Title
   - Thêm responsive cho Group buttons: `gap="sm"` và `wrap="nowrap"` với `flex={1}` để buttons chia đều không gian

### Trạng thái
✅ **Hoàn thành**

- [x] Sửa login/page.tsx với responsive design
- [x] Sửa register/page.tsx với responsive design
- [x] Build project thành công (không có lỗi)
- [x] Cập nhật tài liệu

---

## Thêm bottom navigation bar cho mobile

### Yêu cầu
- Trên giao diện điện thoại, ẩn sidebar và hiển thị bottom navigation bar
- Bottom navigation bar cố định ở dưới cùng màn hình
- Nội dung có thể scroll, bottom bar luôn hiển thị
- Thứ tự các mục: Xem đánh giá | Đánh giá lãnh đạo | Logo công ty (trang chủ) | Đánh giá nhân viên | Tài khoản (đăng xuất)

### Các file đã sửa

1. **src/components/shared/BottomNavigationBar.tsx** (mới)
   - Tạo component bottom navigation bar mới
   - Hiển thị 5 mục: Xem đánh giá (nếu có quyền), Đánh giá lãnh đạo, Logo (trang chủ), Đánh giá nhân viên, Tài khoản
   - Sử dụng `useMediaQuery` để chỉ hiển thị trên mobile (< sm breakpoint)
   - Cố định ở dưới cùng với `position: fixed` và `zIndex: 1000`
   - Highlight mục đang active
   - Xử lý logout khi click vào Tài khoản

2. **src/components/shared/DashboardLayout.tsx**
   - Thêm `BottomNavigationBar` component
   - Điều chỉnh layout: thêm `paddingBottom: 70` trên mobile để tránh nội dung bị che bởi bottom bar
   - Sử dụng `useMediaQuery` để điều chỉnh `marginLeft` và `paddingBottom` theo breakpoint
   - Trên mobile: `marginLeft: 0`, `paddingBottom: 70`
   - Trên desktop: `marginLeft: 280`, `paddingBottom: 0`

3. **src/components/shared/Sidebar.tsx**
   - Ẩn sidebar trên mobile bằng `useMediaQuery`
   - Chỉ hiển thị khi `isMobile === false` (tức là màn hình >= sm breakpoint)

4. **src/components/shared/Header.tsx**
   - Điều chỉnh `left` position theo breakpoint
   - Trên mobile: `left: 0` (full width)
   - Trên desktop: `left: 280` (có sidebar)

### Trạng thái
✅ **Hoàn thành**

- [x] Tạo BottomNavigationBar component
- [x] Cập nhật DashboardLayout để responsive
- [x] Ẩn Sidebar trên mobile
- [x] Điều chỉnh Header responsive
- [x] Build project thành công (không có lỗi)
- [x] Cập nhật tài liệu

---

## Cải thiện bottom navigation bar cho mobile

### Yêu cầu
- Fix navbar cho giao diện điện thoại sao cho hợp lý
- Tối ưu kích thước, spacing và layout
- Đảm bảo hiển thị tốt trên các kích thước màn hình khác nhau

### Các file đã sửa

1. **src/components/shared/BottomNavigationBar.tsx**
   - Refactor code để sử dụng mảng `navItems` để dễ quản lý và đảm bảo layout đều
   - Giảm chiều cao từ 70px xuống 65px để tối ưu không gian
   - Giảm kích thước icon từ 24px xuống 22px
   - Giảm kích thước logo từ 32px xuống 28px
   - Giảm font size text từ `xs` xuống `10px` để phù hợp với màn hình nhỏ
   - Rút ngắn label "Xem đánh giá" thành "Xem" để tiết kiệm không gian
   - Giảm gap giữa icon và text từ 4px xuống 2px
   - Giảm padding từ "8px 4px" xuống "6px 2px"
   - Thêm `minWidth: 0` để đảm bảo text không bị tràn
   - Thêm `textOverflow: "ellipsis"` và `whiteSpace: "nowrap"` để xử lý text dài
   - Thêm `transition` cho background color để smooth hơn
   - Thêm `paddingBottom: "env(safe-area-inset-bottom)"` để hỗ trợ safe area trên các thiết bị có notch
   - Đảm bảo layout đều khi có/không có mục "Xem đánh giá" bằng cách sử dụng mảng động

2. **src/components/shared/DashboardLayout.tsx**
   - Cập nhật `paddingBottom` từ 70px xuống 65px để phù hợp với chiều cao mới của bottom bar

### Trạng thái
✅ **Hoàn thành**

- [x] Cải thiện BottomNavigationBar với layout tối ưu
- [x] Tối ưu kích thước và spacing
- [x] Thêm safe area support
- [x] Cập nhật DashboardLayout
- [x] Build project thành công (không có lỗi)
- [x] Cập nhật tài liệu

---

## Cải thiện Header (navbar) cho mobile

### Yêu cầu
- Ẩn text "Hệ thống Đánh giá Nội bộ" trên mobile
- Avatar, tên, email nằm bên trái
- Toggle giao diện sáng/tối bên phải
- Không dùng background trong suốt
- Kích thước hợp lý

### Các file đã sửa

1. **src/components/shared/Header.tsx**
   - Ẩn text "Hệ thống Đánh giá Nội bộ" trên mobile bằng điều kiện `!isMobile`
   - Sắp xếp lại layout cho mobile:
     - Avatar + thông tin người dùng (tên, email) nằm bên trái trong Menu
     - Toggle sáng/tối nằm bên phải
   - Thay đổi background từ `var(--mantine-color-body)` sang màu rõ ràng hơn:
     - Dark mode: `var(--mantine-color-dark-7)`
     - Light mode: `var(--mantine-color-gray-0)`
   - Giảm chiều cao từ 60px xuống 56px trên mobile
   - Giảm kích thước Avatar từ mặc định xuống `sm` trên mobile
   - Giảm font size text: tên `xs`, email `10px` trên mobile
   - Thêm `truncate` cho text để tránh tràn
   - Giảm padding từ `md` xuống `sm` trên mobile
   - Giảm gap giữa các elements trên mobile
   - Giảm kích thước ActionIcon và icon trên mobile
   - Đảm bảo layout responsive với `flex: 1` cho Group chứa user info

2. **src/components/shared/DashboardLayout.tsx**
   - Cập nhật `marginTop` từ 60px xuống 56px trên mobile
   - Cập nhật `minHeight` để phù hợp với chiều cao header mới

### Trạng thái
✅ **Hoàn thành**

- [x] Ẩn text "Hệ thống Đánh giá Nội bộ" trên mobile
- [x] Sắp xếp lại layout: Avatar + info bên trái, toggle bên phải
- [x] Thay đổi background không trong suốt
- [x] Tối ưu kích thước cho mobile
- [x] Cập nhật DashboardLayout
- [x] Build project thành công (không có lỗi)
- [x] Cập nhật tài liệu


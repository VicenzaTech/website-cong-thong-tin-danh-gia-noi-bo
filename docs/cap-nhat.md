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


Tài liệu Đặc tả Hệ thống Đánh giá Nội bộ

1. Tổng quan Hệ thống
   Hệ thống đánh giá nội bộ được xây dựng nhằm quản lý và thực hiện quy trình đánh giá năng lực nhân sự trong tổ chức, bao gồm đánh giá năng lực lãnh đạo và đánh giá đồng nghiệp.
   1.1 Công nghệ sử dụng

Framework: Next.js (Full-stack)
UI Library: Mantine UI
Database: PostgreSQL
ORM: Prisma
Authentication: NextAuth.js
Architecture: Enterprise-grade, module hóa, dễ bảo trì và mở rộng

2. Kiến trúc Backend
   2.1 Phân quyền người dùng
   Hệ thống có 3 vai trò (role) với phân cấp quyền hạn rõ ràng:
   Admin (Quản trị viên)

Quản lý toàn bộ người dùng: thêm, xóa, sửa, xem thông tin
Truy cập danh sách tất cả người dùng trong công ty
Cấu hình và quản lý biểu mẫu đánh giá
Xem tổng quan dữ liệu toàn công ty

Trưởng phòng (truong_phong)

Xem thông tin và danh sách nhân viên thuộc phòng ban quản lý
Xem báo cáo và thống kê cấp phòng ban
Không có quyền chỉnh sửa thông tin người dùng

Nhân viên (nhan_vien)

Chỉ xem được thông tin cá nhân của mình
Xem danh sách đồng nghiệp trong phòng ban (để thực hiện đánh giá)

2.2 Loại đánh giá
Hệ thống hỗ trợ 2 loại đánh giá độc lập:

Đánh giá năng lực lãnh đạo: Nhân viên đánh giá Trưởng phòng
Đánh giá năng lực nhân viên: Nhân viên đánh giá đồng nghiệp trong cùng phòng ban

3. Kiến trúc Frontend
   3.1 Quy trình xác thực (Authentication Flow)
   Bước 1: Đăng nhập

Người dùng nhập Mã nhân viên và chọn Phòng ban
Hệ thống kiểm tra trạng thái đăng ký của mã nhân viên

Bước 2: Phân luồng

Người dùng mới (chưa đăng ký): Chuyển hướng đến trang Đăng ký

Yêu cầu cập nhật: Họ tên, Mật khẩu
Thông tin phòng ban và mã nhân viên đã được xác định từ bước đăng nhập

Người dùng đã đăng ký: Xác thực mật khẩu

Đăng nhập thành công → NextAuth.js tạo session
Điều hướng đến Dashboard tương ứng theo vai trò

3.2 Cấu trúc Layout
Mọi trang đều có bố cục chuẩn gồm:

Sidebar: Menu điều hướng chính
Navbar: Thanh tiêu đề với thông tin người dùng
Content Area: Nội dung chính
Footer: Thông tin chân trang

3.3 Các Module chức năng
A. Dashboard - Tổng quan
Hiển thị thống kê và phân tích dữ liệu đánh giá theo phạm vi quyền hạn:
Chỉ số thống kê:

Tổng số người cần đánh giá / đã hoàn thành đánh giá
Điểm số tổng hợp: Tổng điểm, Điểm trung bình, Điểm cao nhất, Điểm thấp nhất

Biểu đồ trực quan:

Biểu đồ đánh giá cá nhân người dùng
Biểu đồ tổng hợp cấp phòng ban
Biểu đồ tổng hợp toàn công ty (chỉ Admin)

Phân quyền hiển thị:

Admin: Xem toàn bộ dữ liệu công ty
Trưởng phòng: Chỉ xem dữ liệu phòng ban mình quản lý
Nhân viên: Chỉ xem dữ liệu cá nhân

B. Nhận xét năng lực lãnh đạo
Quy trình đánh giá Trưởng phòng:

Chọn đối tượng đánh giá: Người dùng chọn Trưởng phòng từ danh sách
Thực hiện đánh giá: Điền biểu mẫu theo tiêu chí đã cấu hình
Xem lại đánh giá: Có thể xem lại nội dung đã đánh giá
Giới hạn: Mỗi người chỉ được đánh giá 1 lần duy nhất cho mỗi đối tượng

C. Nhận xét năng lực nhân viên
Quy trình đánh giá đồng nghiệp:

Chọn đối tượng đánh giá: Chọn nhân viên trong cùng phòng ban
Thực hiện đánh giá: Điền biểu mẫu theo tiêu chí đã cấu hình
Xem lại đánh giá: Có thể xem lại nội dung đã đánh giá
Giới hạn: Mỗi người chỉ được đánh giá 1 lần duy nhất cho mỗi đối tượng

D. Cài đặt biểu mẫu (Chỉ Admin)
Quản lý mẫu đánh giá với các tính năng:
Tạo/Chỉnh sửa biểu mẫu:

Chọn loại biểu mẫu: Đánh giá lãnh đạo hoặc Đánh giá nhân viên
Chọn phạm vi áp dụng: Phòng ban cụ thể hoặc toàn công ty
Cấu hình câu hỏi đánh giá:

Thêm/xóa các câu hỏi
Mỗi câu hỏi có thang điểm 1-5

Trường nhận xét cuối: Bắt buộc nhập
Lưu và phát hành biểu mẫu

Quản lý biểu mẫu:

Xem danh sách biểu mẫu đã tạo
Chỉnh sửa biểu mẫu hiện có
Kích hoạt/Vô hiệu hóa biểu mẫu

E. Danh sách người dùng
Admin:

Xem toàn bộ danh sách người dùng
Thêm người dùng mới
Chỉnh sửa thông tin người dùng
Xóa người dùng
Phân quyền vai trò

Trưởng phòng:

Xem danh sách nhân viên trong phòng ban quản lý
Chỉ có quyền xem, không chỉnh sửa

Nhân viên:

Xem danh sách đồng nghiệp trong phòng ban
Mục đích: Tra cứu để thực hiện đánh giá

F. Cài đặt
Chức năng dành cho tất cả người dùng:

Đổi mật khẩu cá nhân
Cập nhật thông tin hồ sơ (nếu được phép)

3.4 Ma trận phân quyền Module
ModuleAdminTrưởng phòngNhân viênDashboardToàn công tyPhòng banCá nhânNhận xét năng lực lãnh đạo✓✓✓Nhận xét năng lực nhân viên✓✓✓Cài đặt biểu mẫu✓✗✗Danh sách người dùngToàn bộ (CRUD)Phòng ban (View)Phòng ban (View)Cài đặt✓✓✓ 4. Các quy tắc nghiệp vụ quan trọng

Mỗi đánh giá chỉ thực hiện 1 lần: Sau khi hoàn thành, không thể đánh giá lại người đó trong cùng kỳ đánh giá
Phạm vi đánh giá: Chỉ được đánh giá người trong cùng phòng ban
Nhận xét bắt buộc: Mọi biểu mẫu đều yêu cầu phần nhận xét văn bản
Phân quyền dữ liệu: Mỗi vai trò chỉ truy cập dữ liệu trong phạm vi cho phép
Biểu mẫu linh hoạt: Admin có thể tùy chỉnh biểu mẫu cho từng phòng ban

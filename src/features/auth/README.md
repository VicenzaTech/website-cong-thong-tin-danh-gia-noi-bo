# Authentication Module

## Test Accounts

Để test hệ thống, sử dụng các tài khoản sau:

### Admin
- Mã NV: `ADMIN001`
- Phòng ban: Phòng Nhân sự
- Mật khẩu: `$2a$10$YourHashedPasswordHere`

### Trưởng phòng
- Mã NV: `TP001` (Phòng Kỹ thuật)
- Mã NV: `TP002` (Phòng Kinh doanh)
- Mã NV: `TP003` (Phòng Nhân sự)
- Mã NV: `TP004` (Phòng Tài chính)
- Mã NV: `TP005` (Phòng Marketing)
- Mật khẩu: `$2a$10$YourHashedPasswordHere`

### Nhân viên
- Mã NV: `NV001` đến `NV020`
- Phòng ban: Tương ứng với từng phòng
- Mật khẩu: `$2a$10$YourHashedPasswordHere`

## Features

- Mock authentication với localStorage
- Auto-redirect cho user chưa đăng ký
- Role-based permission checking
- Session persistence


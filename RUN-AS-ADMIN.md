# ⚠️ QUAN TRỌNG: Chạy với quyền Administrator

## Vấn đề

Better-sqlite3 là native module, Turbopack cần quyền Administrator để tạo symlinks trên Windows.

## Giải pháp 1: Run PowerShell as Administrator (Khuyến nghị)

1. **Tìm PowerShell:**
   - Nhấn `Windows + X`
   - Chọn "Windows PowerShell (Admin)" hoặc "Terminal (Admin)"

2. **Chạy lệnh:**
```powershell
cd D:\VICENZA\Du-an\website-cong-thong-tin-danh-gia-noi-bo
npm run dev
```

3. **Mở trình duyệt:**
```
http://localhost:3000/login
```

## Giải pháp 2: Dùng WSL (Ubuntu)

```bash
# Mở WSL
wsl

# Di chuyển đến thư mục project
cd /mnt/d/VICENZA/Du-an/website-cong-thong-tin-danh-gia-noi-bo

# Chạy dev server
npm run dev
```

## Giải pháp 3: Enable Developer Mode (Windows 10/11)

1. Mở Settings
2. Update & Security → For Developers
3. Bật "Developer Mode"
4. Restart máy
5. Chạy lại `npm run dev` (không cần Admin)

## Kiểm tra

Sau khi chạy thành công, bạn sẽ thấy:

```
▲ Next.js 16.1.0 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://172.23.112.1:3000

✓ Starting...
✓ Ready in 2.9s
```

**Không có lỗi FATAL về better-sqlite3**

## Test Login

1. Mở: http://localhost:3000/login
2. Nhập: `ADMIN001` / `vicenza`
3. Đổi password
4. Login lại với password mới
5. ✅ Success!

## Lỗi thường gặp

### "os error 1314" - Không có quyền
→ Chạy PowerShell as Administrator

### "POST /api/auth/check-user 500"
→ Better-sqlite3 không load được, cần Admin

### "FATAL: Turbopack error"
→ Symlink issue, cần Admin hoặc Developer Mode

## Production

Trên server Linux không có vấn đề này:

```bash
npm run build
npm start
```


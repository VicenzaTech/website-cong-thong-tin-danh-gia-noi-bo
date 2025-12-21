# Quy tắc phát triển (Development Rules)

Tài liệu này tổng hợp các quy tắc và tư duy lập trình cốt lõi để đảm bảo code sạch, dễ bảo trì và hiệu quả.

## 1. Nguyên tắc cốt lõi (Core Principles)

- **KISS (Keep It Simple, Stupid):** Ưu tiên giải pháp đơn giản nhất, tránh over-engineering.
- **YAGNI (You Ain't Gonna Need It):** Không viết code cho những tính năng chưa thực sự cần đến.
- **DRY (Don't Repeat Yourself):** Tách logic dùng chung vào các utils, hooks hoặc services.
- **Code rõ ràng > Code thông minh:** Ưu tiên tính dễ đọc và dễ hiểu thay vì sử dụng các kỹ thuật phức tạp.
- **Không dùng emoji:** Tuyệt đối không sử dụng emoji trong mã nguồn, comment hoặc log.
- **Naming rõ ràng:** Đặt tên biến, hàm và component một cách nhất quán và có ý nghĩa.

## 2. Kiến trúc & Component (Architecture & Components)

- **Single Responsibility:** Mỗi component nên nhỏ và chỉ đảm nhận một trách nhiệm duy nhất.
- **Server Components First:** Ưu tiên sử dụng React Server Components, chỉ dùng Client Components khi cần thiết (tương tác, state).
- **State Management:** Ưu tiên sử dụng state tại chỗ (local state). Chỉ dùng global state khi thực sự bắt buộc.
- **Tránh Prop-drilling:** Không truyền props quá sâu qua nhiều cấp. Sử dụng React Context một cách hợp lý.
- **Data Fetching:** Ưu tiên fetch data ở phía server. Tránh việc fetch dữ liệu trùng lặp.

## 3. Xử lý lỗi & Trạng thái (Error Handling & States)

- **Phản hồi người dùng:** Luôn xử lý đầy đủ các trạng thái Loading, Error và Empty.
- **Error Handling:**
  - Không sử dụng các khối `try/catch` rỗng.
  - Không nuốt lỗi silently (phải log hoặc thông báo).
  - Log lỗi phải kèm theo ngữ cảnh (context) rõ ràng.
- **Cấu hình:** Không hard-code các thông số cấu hình vào source code.

## 4. Tối ưu hiệu năng (Performance)

- **Re-renders:** Tránh gây ra re-render không cần thiết cho component.
- **Memoization:** Chỉ sử dụng `useMemo` hoặc `memo` khi thực sự cần thiết và có đo lường hiệu quả.

## 5. Quy trình & Bảo trì (Process & Maintenance)

- **Comment:** Giải thích **TẠI SAO (WHY)** làm như vậy, đừng giải thích **LÀM GÌ (WHAT)** (trừ khi logic quá phức tạp).
- **Code chết:** Luôn dọn dẹp code không sử dụng và các ghi chú `TODO` đã cũ.
- **Pull Requests:** Chia nhỏ PR để dễ dàng review và kiểm soát chất lượng.
- **Đơn giản là tốt nhất:** Giữ cho logic gọn gàng, loại bỏ các đoạn xử lý thừa.

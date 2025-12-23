# Phân tích Bug trong Cơ chế Đăng nhập

## 🔴 CRITICAL BUGS

### 1. Prisma findUnique với Non-Unique Field
**File:** `src/libs/auth.ts` (dòng 21-24), `src/actions/auth.ts` (dòng 8-12)

**Vấn đề:**
```typescript
const user = await prisma.user.findUnique({
  where: {
    maNhanVien: String(credentials.maNhanVien),
    deletedAt: null,  // ❌ deletedAt không phải unique field
  },
});
```

**Giải thích:**
- `findUnique` chỉ hoạt động với unique fields hoặc unique constraints
- `deletedAt` không phải unique field, nên Prisma sẽ báo lỗi hoặc không filter đúng
- Có thể cho phép user đã bị xóa (soft delete) đăng nhập

**Giải pháp:**
```typescript
const user = await prisma.user.findFirst({
  where: {
    maNhanVien: String(credentials.maNhanVien),
    deletedAt: null,
  },
  include: {
    phongBan: true,
  },
});
```

**Impact:** CRITICAL - Có thể cho phép user đã bị xóa đăng nhập

---

### 2. Null Reference - phongBan có thể null
**File:** `src/libs/auth.ts` (dòng 56), `src/actions/auth.ts` (dòng 34)

**Vấn đề:**
```typescript
phongBanName: user.phongBan.tenPhongBan,  // ❌ Nếu phongBan null thì crash
```

**Giải thích:**
- Mặc dù schema có `phongBanId` là required, nhưng relation `phongBan` có thể null nếu:
  - Phòng ban bị xóa
  - Data inconsistency
  - Race condition khi phòng ban bị xóa trong khi user đang login

**Giải pháp:**
```typescript
phongBanName: user.phongBan?.tenPhongBan || "N/A",
```

**Impact:** HIGH - Server crash khi phongBan null

---

### 3. lastLoginAt Update không có Error Handling
**File:** `src/libs/auth.ts` (dòng 44-47)

**Vấn đề:**
```typescript
await prisma.user.update({
  where: { id: user.id },
  data: { lastLoginAt: new Date() },
});
// ❌ Nếu update fail, user vẫn được authenticate nhưng lastLoginAt không được update
```

**Giải thích:**
- Nếu database connection fail hoặc có lỗi khác, update sẽ throw error
- User vẫn được authenticate (vì return đã được thực hiện trước đó)
- Nhưng `lastLoginAt` không được update, mất tracking

**Giải pháp:**
```typescript
try {
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
} catch (error) {
  // Log error nhưng không block authentication
  console.error("Failed to update lastLoginAt:", error);
}
```

**Impact:** MEDIUM - Mất tracking login time

---

## 🟡 MEDIUM PRIORITY BUGS

### 4. localStorage trong SSR Context
**File:** `src/app/login/page.tsx` (dòng 73)

**Vấn đề:**
```typescript
localStorage.setItem("pending_user", JSON.stringify(result.user));
// ❌ Có thể fail trong SSR hoặc khi localStorage disabled
```

**Giải thích:**
- `localStorage` không available trong SSR
- Có thể bị disable trong một số browser settings
- Không có error handling

**Giải pháp:**
```typescript
if (typeof window !== "undefined") {
  try {
    localStorage.setItem("pending_user", JSON.stringify(result.user));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
    // Fallback: có thể dùng sessionStorage hoặc cookie
  }
}
```

**Impact:** MEDIUM - Registration flow có thể fail

---

### 5. Auto-check User on Blur - Race Condition
**File:** `src/app/login/page.tsx` (dòng 226-228)

**Vấn đề:**
```typescript
onBlur={() => {
  if (form.values.maNhanVien.trim() && !foundUser && !isCheckingUser) {
    handleCheckUser();  // ❌ Có thể gây nhiều requests đồng thời
  }
}}
```

**Giải thích:**
- Nếu user type nhanh và blur nhiều lần, có thể có nhiều requests chạy đồng thời
- Không có debounce
- Có thể gây race condition

**Giải pháp:**
- Thêm debounce cho auto-check
- Hoặc chỉ check khi user click "Tiếp tục" button

**Impact:** LOW-MEDIUM - Performance và unnecessary requests

---

### 6. trangThaiKH Check có thể không chính xác
**File:** `src/libs/auth.ts` (dòng 31)

**Vấn đề:**
```typescript
if (!user || !user.trangThaiKH || !user.matKhau) {
  return null;
}
```

**Giải thích:**
- Nếu `trangThaiKH` là `null` (mặc dù schema có `@default(true)`), thì `!null === true` sẽ pass check
- Tuy nhiên, trong schema có `@default(true)`, nên có thể không phải bug thực sự
- Nhưng để an toàn, nên check explicit: `user.trangThaiKH !== true`

**Giải pháp:**
```typescript
if (!user || user.trangThaiKH !== true || !user.matKhau) {
  return null;
}
```

**Impact:** LOW - Có thể không phải bug nếu schema đúng

---

## 🟢 LOW PRIORITY / CODE QUALITY

### 7. Error Messages không consistent
**File:** `src/app/login/page.tsx` (dòng 110-121)

**Vấn đề:**
- Error messages được map từ NextAuth error codes
- Nhưng một số error codes có thể không được handle
- Generic error message có thể không helpful

**Impact:** LOW - User experience

---

### 8. Session Refresh Race Condition
**File:** `src/app/login/page.tsx` (dòng 134)

**Vấn đề:**
```typescript
window.location.href = "/";
```

**Giải thích:**
- Đã được fix trước đó (thay vì dùng `router.push`)
- Nhưng vẫn có thể có race condition nếu session chưa được refresh hoàn toàn
- User có thể thấy loading state lâu

**Impact:** LOW - User experience

---

## 📋 Tổng kết

### Critical (Cần fix ngay):
1. ✅ Prisma findUnique với non-unique field (CRITICAL)
2. ✅ Null reference phongBan (HIGH)
3. ✅ lastLoginAt update error handling (MEDIUM)

### High Priority:
4. ✅ localStorage SSR check (MEDIUM)

### Medium Priority:
5. ✅ Auto-check race condition (LOW-MEDIUM)
6. ✅ trangThaiKH explicit check (LOW)

### Low Priority:
7. ✅ Error messages improvement (LOW)
8. ✅ Session refresh optimization (LOW)

---

## 🔧 Recommended Fix Order

1. **Fix findUnique → findFirst** (CRITICAL - có thể cho phép deleted user login)
2. **Fix phongBan null check** (HIGH - server crash)
3. **Add error handling cho lastLoginAt** (MEDIUM - tracking)
4. **Fix localStorage SSR check** (MEDIUM - registration flow)
5. **Improve auto-check logic** (LOW-MEDIUM - performance)


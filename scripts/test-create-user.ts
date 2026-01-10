import { authService } from "@/libs/sqlite.server";
import { users as mockUsers, phongBans as mockPhongBans } from "@/_mock/db";

async function run() {
  try {
    await authService.initializeFromMockData(mockUsers as any, mockPhongBans as any);
    const id = `test_${Date.now()}`;
    const hashed = await authService.hashPassword("123456");
    const created = authService.createUserAndGet({
      id,
      maNhanVien: `TEST_${Date.now()}`,
      hoTen: "Test User",
      email: "test.user@example.com",
      matKhau: hashed,
      role: "nhan_vien",
      phongBanId: mockPhongBans[0].id,
      daDangKy: false,
      trangThaiKH: true,
    } as any);

    console.log("Created:", created);
  } catch (err) {
    console.error("Test create error:", err);
    process.exit(1);
  }
}

run();

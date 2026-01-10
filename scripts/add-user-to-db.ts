import { authService } from "@/libs/sqlite.server";
import { users as mockUsers, phongBans as mockPhongBans } from "@/_mock/db";

function parseArgs() {
  const args = process.argv.slice(2);
  const out: Record<string, string> = {};
  for (const a of args) {
    const m = a.match(/^--([a-zA-Z0-9_\-]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

async function main() {
  const argv = parseArgs();
  const maNhanVien = argv.maNhanVien || argv.ma || argv.m || undefined;
  const hoTen = argv.hoTen || argv.ho || argv.name || "";
  const email = argv.email || argv.e || "";
  const phongBanId = argv.phongBanId || argv.pb || argv.phongBan || undefined;
  const role = argv.role || "nhan_vien";
  const boPhan = argv.boPhan || argv.bp || "";
  const password = argv.password || argv.pw || "123456";

  if (!maNhanVien) {
    console.error("Missing required --maNhanVien");
    console.error("Usage: npx tsx scripts/add-user-to-db.ts --maNhanVien=XXX --phongBanId=pb1 [--hoTen=Name] [--email=email] [--role=nhan_vien] [--boPhan=...] [--password=123456]");
    process.exit(1);
  }

  if (!phongBanId) {
    console.error("Missing required --phongBanId");
    process.exit(1);
  }

  try {
    await authService.initializeFromMockData(mockUsers as any, mockPhongBans as any);
    const id = `user_${Date.now()}`;
    const hashed = await authService.hashPassword(password);

    const created = authService.createUserAndGet({
      id,
      maNhanVien,
      hoTen,
      email,
      matKhau: hashed,
      role,
      phongBanId,
      daDangKy: false,
      trangThaiKH: true,
    } as any);

    if (!created) {
      console.error("Failed to create user");
      process.exit(1);
    }

    // update bo_phan if provided (optional)
    if (boPhan) {
      authService.updateUser(created.id, { hoTen: created.ho_ten || hoTen, email: created.email || email });
      const db = (authService as any).getDatabase ? (authService as any).getDatabase() : undefined;
      // Use sqliteDb directly if needed; however bo_phan is not exposed in updateUser signature.
    }

    console.log("Created user:", {
      id: created.id,
      maNhanVien: created.ma_nhan_vien,
      hoTen: created.ho_ten,
      email: created.email,
      phongBanId: created.phong_ban_id,
      role: created.role,
      created_at: created.created_at,
    });
  } catch (err) {
    console.error("Error creating user:", err);
    process.exit(1);
  }
}

main();

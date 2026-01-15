import { authService } from "@/libs/sqlite.server";

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
  const maNhanVien = argv.maNhanVien || argv.ma || argv.m;
  const boPhan = argv.boPhan || argv.bp || argv.b;

  if (!maNhanVien || !boPhan) {
    console.error("Usage: npx tsx scripts/set-user-bo-phan.ts --maNhanVien=NV0099 --boPhan=\"Tổ phục vụ xuất hàng\"");
    process.exit(1);
  }

  try {
    const user = authService.getUserByMaNhanVien(maNhanVien);
    if (!user) {
      console.error("User not found for maNhanVien:", maNhanVien);
      process.exit(1);
    }

    authService.updateUser(user.id, { boPhan });
    const updated = authService.getUserById(user.id);
    console.log("Updated user:", {
      id: updated?.id,
      maNhanVien: updated?.ma_nhan_vien,
      hoTen: updated?.ho_ten,
      email: updated?.email,
      boPhan: updated?.bo_phan,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    process.exit(1);
  }
}

main();

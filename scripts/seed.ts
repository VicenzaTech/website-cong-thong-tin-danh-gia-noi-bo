import {
  users as mockUsers,
  phongBans as mockPhongBans,
  kyDanhGias as mockKyDanhGias,
  bieuMaus as mockBieuMaus,
  cauHois as mockCauHois,
  danhGias as mockDanhGias,
  cauTraLois as mockCauTraLois,
} from "../src/_mock/db";
import { database } from "../src/libs/database.server";

console.log("🌱 Starting database seed...");

try {
  database.seed({
    users: mockUsers,
    phongBans: mockPhongBans,
    kyDanhGias: mockKyDanhGias,
    bieuMaus: mockBieuMaus,
    cauHois: mockCauHois,
    danhGias: mockDanhGias,
    cauTraLois: mockCauTraLois,
  });

  console.log("✅ Database seeded successfully!");
  console.log(`   - Users: ${mockUsers.length}`);
  console.log(`   - Phong Bans: ${mockPhongBans.length}`);
  console.log(`   - Ky Danh Gias: ${mockKyDanhGias.length}`);
  console.log(`   - Bieu Maus: ${mockBieuMaus.length}`);
  console.log(`   - Cau Hois: ${mockCauHois.length}`);
  console.log(`   - Danh Gias: ${mockDanhGias.length}`);
  console.log(`   - Cau Tra Lois: ${mockCauTraLois.length}`);
} catch (error) {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
}


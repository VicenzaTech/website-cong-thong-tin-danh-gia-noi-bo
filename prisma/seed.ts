import { prisma } from "../src/libs/prisma";
import {
  phongBans,
  users,
  kyDanhGias,
  bieuMaus,
  cauHois,
} from "../src/_mock/db";

async function main() {
  console.log("Starting seed...");

  // Clear existing data in correct order (respect foreign key constraints)
  console.log("Clearing existing data...");
  await prisma.cauTraLoi.deleteMany();
  await prisma.danhGia.deleteMany();
  await prisma.cauHoi.deleteMany();
  await prisma.bieuMau.deleteMany();
  await prisma.kyDanhGia.deleteMany();
  await prisma.lichSuThayDoi.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.phongBan.deleteMany();

  console.log("Seeding Phong Ban (without truongPhongId)...");
  for (const pb of phongBans) {
    await prisma.phongBan.create({
      data: {
        id: pb.id,
        tenPhongBan: pb.tenPhongBan,
        moTa: pb.moTa,
        createdAt: pb.createdAt,
        updatedAt: pb.updatedAt,
      },
    });
  }
  console.log(`✓ Created ${phongBans.length} phong ban`);

  console.log("Seeding Users...");
  for (const user of users) {
    await prisma.user.create({
      data: {
        id: user.id,
        maNhanVien: user.maNhanVien,
        hoTen: user.hoTen,
        email: user.email,
        matKhau: user.matKhau,
        role: user.role,
        phongBanId: user.phongBanId,
        daDangKy: user.daDangKy,
        trangThaiKH: user.trangThaiKH,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  }
  console.log(`✓ Created ${users.length} users`);

  console.log("Seeding Ky Danh Gia...");
  for (const ky of kyDanhGias) {
    await prisma.kyDanhGia.create({
      data: {
        id: ky.id,
        tenKy: ky.tenKy,
        moTa: ky.moTa,
        ngayBatDau: ky.ngayBatDau,
        ngayKetThuc: ky.ngayKetThuc,
        dangMo: ky.dangMo,
        createdAt: ky.createdAt,
        updatedAt: ky.updatedAt,
      },
    });
  }
  console.log(`✓ Created ${kyDanhGias.length} ky danh gia`);

  console.log("Seeding Bieu Mau...");
  for (const bm of bieuMaus) {
    await prisma.bieuMau.create({
      data: {
        id: bm.id,
        tenBieuMau: bm.tenBieuMau,
        loaiDanhGia: bm.loaiDanhGia,
        phamViApDung: bm.phamViApDung,
        trangThai: bm.trangThai,
        moTa: bm.moTa,
        nguoiTaoId: bm.nguoiTaoId,
        ngayPhatHanh: bm.ngayPhatHanh,
        createdAt: bm.createdAt,
        updatedAt: bm.updatedAt,
      },
    });
  }
  console.log(`✓ Created ${bieuMaus.length} bieu mau`);

  console.log("Seeding Cau Hoi...");
  for (const ch of cauHois) {
    await prisma.cauHoi.create({
      data: {
        id: ch.id,
        bieuMauId: ch.bieuMauId,
        noiDung: ch.noiDung,
        thuTu: ch.thuTu,
        diemToiDa: ch.diemToiDa,
        batBuoc: ch.batBuoc,
        createdAt: ch.createdAt,
        updatedAt: ch.updatedAt,
      },
    });
  }
  console.log(`✓ Created ${cauHois.length} cau hoi`);

  console.log("Updating Phong Ban with truongPhongId...");
  for (const pb of phongBans) {
    if (pb.truongPhongId) {
      await prisma.phongBan.update({
        where: { id: pb.id },
        data: { truongPhongId: pb.truongPhongId },
      });
    }
  }
  console.log("✓ Updated phong ban with truong phong");

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


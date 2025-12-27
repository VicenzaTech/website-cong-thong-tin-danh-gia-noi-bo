import Database from "better-sqlite3";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";

const DB_PATH = path.join(process.cwd(), "data", "app.db");
const EVALUATIONS_DIR = path.join(process.cwd(), "data", "evaluations");

interface User {
  id: string;
  ma_nhan_vien: string;
  ho_ten: string | null;
  role: string;
  phong_ban_id: string;
  trang_thai_kh: number;
  deleted_at: string | null;
}

interface PhongBan {
  id: string;
  ten_phong_ban: string;
  deleted_at: string | null;
}

interface KyDanhGia {
  id: string;
  ten_ky: string;
  ngay_bat_dau: string;
  ngay_ket_thuc: string;
  dang_mo: number;
}

interface BieuMau {
  id: string;
  ten_bieu_mau: string;
  loai_danh_gia: string; // "LANH_DAO" | "NHAN_VIEN"
  pham_vi_ap_dung: string;
  phong_ban_id: string | null;
  trang_thai: string;
  deleted_at: string | null;
}

interface CauHoi {
  id: string;
  bieu_mau_id: string;
  noi_dung: string;
  thu_tu: number;
  diem_toi_da: number;
  bat_buoc: number;
}

interface EvaluationPayload {
  danhGia: {
    id: string;
    nguoiDanhGiaId: string;
    nguoiDuocDanhGiaId: string;
    bieuMauId: string;
    kyDanhGiaId: string;
    nhanXetChung: string;
    tongDiem: number;
    diemTrungBinh: number;
    daHoanThanh: boolean;
    submittedAt: string;
    createdAt: string;
    updatedAt: string;
  };
  answers: Array<{
    cauHoiId: string;
    diem: number;
    nhanXet?: string;
  }>;
  meta: {
    nguoiDanhGiaId: string;
    nguoiDuocDanhGiaId: string;
    phongBanId: string;
    bieuMauId: string;
    kyDanhGiaId: string;
    savedAt: string;
  };
}

// Sample comments for evaluations
const NHAN_XET_MO_TAU = [
  "Rất tốt, hoàn thành xuất sắc nhiệm vụ được giao",
  "Tốt, thực hiện đầy đủ các yêu cầu công việc",
  "Đạt yêu cầu, cần cải thiện thêm một số mặt",
  "Cần nỗ lực nhiều hơn để đáp ứng yêu cầu công việc",
  "Cần hỗ trợ và hướng dẫn thêm để hoàn thành tốt công việc",
];

const NHAN_XET_CHUNG_MO_TAU = [
  "Nhân viên có tinh thần trách nhiệm cao, hoàn thành tốt các công việc được giao. Cần tiếp tục phát huy và cải thiện thêm.",
  "Thực hiện tốt nhiệm vụ, có khả năng làm việc độc lập. Cần trau dồi thêm kỹ năng chuyên môn.",
  "Có tiến bộ trong công việc, cần cố gắng nhiều hơn để đạt hiệu quả cao hơn.",
  "Cần nỗ lực và tập trung hơn vào công việc để đáp ứng yêu cầu.",
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomScore(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random date between two dates
function randomDateBetween(start: Date, end: Date): Date {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime);
}

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    // ignore
  }
}

function getEvaluationFileName(payload: EvaluationPayload): string {
  const meta = payload.meta;
  return `danhgia_${meta.nguoiDanhGiaId}_${meta.nguoiDuocDanhGiaId}_${meta.bieuMauId}_${meta.kyDanhGiaId}.json`;
}

async function writeEvaluationFile(payload: EvaluationPayload) {
  const phongBanId = payload.meta.phongBanId;
  const dir = path.join(EVALUATIONS_DIR, phongBanId);
  await ensureDir(dir);
  const fileName = getEvaluationFileName(payload);
  const filePath = path.join(dir, fileName);
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf-8");
  return filePath;
}

async function main() {
  console.log("🚀 Bắt đầu tạo fake data đánh giá...\n");

  // Connect to database
  if (!fsSync.existsSync(DB_PATH)) {
    console.error(`❌ Database không tồn tại tại: ${DB_PATH}`);
    console.error("   Vui lòng chạy 'npm run init-db' trước!");
    process.exit(1);
  }

  const db = new Database(DB_PATH);

  try {
    // Query active users (excluding deleted)
    const users = db
      .prepare(
        `SELECT id, ma_nhan_vien, ho_ten, role, phong_ban_id, trang_thai_kh, deleted_at 
         FROM users 
         WHERE deleted_at IS NULL AND trang_thai_kh = 1`
      )
      .all() as User[];

    console.log(`📊 Tìm thấy ${users.length} người dùng đang hoạt động`);

    // Query departments
    const phongBans = db
      .prepare(
        `SELECT id, ten_phong_ban, deleted_at 
         FROM phong_bans 
         WHERE deleted_at IS NULL`
      )
      .all() as PhongBan[];

    console.log(`📁 Tìm thấy ${phongBans.length} phòng ban`);

    // Query evaluation periods
    const kyDanhGias = db
      .prepare(
        `SELECT id, ten_ky, ngay_bat_dau, ngay_ket_thuc, dang_mo 
         FROM ky_danh_gia`
      )
      .all() as KyDanhGia[];

    console.log(`📅 Tìm thấy ${kyDanhGias.length} kỳ đánh giá`);

    // Query active forms
    const bieuMaus = db
      .prepare(
        `SELECT id, ten_bieu_mau, loai_danh_gia, pham_vi_ap_dung, phong_ban_id, trang_thai, deleted_at 
         FROM bieu_mau 
         WHERE deleted_at IS NULL AND trang_thai = 'KICH_HOAT'`
      )
      .all() as BieuMau[];

    console.log(`📝 Tìm thấy ${bieuMaus.length} biểu mẫu đang kích hoạt`);

    // Query questions grouped by form
    const allCauHois = db
      .prepare(
        `SELECT id, bieu_mau_id, noi_dung, thu_tu, diem_toi_da, bat_buoc 
         FROM cau_hoi 
         ORDER BY bieu_mau_id, thu_tu`
      )
      .all() as CauHoi[];

    console.log(`❓ Tìm thấy ${allCauHois.length} câu hỏi\n`);

    // Group questions by form
    const cauHoisByBieuMau = new Map<string, CauHoi[]>();
    for (const cauHoi of allCauHois) {
      if (!cauHoisByBieuMau.has(cauHoi.bieu_mau_id)) {
        cauHoisByBieuMau.set(cauHoi.bieu_mau_id, []);
      }
      cauHoisByBieuMau.get(cauHoi.bieu_mau_id)!.push(cauHoi);
    }

    // Ensure evaluations directory exists
    await ensureDir(EVALUATIONS_DIR);

    let totalEvaluations = 0;
    const evaluationsByDepartment = new Map<string, number>();

    // Generate evaluations for each evaluation period
    for (const kyDanhGia of kyDanhGias) {
      console.log(`\n📋 Xử lý kỳ đánh giá: ${kyDanhGia.ten_ky}`);

      const kyStartDate = new Date(kyDanhGia.ngay_bat_dau);
      const kyEndDate = new Date(kyDanhGia.ngay_ket_thuc);

      // For each active form
      for (const bieuMau of bieuMaus) {
        const cauHois = cauHoisByBieuMau.get(bieuMau.id) || [];
        if (cauHois.length === 0) {
          console.log(`  ⚠️  Biểu mẫu "${bieuMau.ten_bieu_mau}" không có câu hỏi, bỏ qua`);
          continue;
        }

        console.log(`  📄 Biểu mẫu: ${bieuMau.ten_bieu_mau} (${bieuMau.loai_danh_gia})`);

        // Filter users based on form scope and type
        let eligibleEvaluators: User[] = [];
        let eligibleEvaluatees: User[] = [];

        if (bieuMau.loai_danh_gia === "NHAN_VIEN") {
          // For NHAN_VIEN evaluations: employees evaluate other employees
          // Employees can evaluate colleagues in their department or other departments
          eligibleEvaluators = users.filter((u) => u.role === "nhan_vien");
          eligibleEvaluatees = users.filter((u) => u.role === "nhan_vien");

          // Limit: each employee evaluates 2-5 colleagues
          const evaluationsPerEvaluator = getRandomScore(2, 5);
          
          for (const evaluator of eligibleEvaluators) {
            // Get random evaluatees (excluding self)
            const candidates = eligibleEvaluatees.filter(
              (e) => e.id !== evaluator.id
            );
            
            const selectedEvaluatees = candidates
              .sort(() => Math.random() - 0.5)
              .slice(0, Math.min(evaluationsPerEvaluator, candidates.length));

            for (const evaluatee of selectedEvaluatees) {
              await generateEvaluation(
                evaluator,
                evaluatee,
                bieuMau,
                kyDanhGia,
                cauHois,
                kyStartDate,
                kyEndDate,
                evaluationsByDepartment
              );
              totalEvaluations++;
            }
          }
        } else if (bieuMau.loai_danh_gia === "LANH_DAO") {
          // For LANH_DAO evaluations: employees evaluate leaders/managers
          eligibleEvaluators = users.filter((u) => u.role === "nhan_vien");
          eligibleEvaluatees = users.filter(
            (u) => u.role === "truong_phong" || u.role === "admin"
          );

          // Each employee evaluates leaders in their department or related departments
          for (const evaluator of eligibleEvaluators) {
            // Find leaders that make sense to evaluate (e.g., in same department or related)
            const candidates = eligibleEvaluatees.filter((e) => {
              // Can evaluate leaders in same department or other departments
              return true; // Allow evaluating any leader for simplicity
            });

            // Each employee evaluates 1-3 leaders
            const numLeaders = getRandomScore(1, 3);
            const selectedLeaders = candidates
              .sort(() => Math.random() - 0.5)
              .slice(0, Math.min(numLeaders, candidates.length));

            for (const leader of selectedLeaders) {
              await generateEvaluation(
                evaluator,
                leader,
                bieuMau,
                kyDanhGia,
                cauHois,
                kyStartDate,
                kyEndDate,
                evaluationsByDepartment
              );
              totalEvaluations++;
            }
          }
        }
      }
    }

    console.log(`\n\n✅ Hoàn thành! Đã tạo ${totalEvaluations} đánh giá`);
    console.log("\n📊 Thống kê theo phòng ban:");
    for (const [phongBanId, count] of evaluationsByDepartment.entries()) {
      const pb = phongBans.find((p) => p.id === phongBanId);
      console.log(`  - ${pb?.ten_phong_ban || phongBanId}: ${count} đánh giá`);
    }
    console.log(`\n💾 Dữ liệu được lưu tại: ${EVALUATIONS_DIR}\n`);
  } catch (error) {
    console.error("❌ Lỗi khi tạo fake data:", error);
    process.exit(1);
  } finally {
    db.close();
  }
}

async function generateEvaluation(
  evaluator: User,
  evaluatee: User,
  bieuMau: BieuMau,
  kyDanhGia: KyDanhGia,
  cauHois: CauHoi[],
  kyStartDate: Date,
  kyEndDate: Date,
  evaluationsByDepartment: Map<string, number>
) {
  // Generate random submission date within the evaluation period
  const submittedAt = randomDateBetween(kyStartDate, kyEndDate);
  const createdAt = new Date(submittedAt.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Created 0-7 days before submission

  // Generate answers for each question
  const answers: Array<{ cauHoiId: string; diem: number; nhanXet?: string }> = [];
  
  for (const cauHoi of cauHois) {
    let diem = 0;
    if (cauHoi.diem_toi_da > 0) {
      // Generate score between 3-5 (generally positive scores)
      diem = getRandomScore(3, cauHoi.diem_toi_da);
    } else {
      // For non-scoring questions, use 0 or 1 (depending on business logic)
      diem = Math.random() > 0.1 ? 0 : 1; // 90% chance of 0, 10% chance of 1
    }

    const nhanXet = cauHoi.diem_toi_da > 0 ? getRandomElement(NHAN_XET_MO_TAU) : undefined;

    answers.push({
      cauHoiId: cauHoi.id,
      diem,
      nhanXet,
    });
  }

  // Calculate scores (following the same logic as submit route)
  const scoringAnswers = answers.filter((a) => a.diem > 0);
  const tongDiem = scoringAnswers.reduce((sum, a) => sum + (a.diem || 0), 0);
  const diemTrungBinh = scoringAnswers.length > 0 ? tongDiem / scoringAnswers.length : 0;

  // Check for khongXetThiDua (if any non-scoring question has diem === 1)
  const khongXetThiDua = cauHois.some(
    (ch) => ch.diem_toi_da === 0 && answers.find((a) => a.cauHoiId === ch.id && a.diem === 1)
  );

  const danhGiaId = `dg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const payload: EvaluationPayload = {
    danhGia: {
      id: danhGiaId,
      nguoiDanhGiaId: evaluator.id,
      nguoiDuocDanhGiaId: evaluatee.id,
      bieuMauId: bieuMau.id,
      kyDanhGiaId: kyDanhGia.id,
      nhanXetChung: getRandomElement(NHAN_XET_CHUNG_MO_TAU),
      tongDiem,
      diemTrungBinh: khongXetThiDua ? 0 : diemTrungBinh,
      daHoanThanh: true,
      submittedAt: submittedAt.toISOString(),
      createdAt: createdAt.toISOString(),
      updatedAt: submittedAt.toISOString(),
    },
    answers,
    meta: {
      nguoiDanhGiaId: evaluator.id,
      nguoiDuocDanhGiaId: evaluatee.id,
      phongBanId: evaluatee.phong_ban_id, // Save in the evaluated person's department folder
      bieuMauId: bieuMau.id,
      kyDanhGiaId: kyDanhGia.id,
      savedAt: new Date().toISOString(),
    },
  };

  await writeEvaluationFile(payload);

  // Track by department
  const currentCount = evaluationsByDepartment.get(evaluatee.phong_ban_id) || 0;
  evaluationsByDepartment.set(evaluatee.phong_ban_id, currentCount + 1);
}

// Run the script
main().catch((error) => {
  console.error("❌ Lỗi không mong đợi:", error);
  process.exit(1);
});

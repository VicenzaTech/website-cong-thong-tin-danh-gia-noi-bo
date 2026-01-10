import { sqliteDb } from '@/libs/sqlite.server';

const ma = process.argv[2] || 'NV363636';
const db = sqliteDb.get();
try {
  const row = db.prepare('SELECT id, ma_nhan_vien, ho_ten, email, phong_ban_id, bo_phan, created_at FROM users WHERE ma_nhan_vien = ? LIMIT 1').get(ma);
  if (row) {
    console.log('Found user:', row);
    process.exit(0);
  } else {
    console.log('User not found for maNhanVien =', ma);
    process.exit(0);
  }
} catch (err) {
  console.error('Error querying DB:', err);
  process.exit(2);
}

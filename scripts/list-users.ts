import { sqliteDb } from "@/libs/sqlite.server";

function printRecent() {
  const db = sqliteDb.get();
  const path = require('path').join(process.cwd(), 'data', 'app.db');
  console.log('DB file:', path);
  try {
    const countRow = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number } | undefined;
    console.log('Users count:', countRow?.c ?? 'N/A');

    const rows = db.prepare('SELECT id, ma_nhan_vien, ho_ten, email, phong_ban_id, bo_phan, created_at FROM users ORDER BY created_at DESC LIMIT 20').all();
    console.log('Recent users:');
    for (const r of rows) {
      console.log(r);
    }
  } catch (err) {
    console.error('Error reading DB:', err);
    process.exit(1);
  }
}

printRecent();

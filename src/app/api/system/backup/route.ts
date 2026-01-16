import { NextResponse } from "next/server";
import { sqliteDb } from "@/libs/sqlite.server";
import path from "path";
import fs from "fs";
import { promisify } from "util";

// Ensure backups directory exists
const BACKUP_DIR = path.join(process.cwd(), "data", "backups");
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export async function GET() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup-${timestamp}.db`;
    const backupPath = path.join(BACKUP_DIR, filename);

    try {
        console.log(`Starting backup to ${backupPath}...`);
        await sqliteDb.backup(backupPath);
        console.log("Backup completed successfully.");

        const fileBuffer = await fs.promises.readFile(backupPath);

        // Clean up file after reading into memory (for small DBs this is fine)
        // For very large DBs, streaming would be better, but simple buffering is robust for typical use.
        await fs.promises.unlink(backupPath).catch(e => console.error("Failed to delete temp backup:", e));

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": "application/x-sqlite3",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("Backup error:", error);
        return NextResponse.json(
            { error: "Failed to create backup" },
            { status: 500 }
        );
    }
}

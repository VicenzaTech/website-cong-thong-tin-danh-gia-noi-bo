import { sqliteDb } from "../src/libs/sqlite.server";
import path from "path";
import fs from "fs";

async function testBackup() {
    const backupPath = path.join(process.cwd(), "backup-test.db");
    console.log("Testing backup to:", backupPath);

    try {
        await sqliteDb.backup(backupPath);
        if (fs.existsSync(backupPath)) {
            const stats = fs.statSync(backupPath);
            console.log(`Backup created successfully. Size: ${stats.size} bytes`);
            fs.unlinkSync(backupPath); // Cleanup
            console.log("Test passed!");
        } else {
            console.error("Backup file was not created.");
            process.exit(1);
        }
    } catch (error) {
        console.error("Backup failed:", error);
        process.exit(1);
    }
}

testBackup();

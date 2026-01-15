
import { NextResponse } from "next/server";
import { authService, sqliteDb } from "@/libs/sqlite.server";
import { users as mockUsers, phongBans as mockPhongBans } from "@/_mock/db";

export async function GET(request: Request) {
    try {
        // 1. Drop tables and re-create schema
        if (sqliteDb.reset) {
            sqliteDb.reset();
        } else {
            throw new Error("sqliteDb.reset is not defined");
        }

        // 2. Re-populate data from mock
        await authService.initializeFromMockData(mockUsers, mockPhongBans as any);

        return NextResponse.json({ success: true, message: "Database reset and re-seeded successfully." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 200 });
    }
}

import { NextResponse } from "next/server";
import { authService, sqliteDb } from "@/libs/sqlite.server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/users/[id] - Get user by ID
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const db = sqliteDb.get();
        const row = db
            .prepare(`SELECT * FROM users WHERE id = ? AND deleted_at IS NULL`)
            .get(id) as any;

        if (!row) {
            return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                id: row.id,
                maNhanVien: row.ma_nhan_vien,
                hoTen: row.ho_ten,
                email: row.email,
                role: row.role,
                phongBanId: row.phong_ban_id,
                boPhan: row.bo_phan,
                daDangKy: row.da_dang_ky === 1,
                trangThaiKH: row.trang_thai_kh === 1,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            },
        });
    } catch (error) {
        console.error("Get user error:", error);
        return NextResponse.json(
            { error: "Lỗi khi lấy thông tin người dùng" },
            { status: 500 }
        );
    }
}

// PUT /api/users/[id] - Update user
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { hoTen, email, phongBanId, boPhan, role, trangThaiKH } = body;

        // Check if user exists
        const existingUser = authService.getUserById(id);
        if (!existingUser) {
            return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
        }

        // Build update data object
        const updateData: {
            hoTen?: string;
            email?: string;
            phongBanId?: string;
            boPhan?: string;
            role?: string;
            trangThaiKH?: boolean;
        } = {};

        if (hoTen !== undefined) updateData.hoTen = hoTen;
        if (email !== undefined) updateData.email = email;
        if (phongBanId !== undefined) updateData.phongBanId = phongBanId;
        if (boPhan !== undefined) updateData.boPhan = boPhan;
        if (role !== undefined) updateData.role = role;
        if (trangThaiKH !== undefined) updateData.trangThaiKH = trangThaiKH;

        // Update user
        authService.updateUser(id, updateData);

        // Get updated user
        const updatedUser = authService.getUserById(id);
        if (!updatedUser) {
            return NextResponse.json({ error: "Lỗi khi lấy thông tin sau cập nhật" }, { status: 500 });
        }

        return NextResponse.json({
            user: {
                id: updatedUser.id,
                maNhanVien: updatedUser.ma_nhan_vien,
                hoTen: updatedUser.ho_ten,
                email: updatedUser.email,
                role: updatedUser.role,
                phongBanId: updatedUser.phong_ban_id,
                boPhan: updatedUser.bo_phan,
                daDangKy: updatedUser.da_dang_ky === 1,
                trangThaiKH: updatedUser.trang_thai_kh === 1,
                createdAt: updatedUser.created_at,
                updatedAt: updatedUser.updated_at,
            },
        });
    } catch (error) {
        console.error("Update user error:", error);
        return NextResponse.json(
            { error: "Lỗi khi cập nhật người dùng", details: (error && (error as any).message) || String(error) },
            { status: 500 }
        );
    }
}

// DELETE /api/users/[id] - Soft delete user
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Check if user exists
        const existingUser = authService.getUserById(id);
        if (!existingUser) {
            return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
        }

        // Soft delete
        const db = sqliteDb.get();
        const now = new Date().toISOString();
        db.prepare(`UPDATE users SET deleted_at = ?, updated_at = ? WHERE id = ?`).run(now, now, id);

        return NextResponse.json({ success: true, message: "Đã xóa người dùng" });
    } catch (error) {
        console.error("Delete user error:", error);
        return NextResponse.json(
            { error: "Lỗi khi xóa người dùng" },
            { status: 500 }
        );
    }
}

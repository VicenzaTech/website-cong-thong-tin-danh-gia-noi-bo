import { NextResponse } from "next/server";
import { authService } from "@/libs/sqlite.server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, newPassword, adminKey } = body;

        // Validate userId
        if (!userId || typeof userId !== 'string') {
            return NextResponse.json(
                { error: "ID người dùng không hợp lệ" },
                { status: 400 }
            );
        }

        // Validate newPassword
        if (!newPassword || typeof newPassword !== 'string') {
            return NextResponse.json(
                { error: "Vui lòng nhập mật khẩu mới" },
                { status: 400 }
            );
        }

        // Verify Admin Key
        if (!adminKey || typeof adminKey !== 'string') {
            return NextResponse.json(
                { error: "Yêu cầu Admin Key để thực hiện thao tác này" },
                { status: 403 }
            );
        }

        const envAdminKey = process.env.ADMIN_SECRET_KEY;
        if (!envAdminKey) {
            console.error("ADMIN_SECRET_KEY not set in environment variables");
            return NextResponse.json(
                { error: "Lỗi cấu hình hệ thống: Admin Key chưa được thiết lập" },
                { status: 500 }
            );
        }

        if (adminKey !== envAdminKey) {
            return NextResponse.json(
                { error: "Admin Key không chính xác" },
                { status: 403 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: "Mật khẩu mới phải có ít nhất 6 ký tự" },
                { status: 400 }
            );
        }

        // Verify user exists before attempting password change
        const existingUser = authService.getUserById(userId);
        if (!existingUser) {
            return NextResponse.json(
                { error: "Không tìm thấy người dùng" },
                { status: 404 }
            );
        }

        // Force change password (bypass current password check)
        const result = await authService.changePassword(
            userId,
            "",         // No current password needed
            newPassword,
            true        // Force change = true
        );

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        const user = authService.getUserById(userId);
        if (!user) {
            return NextResponse.json(
                { error: "Không tìm thấy người dùng" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Reset mật khẩu thành công"
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { error: "Đã xảy ra lỗi khi reset mật khẩu" },
            { status: 500 }
        );
    }
}

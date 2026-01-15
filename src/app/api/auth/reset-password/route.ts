import { NextResponse } from "next/server";
import { authService } from "@/libs/sqlite.server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, newPassword } = body;

        // Validate userId
        if (!userId || typeof userId !== 'string') {
            return NextResponse.json(
                { error: "ID người dùng không hợp lệ" },
                { status: 400 }
            );
        }

        // Verify user exists
        const existingUser = authService.getUserById(userId);
        if (!existingUser) {
            return NextResponse.json(
                { error: "Không tìm thấy người dùng" },
                { status: 404 }
            );
        }

        // Default password to 123456 if not provided
        const passwordToSet = newPassword || "123456";

        const result = await authService.changePassword(
            userId,
            "", // currentPassword not needed for force change
            passwordToSet,
            true // forceChange
        );

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Đã đặt lại mật khẩu cho người dùng ${existingUser.ho_ten} thành công`
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { error: "Đã xảy ra lỗi khi đặt lại mật khẩu" },
            { status: 500 }
        );
    }
}

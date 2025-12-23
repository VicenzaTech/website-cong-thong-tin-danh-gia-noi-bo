import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/libs/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@/types/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      credentials: {
        maNhanVien: { label: "Mã nhân viên", type: "text" },
        matKhau: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.maNhanVien || !credentials?.matKhau) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            maNhanVien: String(credentials.maNhanVien),
            deletedAt: null,
          },
          include: {
            phongBan: true,
          },
        });

        if (!user || user.trangThaiKH !== true || !user.matKhau) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          String(credentials.matKhau),
          user.matKhau
        );

        if (!isPasswordValid) {
          return null;
        }

        // Update lastLoginAt with error handling
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });
        } catch (error) {
          // Log error but don't block authentication
          console.error("Failed to update lastLoginAt:", error);
        }

        return {
          id: user.id,
          maNhanVien: user.maNhanVien,
          hoTen: user.hoTen,
          email: user.email,
          role: user.role as Role,
          phongBanId: user.phongBanId,
          phongBanName: user.phongBan?.tenPhongBan || "N/A",
          daDangKy: user.daDangKy,
          trangThaiKH: user.trangThaiKH,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.maNhanVien = (user as any).maNhanVien;
        token.hoTen = (user as any).hoTen;
        token.role = (user as any).role;
        token.phongBanId = (user as any).phongBanId;
        token.phongBanName = (user as any).phongBanName;
        token.daDangKy = (user as any).daDangKy;
        token.trangThaiKH = (user as any).trangThaiKH;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.maNhanVien = token.maNhanVien as string;
        session.user.hoTen = token.hoTen as string | null;
        session.user.role = token.role as Role;
        session.user.phongBanId = token.phongBanId as string;
        session.user.phongBanName = token.phongBanName as string;
        session.user.daDangKy = token.daDangKy as boolean;
        session.user.trangThaiKH = token.trangThaiKH as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
});

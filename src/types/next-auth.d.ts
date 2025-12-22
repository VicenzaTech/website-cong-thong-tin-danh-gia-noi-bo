import { DefaultSession, DefaultUser } from "next-auth";
import { Role } from "@/types/schema";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      maNhanVien: string;
      hoTen: string | null;
      role: Role;
      phongBanId: string;
      phongBanName: string;
      daDangKy: boolean;
      trangThaiKH: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    maNhanVien: string;
    hoTen: string | null;
    role: Role;
    phongBanId: string;
    phongBanName: string;
    daDangKy: boolean;
    trangThaiKH: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    maNhanVien: string;
    hoTen: string | null;
    role: Role;
    phongBanId: string;
    phongBanName: string;
    daDangKy: boolean;
    trangThaiKH: boolean;
  }
}


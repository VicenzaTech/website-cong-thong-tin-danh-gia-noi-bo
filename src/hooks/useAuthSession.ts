"use client";

import { useSession } from "next-auth/react";
import { Role } from "@/types/schema";

export function useAuthSession() {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const user = session?.user || null;

  const checkPermission = (allowedRoles: Role[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const isAdmin = user?.role === Role.admin;
  const isTruongPhong = user?.role === Role.truong_phong;
  const isNhanVien = user?.role === Role.nhan_vien;

  return {
    user,
    isLoading,
    isAuthenticated,
    session,
    checkPermission,
    isAdmin,
    isTruongPhong,
    isNhanVien,
  };
}


"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Role, type User } from "@/types/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  checkPermission: (allowedRoles: Role[]) => boolean;
  isAdmin: boolean;
  isTruongPhong: boolean;
  isNhanVien: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Auto-update user if missing boPhan
  useEffect(() => {
    if (user && !user.boPhan && user.maNhanVien) {
      fetch(`/api/users?maNhanVien=${encodeURIComponent(user.maNhanVien)}&perPage=1`)
        .then(res => res.json())
        .then(data => {
          if (data.items && data.items.length > 0) {
            const updatedUser = { ...user, ...data.items[0] };
            setUser(updatedUser);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
          }
        })
        .catch(error => {
          console.error("Failed to fetch updated user info:", error);
        });
    }
  }, [user]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
  };

  const checkPermission = (allowedRoles: Role[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const isAdmin = user?.role === Role.admin;
  const isTruongPhong = user?.role === Role.truong_phong;
  const isNhanVien = user?.role === Role.nhan_vien;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        updateUser,
        checkPermission,
        isAdmin,
        isTruongPhong,
        isNhanVien,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}


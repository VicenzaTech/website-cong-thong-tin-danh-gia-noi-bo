"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Role, type User } from "@/types/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  checkPermission: (allowedRoles: Role[]) => boolean;
  canPerformEvaluation: boolean;
  isAdmin: boolean;
  isTruongPhong: boolean;
  isNhanVien: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "auth_user";

// Helper function to normalize role string to Role enum
const normalizeRole = (role: string | Role): Role => {
  if (typeof role === 'string') {
    switch (role) {
      case 'admin':
        return Role.admin;
      case 'truong_phong':
        return Role.truong_phong;
      case 'nhan_vien':
        return Role.nhan_vien;
      default:
        return Role.nhan_vien;
    }
  }
  return role;
};

// Helper function to clear all auth-related storage
const clearAllAuthStorage = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem("pending_user");
  localStorage.removeItem("force_password_change");
  // Clear any evaluation-related storage that might contain user info
  sessionStorage.clear();
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Normalize role to ensure it's a proper Role enum value
        parsedUser.role = normalizeRole(parsedUser.role);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        clearAllAuthStorage();
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
            const updatedUser = { 
              ...user, 
              ...data.items[0],
              role: normalizeRole(data.items[0].role || user.role),
            };
            setUser(updatedUser);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
          }
        })
        .catch(error => {
          console.error("Failed to fetch updated user info:", error);
        });
    }
  }, [user]);

  const login = useCallback((userData: User) => {
    // Clear any pending auth data before setting new user
    localStorage.removeItem("pending_user");
    localStorage.removeItem("force_password_change");
    
    // Normalize role to ensure proper enum value
    const normalizedUser = {
      ...userData,
      role: normalizeRole(userData.role),
    };
    setUser(normalizedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalizedUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearAllAuthStorage();
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { 
      ...user, 
      ...userData,
      role: userData.role ? normalizeRole(userData.role) : user.role,
    };
    setUser(updatedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
  }, [user]);

  const checkPermission = (allowedRoles: Role[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const isAdmin = user?.role === Role.admin;
  const isTruongPhong = user?.role === Role.truong_phong;
  const isNhanVien = user?.role === Role.nhan_vien;
  const canPerformEvaluation = user?.boPhan !== "Bộ phận lãnh đạo";

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        updateUser,
        checkPermission,
        canPerformEvaluation,
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


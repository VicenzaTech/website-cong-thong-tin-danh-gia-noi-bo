import { database } from "./database.server";

export const passwordStorage = {
  savePassword: (userId: string, _maNhanVien: string, matKhau: string, matKhauCu?: string, daDoiMatKhau: boolean = false) => {
    database.users.update(userId, {
      matKhau,
      matKhauCu,
      daDoiMatKhau,
    });
  },

  getPassword: (userId: string): { matKhau: string; matKhauCu?: string; daDoiMatKhau: boolean } | null => {
    const user = database.users.getById(userId);
    if (!user || !user.matKhau) return null;

    return {
      matKhau: user.matKhau,
      matKhauCu: user.matKhauCu,
      daDoiMatKhau: user.daDoiMatKhau || false,
    };
  },

  getPasswordByMaNhanVien: (maNhanVien: string): { userId: string; matKhau: string; matKhauCu?: string; daDoiMatKhau: boolean } | null => {
    const user = database.users.getByMaNhanVien(maNhanVien);
    if (!user || !user.matKhau) return null;

    return {
      userId: user.id,
      matKhau: user.matKhau,
      matKhauCu: user.matKhauCu,
      daDoiMatKhau: user.daDoiMatKhau || false,
    };
  },

  deletePassword: (userId: string) => {
    database.users.update(userId, {
      matKhau: undefined,
      matKhauCu: undefined,
      daDoiMatKhau: false,
    });
  },

  initializePasswords: (_users: Array<{ id: string; maNhanVien: string; matKhau?: string; daDoiMatKhau?: boolean }>) => {
    // No longer needed - passwords are stored directly in users table
  },
};


// Client-safe auth API wrapper
// This file can be imported in both client and server

export interface AuthUser {
  id: string;
  maNhanVien: string;
  hoTen?: string;
  email?: string;
  role: string;
  phongBanId: string;
  daDangKy: boolean;
  trangThaiKH: boolean;
  daDoiMatKhau: boolean;
  hasPassword?: boolean;
  matKhau?: string;
  matKhauCu?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export const authApi = {
  async checkUser(maNhanVien: string): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maNhanVien }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Lỗi kiểm tra người dùng' };
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Check user error:', error);
      return { success: false, error: 'Không thể kết nối đến server' };
    }
  },

  async login(maNhanVien: string, matKhau: string): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maNhanVien, matKhau }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Đăng nhập thất bại' };
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Không thể kết nối đến server' };
    }
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Không thể đổi mật khẩu' };
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: 'Không thể kết nối đến server' };
    }
  },
};


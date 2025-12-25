"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Container,
  Title,
  Text,
  Paper,
  Stack,
  PasswordInput,
  Button,
  Alert,
  Center,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useAuth } from "@/features/auth/AuthContext";
import { mockService } from "@/services/mockService";
import type { User } from "@/types/schema";

export default function DoiMatKhauBatBuocPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("force_password_change");
    if (!storedUser) {
      if (!authLoading && !user) {
        router.push("/login");
      } else if (user?.daDoiMatKhau) {
        router.push("/");
      }
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setPendingUser(userData);
    } catch (err) {
      console.error("Failed to parse pending user:", err);
      router.push("/login");
    }
  }, [router, user, authLoading]);

  const form = useForm({
    initialValues: {
      matKhauHienTai: "",
      matKhauMoi: "",
      xacNhanMatKhauMoi: "",
    },
    validate: {
      matKhauHienTai: (value) => (!value ? "Vui lòng nhập mật khẩu hiện tại" : null),
      matKhauMoi: (value) => {
        if (!value) return "Vui lòng nhập mật khẩu mới";
        if (value.length < 6) return "Mật khẩu mới phải có ít nhất 6 ký tự";
        return null;
      },
      xacNhanMatKhauMoi: (value, values) => {
        if (!value) return "Vui lòng xác nhận mật khẩu mới";
        if (value !== values.matKhauMoi) return "Mật khẩu xác nhận không khớp";
        return null;
      },
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!pendingUser) {
      setError("Không tìm thấy thông tin người dùng");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const currentUser = await mockService.users.getById(pendingUser.id);
      if (!currentUser) {
        setError("Không tìm thấy thông tin người dùng");
        setIsLoading(false);
        return;
      }

      if (currentUser.matKhau !== values.matKhauHienTai) {
        setError("Mật khẩu hiện tại không chính xác");
        setIsLoading(false);
        return;
      }

      if (values.matKhauMoi === values.matKhauHienTai) {
        setError("Mật khẩu mới không được trùng với mật khẩu cũ");
        setIsLoading(false);
        return;
      }

      const updatedUser = await mockService.users.update(pendingUser.id, {
        matKhau: values.matKhauMoi,
        matKhauCu: currentUser.matKhau,
        daDoiMatKhau: true,
      });

      if (!updatedUser) {
        setError("Không thể cập nhật mật khẩu. Vui lòng thử lại");
        setIsLoading(false);
        return;
      }

      localStorage.removeItem("force_password_change");
      updateUser({ 
        matKhau: updatedUser.matKhau,
        matKhauCu: updatedUser.matKhauCu,
        daDoiMatKhau: true 
      });

      notifications.show({
        title: "Thành công",
        message: "Đổi mật khẩu thành công. Chào mừng bạn đến với hệ thống!",
        color: "green",
      });

      router.push("/");
    } catch (err) {
      console.error("Change password error:", err);
      setError("Đã xảy ra lỗi. Vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  if (!pendingUser) {
    return null;
  }

  return (
    <Box
      style={{
        minHeight: "100vh",
        backgroundImage: "url(/company.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 1,
        }}
      />
      <Container size={500} style={{ position: "relative", zIndex: 2 }} my={40}>
        <Paper withBorder shadow="xl" p={30} radius="md" bg="rgba(255, 255, 255, 0.95)">
          <Stack gap="md">
            <Center mb="md">
              <Image
                src="/logo-vicenza.png"
                alt="Vicenza Logo"
                width={120}
                height={120}
                priority
              />
            </Center>
            
            <Title ta="center" mb="xs">
              Đổi mật khẩu bắt buộc
            </Title>
            <Text c="dimmed" size="sm" ta="center" mb="lg">
              Để bảo mật tài khoản, bạn cần đổi mật khẩu mặc định trước khi tiếp tục
            </Text>

            <Alert color="blue" title="Thông tin tài khoản" mb="md">
              <Text size="sm">
                <strong>Mã nhân viên:</strong> {pendingUser.maNhanVien}
              </Text>
              <Text size="sm">
                <strong>Họ tên:</strong> {pendingUser.hoTen || "Chưa cập nhật"}
              </Text>
            </Alert>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                {error && (
                  <Alert color="red" title="Lỗi">
                    {error}
                  </Alert>
                )}

                <PasswordInput
                  label="Mật khẩu hiện tại"
                  placeholder="Nhập mật khẩu hiện tại"
                  required
                  {...form.getInputProps("matKhauHienTai")}
                />

                <PasswordInput
                  label="Mật khẩu mới"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  required
                  description="Mật khẩu mới không được trùng với mật khẩu cũ"
                  {...form.getInputProps("matKhauMoi")}
                />

                <PasswordInput
                  label="Xác nhận mật khẩu mới"
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  {...form.getInputProps("xacNhanMatKhauMoi")}
                />

                <Button type="submit" fullWidth loading={isLoading} mt="md">
                  Đổi mật khẩu
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}


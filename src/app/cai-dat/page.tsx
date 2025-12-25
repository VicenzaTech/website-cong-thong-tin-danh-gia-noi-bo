"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Title,
  Text,
  Paper,
  Stack,
  PasswordInput,
  Button,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useAuth } from "@/features/auth/AuthContext";
import { mockService } from "@/services/mockService";

export default function CaiDatPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

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
    if (!user) {
      setError("Không tìm thấy thông tin người dùng");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: values.matKhauHienTai,
          newPassword: values.matKhauMoi,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Không thể đổi mật khẩu");
        setIsLoading(false);
        return;
      }

      const updatedUser = data.user;

      updateUser({ 
        matKhau: updatedUser.matKhau,
        matKhauCu: updatedUser.matKhauCu 
      });

      form.reset();
      notifications.show({
        title: "Thành công",
        message: "Đổi mật khẩu thành công",
        color: "green",
      });
    } catch (err) {
      console.error("Change password error:", err);
      setError("Đã xảy ra lỗi. Vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="xs">
            Cài đặt
          </Title>
          <Text c="dimmed">
            Quản lý cài đặt tài khoản của bạn
          </Text>
        </div>

        <Paper withBorder shadow="sm" p="xl" radius="md">
          <Title order={3} mb="lg">
            Đổi mật khẩu
          </Title>

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
                {...form.getInputProps("matKhauMoi")}
              />

              <PasswordInput
                label="Xác nhận mật khẩu mới"
                placeholder="Nhập lại mật khẩu mới"
                required
                {...form.getInputProps("xacNhanMatKhauMoi")}
              />

              <Button type="submit" loading={isLoading} mt="md">
                Đổi mật khẩu
              </Button>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Container>
  );
}


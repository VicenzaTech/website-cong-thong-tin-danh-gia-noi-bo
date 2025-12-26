"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Text,
  Alert,
  Group,
  Center,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useAuth } from "@/features/auth/AuthContext";
import type { User } from "@/types/schema";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("pending_user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      setPendingUser(user);
    } catch (err) {
      console.error("Failed to parse pending user:", err);
      router.push("/login");
    }
  }, [router]);

  const form = useForm({
    initialValues: {
      hoTen: "",
      email: "",
      matKhau: "",
      xacNhanMatKhau: "",
    },
    validate: {
      hoTen: (value) => {
        if (!value) return "Vui lòng nhập họ tên";
        if (value.length < 3) return "Họ tên phải có ít nhất 3 ký tự";
        return null;
      },
      email: (value) => {
        if (value && !/^\S+@\S+$/.test(value)) return "Email khong hop le";
        return null;
      },
      matKhau: (value) => {
        if (!value) return "Vui lòng nhập mật khẩu";
        if (value.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
        return null;
      },
      xacNhanMatKhau: (value, values) => {
        if (!value) return "Vui lòng xác nhận mật khẩu";
        if (value !== values.matKhau) return "Mật khẩu xác nhận không khớp";
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: pendingUser.id,
          hoTen: values.hoTen,
          email: values.email,
          matKhau: values.matKhau,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Khong the cap nhat thong tin. Vui long thu lai");
        setIsLoading(false);
        return;
      }

      localStorage.removeItem("pending_user");

      login(data.user as User);

      notifications.show({
        title: "Đăng ký thành công",
        message: "Chào mừng bạn đến với hệ thống!",
        color: "green",
      });

      router.push("/");
    } catch (err) {
      console.error("Registration error:", err);
      setError("Đã xảy ra lỗi. Vui lòng thử lại");
      setIsLoading(false);
    }
  };

  if (!pendingUser) {
    return null;
  }

  return (
    <Container 
      size={500} 
      my={{ base: 20, sm: 40 }}
      px={{ base: 16, sm: 20 }}
    >
      <Center mb={{ base: "md", sm: "xl" }}>
        <Image
          src="/logo-vicenza.png"
          alt="Vicenza Logo"
          width={120}
          height={120}
          priority
          style={{
            width: "auto",
            height: "auto",
            maxWidth: "100px",
            maxHeight: "100px",
          }}
        />
      </Center>
      
      <Title ta="center" mb="md" order={2} style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)" }}>
        Hoàn tất thông tin đăng ký
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb="xl">
        Vui lòng cập nhật thông tin cá nhân để hoàn tất đăng ký
      </Text>

      <Paper withBorder shadow="md" p={{ base: 20, sm: 30 }} radius="md">
        <Alert color="blue" title="Thong tin tai khoan" mb="lg">
          <Text size="sm">
            <strong>Ma nhan vien:</strong> {pendingUser.maNhanVien}
          </Text>
          {pendingUser.phongBanName && (
            <Text size="sm">
              <strong>Phong ban:</strong> {pendingUser.phongBanName}
            </Text>
          )}
          <Text size="sm">
            <strong>Vai tro:</strong>{" "}
            {pendingUser.role === "admin"
              ? "Quan tri vien"
              : pendingUser.role === "truong_phong"
                ? "Truong phong"
                : "Nhan vien"}
          </Text>
        </Alert>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {error && (
              <Alert color="red" title="Lỗi">
                {error}
              </Alert>
            )}

            <TextInput
              label="Họ và tên"
              placeholder="Nhập họ và tên đầy đủ"
              required
              {...form.getInputProps("hoTen")}
            />

            <TextInput
              label="Email"
              placeholder="example@company.com (khong bat buoc)"
              type="email"
              {...form.getInputProps("email")}
            />

            <PasswordInput
              label="Mật khẩu"
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              required
              {...form.getInputProps("matKhau")}
            />

            <PasswordInput
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu"
              required
              {...form.getInputProps("xacNhanMatKhau")}
            />

            <Group justify="space-between" mt="md" gap="sm" wrap="nowrap">
              <Button
                variant="subtle"
                onClick={() => {
                  localStorage.removeItem("pending_user");
                  router.push("/login");
                }}
                disabled={isLoading}
                flex={1}
              >
                Quay lại
              </Button>
              <Button type="submit" loading={isLoading} flex={1}>
                Hoàn tất đăng ký
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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
import { updateUserPassword } from "@/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<any>(null);

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
        if (!value) return null;
        if (!/^\S+@\S+$/.test(value)) return "Email không hợp lệ";
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
      const result = await updateUserPassword(
        pendingUser.id,
        values.hoTen,
        values.email || null,
        values.matKhau
      );

      if (!result.success) {
        setError(result.error || "Đã xảy ra lỗi");
        setIsLoading(false);
        return;
      }

      localStorage.removeItem("pending_user");

      const signInResult = await signIn("credentials", {
        maNhanVien: pendingUser.maNhanVien,
        matKhau: values.matKhau,
        redirect: false,
      });

      if (signInResult?.error) {
        notifications.show({
          title: "Đăng ký thành công",
          message: "Vui lòng đăng nhập lại",
          color: "blue",
        });
        router.push("/login");
        return;
      }

      notifications.show({
        title: "Đăng ký thành công",
        message: "Chào mừng bạn đến với hệ thống!",
        color: "green",
      });

      router.push("/");
      router.refresh();
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
    <Container size={500} my={40}>
      <Center mb="xl">
        <Image
          src="/logo-vicenza.png"
          alt="Vicenza Logo"
          width={120}
          height={120}
          priority
        />
      </Center>
      
      <Title ta="center" mb="md">
        Hoàn tất thông tin đăng ký
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb="xl">
        Vui lòng cập nhật thông tin cá nhân để hoàn tất đăng ký
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md">
        <Alert color="blue" title="Thông tin tài khoản" mb="lg">
          <Text size="sm">
            <strong>Mã nhân viên:</strong> {pendingUser.maNhanVien}
          </Text>
          <Text size="sm">
            <strong>Phòng ban:</strong> {pendingUser.phongBanName}
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
              placeholder="example@company.com"
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

            <Group justify="space-between" mt="md">
              <Button
                variant="subtle"
                onClick={() => {
                  localStorage.removeItem("pending_user");
                  router.push("/login");
                }}
                disabled={isLoading}
              >
                Quay lại
              </Button>
              <Button type="submit" loading={isLoading}>
                Hoàn tất đăng ký
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

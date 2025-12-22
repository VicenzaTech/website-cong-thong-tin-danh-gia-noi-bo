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
  Center,
  Loader,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useAuth } from "@/features/auth/AuthContext";
import { mockService } from "@/services/mockService";
import type { User } from "@/types/schema";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    initialValues: {
      maNhanVien: "",
      matKhau: "",
    },
    validate: {
      maNhanVien: (value) => (!value ? "Vui lòng nhập mã nhân viên" : null),
      matKhau: (value) => {
        if (showPassword && !value) {
          return "Vui lòng nhập mật khẩu";
        }
        return null;
      },
    },
  });

  const handleCheckUser = async () => {
    const maNhanVien = form.values.maNhanVien.trim();
    if (!maNhanVien) {
      form.setFieldError("maNhanVien", "Vui lòng nhập mã nhân viên");
      return;
    }

    setIsCheckingUser(true);
    setError(null);

    try {
      const user = await mockService.users.getByMaNhanVien(maNhanVien);

      if (!user) {
        setError("Không tìm thấy mã nhân viên này");
        setFoundUser(null);
        setShowPassword(false);
        setIsCheckingUser(false);
        return;
      }

      if (!user.trangThaiKH) {
        setError("Tài khoản của bạn đã bị vô hiệu hóa");
        setFoundUser(null);
        setShowPassword(false);
        setIsCheckingUser(false);
        return;
      }

      setFoundUser(user);

      if (!user.matKhau || user.matKhau.trim() === "") {
        localStorage.setItem("pending_user", JSON.stringify(user));
        notifications.show({
          title: "Chào mừng!",
          message: "Vui lòng hoàn tất thông tin đăng ký",
          color: "blue",
        });
        router.push("/register");
        return;
      }

      setShowPassword(true);
    } catch (err) {
      console.error("Check user error:", err);
      setError("Đã xảy ra lỗi. Vui lòng thử lại");
      setFoundUser(null);
      setShowPassword(false);
    } finally {
      setIsCheckingUser(false);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (!foundUser) {
      handleCheckUser();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (foundUser.matKhau !== values.matKhau) {
        setError("Mật khẩu không chính xác");
        setIsLoading(false);
        return;
      }

      login(foundUser);
      notifications.show({
        title: "Đăng nhập thành công",
        message: `Chào mừng ${foundUser.hoTen || foundUser.maNhanVien}!`,
        color: "green",
      });

      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("Đã xảy ra lỗi. Vui lòng thử lại");
      setIsLoading(false);
    }
  };

  const handleMaNhanVienChange = (value: string) => {
    form.setFieldValue("maNhanVien", value);
    if (foundUser) {
      setFoundUser(null);
      setShowPassword(false);
      form.setFieldValue("matKhau", "");
    }
    setError(null);
  };

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
      <Container size={420} style={{ position: "relative", zIndex: 2 }} my={40}>
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
              Đăng nhập
            </Title>
            <Text c="dimmed" size="sm" ta="center" mb="lg">
              Hệ thống Đánh giá Nội bộ
            </Text>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
              {error && (
                <Alert color="red" title="Lỗi đăng nhập">
                  {error}
                </Alert>
              )}

              {foundUser && foundUser.hoTen && (
                <Alert color="blue" title="Thông tin người dùng">
                  <Text size="sm">
                    <strong>Họ tên:</strong> {foundUser.hoTen}
                  </Text>
                </Alert>
              )}

              <TextInput
                label="Mã nhân viên"
                placeholder="Nhập mã nhân viên"
                required
                disabled={isLoading || isCheckingUser}
                rightSection={isCheckingUser ? <Loader size="xs" /> : null}
                {...form.getInputProps("maNhanVien")}
                onChange={(e) => handleMaNhanVienChange(e.target.value)}
                onBlur={() => {
                  if (form.values.maNhanVien.trim() && !foundUser && !isCheckingUser) {
                    handleCheckUser();
                  }
                }}
              />

              {showPassword && foundUser && (
                <PasswordInput
                  label="Mật khẩu"
                  placeholder="Nhập mật khẩu"
                  required
                  {...form.getInputProps("matKhau")}
                />
              )}

              {!showPassword ? (
                <Button
                  type="button"
                  fullWidth
                  loading={isCheckingUser}
                  onClick={handleCheckUser}
                >
                  Tiếp tục
                </Button>
              ) : (
                <Button type="submit" fullWidth loading={isLoading}>
                  Đăng nhập
                </Button>
              )}
              </Stack>
            </form>

            <Text size="sm" c="dimmed" mt="md" ta="center">
              Lần đầu đăng nhập? Hệ thống sẽ yêu cầu bạn cập nhật thông tin
            </Text>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}


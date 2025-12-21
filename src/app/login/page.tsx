"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Select,
  Stack,
  Text,
  Alert,
  Center,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useAuth } from "@/features/auth/AuthContext";
import { mockService } from "@/services/mockService";
import { phongBans } from "@/_mock/db";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      maNhanVien: "",
      phongBanId: "",
      matKhau: "",
    },
    validate: {
      maNhanVien: (value) => (!value ? "Vui lòng nhập mã nhân viên" : null),
      phongBanId: (value) => (!value ? "Vui lòng chọn phòng ban" : null),
      matKhau: (value) => (!value ? "Vui lòng nhập mật khẩu" : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await mockService.users.getByMaNhanVien(values.maNhanVien);

      if (!user) {
        setError("Không tìm thấy mã nhân viên này");
        setIsLoading(false);
        return;
      }

      if (user.phongBanId !== values.phongBanId) {
        setError("Mã nhân viên không thuộc phòng ban đã chọn");
        setIsLoading(false);
        return;
      }

      if (!user.trangThaiKH) {
        setError("Tài khoản của bạn đã bị vô hiệu hóa");
        setIsLoading(false);
        return;
      }

      if (!user.daDangKy) {
        localStorage.setItem("pending_user", JSON.stringify(user));
        notifications.show({
          title: "Chào mừng!",
          message: "Vui lòng hoàn tất thông tin đăng ký",
          color: "blue",
        });
        router.push("/register");
        return;
      }

      if (user.matKhau !== values.matKhau) {
        setError("Mật khẩu không chính xác");
        setIsLoading(false);
        return;
      }

      login(user);
      notifications.show({
        title: "Đăng nhập thành công",
        message: `Chào mừng ${user.hoTen}!`,
        color: "green",
      });

      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("Đã xảy ra lỗi. Vui lòng thử lại");
      setIsLoading(false);
    }
  };

  const phongBanOptions = phongBans
    .filter((pb) => !pb.deletedAt)
    .map((pb) => ({
      value: pb.id,
      label: pb.tenPhongBan,
    }));

  return (
    <Container size={420} my={40}>
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
        Đăng nhập
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb="xl">
        Hệ thống Đánh giá Nội bộ
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {error && (
              <Alert color="red" title="Lỗi đăng nhập">
                {error}
              </Alert>
            )}

            <TextInput
              label="Mã nhân viên"
              placeholder="Nhập mã nhân viên"
              required
              {...form.getInputProps("maNhanVien")}
            />

            <Select
              label="Phòng ban"
              placeholder="Chọn phòng ban"
              data={phongBanOptions}
              required
              searchable
              {...form.getInputProps("phongBanId")}
            />

            <PasswordInput
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              required
              {...form.getInputProps("matKhau")}
            />

            <Button type="submit" fullWidth loading={isLoading}>
              Đăng nhập
            </Button>
          </Stack>
        </form>

        <Text size="sm" c="dimmed" mt="md" ta="center">
          Lần đầu đăng nhập? Hệ thống sẽ yêu cầu bạn cập nhật thông tin
        </Text>
      </Paper>
    </Container>
  );
}


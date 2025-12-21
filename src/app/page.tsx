"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Title, Text, Button, Stack, Paper } from "@mantine/core";
import { useAuth } from "@/features/auth/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <Container size="md" mt="xl">
        <Text ta="center">Đang tải...</Text>
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Container size="md" mt="xl">
      <Paper withBorder shadow="md" p="xl" radius="md">
        <Stack gap="lg">
          <Title order={1}>Chào mừng đến với Hệ thống Đánh giá Nội bộ</Title>

          <Stack gap="sm">
            <Text size="lg">
              <strong>Họ tên:</strong> {user.hoTen}
            </Text>
            <Text size="lg">
              <strong>Mã nhân viên:</strong> {user.maNhanVien}
            </Text>
            <Text size="lg">
              <strong>Email:</strong> {user.email}
            </Text>
            <Text size="lg">
              <strong>Vai trò:</strong>{" "}
              {user.role === "admin"
                ? "Quản trị viên"
                : user.role === "truong_phong"
                  ? "Trưởng phòng"
                  : "Nhân viên"}
            </Text>
          </Stack>

          <Button onClick={logout} color="red" variant="outline">
            Đăng xuất
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

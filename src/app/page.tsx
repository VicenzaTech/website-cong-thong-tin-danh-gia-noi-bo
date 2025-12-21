"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Title, Text, Stack, Paper, Grid, Card, Group, Badge } from "@mantine/core";
import { IconUsers, IconClipboardCheck, IconChartBar, IconFileText } from "@tabler/icons-react";
import { useAuth } from "@/features/auth/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <Text ta="center">Đang tải...</Text>;
  }

  if (!user) {
    return null;
  }

  const stats = [
    {
      title: "Tổng số đánh giá",
      value: "0",
      icon: IconClipboardCheck,
      color: "blue",
    },
    {
      title: "Đã hoàn thành",
      value: "0",
      icon: IconChartBar,
      color: "green",
    },
    {
      title: "Chưa hoàn thành",
      value: "0",
      icon: IconFileText,
      color: "orange",
    },
    {
      title: "Người dùng",
      value: "26",
      icon: IconUsers,
      color: "grape",
    },
  ];

  return (
    <Stack gap="lg">
      <Paper withBorder shadow="sm" p="lg" radius="md">
        <Group justify="space-between">
          <div>
            <Title order={2}>Chào mừng trở lại, {user.hoTen}!</Title>
            <Text size="sm" c="dimmed" mt="xs">
              Đây là tổng quan về hoạt động đánh giá của bạn
            </Text>
          </div>
          <Badge size="lg" variant="light" color="blue">
            {user.role === "admin"
              ? "Quản trị viên"
              : user.role === "truong_phong"
                ? "Trưởng phòng"
                : "Nhân viên"}
          </Badge>
        </Group>
      </Paper>

      <Grid>
        {stats.map((stat) => (
          <Grid.Col key={stat.title} span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder shadow="sm" padding="lg" radius="md">
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    {stat.title}
                  </Text>
                  <Text size="xl" fw={700} mt="xs">
                    {stat.value}
                  </Text>
                </div>
                <stat.icon size={32} color={`var(--mantine-color-${stat.color}-6)`} />
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      <Paper withBorder shadow="sm" p="lg" radius="md">
        <Title order={3} mb="md">
          Thông tin cá nhân
        </Title>
        <Stack gap="sm">
          <Group>
            <Text fw={500} w={150}>
              Mã nhân viên:
            </Text>
            <Text>{user.maNhanVien}</Text>
          </Group>
          <Group>
            <Text fw={500} w={150}>
              Email:
            </Text>
            <Text>{user.email}</Text>
          </Group>
          <Group>
            <Text fw={500} w={150}>
              Vai trò:
            </Text>
            <Text>
              {user.role === "admin"
                ? "Quản trị viên"
                : user.role === "truong_phong"
                  ? "Trưởng phòng"
                  : "Nhân viên"}
            </Text>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}

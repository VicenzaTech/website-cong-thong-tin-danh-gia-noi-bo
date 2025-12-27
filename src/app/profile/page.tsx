"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Divider,
  useMantineColorScheme,
  Avatar,
} from "@mantine/core";
import { IconUser, IconId, IconMail } from "@tabler/icons-react";
import { useAuth } from "@/features/auth/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (!user) {
    return null;
  }

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="xs">
            Thông tin cá nhân
          </Title>
          <Text c="dimmed">
            Xem thông tin tài khoản của bạn
          </Text>
        </div>

        <Paper withBorder shadow="sm" p="xl" radius="md">
          <Stack gap="xl">
            {/* Avatar Section */}
            <Group justify="center" mb="md">
              <Avatar 
                color="blue" 
                radius="xl" 
                size={120}
                style={{
                  border: `3px solid ${
                    colorScheme === "dark" 
                      ? "var(--mantine-color-blue-6)" 
                      : "var(--mantine-color-blue-4)"
                  }`,
                }}
              >
                {getInitials(user.hoTen)}
              </Avatar>
            </Group>

            <Divider />

            {/* Mã nhân viên */}
            <Group gap="md" wrap="nowrap">
              <IconId 
                size={24} 
                color={colorScheme === "dark" ? "var(--mantine-color-blue-4)" : "var(--mantine-color-blue-6)"}
              />
              <div style={{ flex: 1 }}>
                <Text size="xs" c="dimmed" mb={4}>
                  Mã nhân viên
                </Text>
                <Text size="lg" fw={500}>
                  {user.maNhanVien}
                </Text>
              </div>
            </Group>

            <Divider />

            {/* Họ tên */}
            <Group gap="md" wrap="nowrap">
              <IconUser 
                size={24} 
                color={colorScheme === "dark" ? "var(--mantine-color-blue-4)" : "var(--mantine-color-blue-6)"}
              />
              <div style={{ flex: 1 }}>
                <Text size="xs" c="dimmed" mb={4}>
                  Họ và tên
                </Text>
                <Text size="lg" fw={500}>
                  {user.hoTen || "Chưa cập nhật"}
                </Text>
              </div>
            </Group>

            <Divider />

            {/* Email */}
            <Group gap="md" wrap="nowrap">
              <IconMail 
                size={24} 
                color={colorScheme === "dark" ? "var(--mantine-color-blue-4)" : "var(--mantine-color-blue-6)"}
              />
              <div style={{ flex: 1 }}>
                <Text size="xs" c="dimmed" mb={4}>
                  Email
                </Text>
                <Text size="lg" fw={500}>
                  {user.email || "Chưa cập nhật"}
                </Text>
              </div>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}


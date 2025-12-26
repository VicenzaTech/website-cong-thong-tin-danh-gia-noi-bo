"use client";

import { useRouter } from "next/navigation";
import {
  Group,
  Avatar,
  Menu,
  UnstyledButton,
  Text,
  ActionIcon,
  useMantineColorScheme,
  Box,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconLogout,
  IconSettings,
  IconUser,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { useAuth } from "@/features/auth/AuthContext";
import { notifications } from "@mantine/notifications";

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const isMobile = !useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    notifications.show({
      title: "Đăng xuất thành công",
      message: "Hẹn gặp lại bạn!",
      color: "blue",
    });
    router.push("/login");
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const borderColor = colorScheme === "dark" 
    ? "var(--mantine-color-dark-4)" 
    : "var(--mantine-color-gray-3)";

  return (
    <Box
      style={{
        height: isMobile ? 56 : 60,
        borderBottom: `1px solid ${borderColor}`,
        backgroundColor: colorScheme === "dark" 
          ? "var(--mantine-color-dark-7)" 
          : "var(--mantine-color-gray-0)",
        position: "fixed",
        top: 0,
        left: isMobile ? 0 : 280,
        right: 0,
        zIndex: 100,
      }}
    >
      <Group h="100%" px={isMobile ? "sm" : "md"} justify="space-between" gap="xs">
        <Group gap="xs">
          {isMobile && (
            <Text 
              size="md" 
              fw={700} 
              style={{ 
                color: colorScheme === "dark" ? "#fecd21" : "#0a133b" 
              }}
            >
              VICENZA IAS
            </Text>
          )}
          {!isMobile && (
            <Text size="lg" fw={500}>
              Hệ thống Đánh giá Nội bộ
            </Text>
          )}
        </Group>

        <Group gap={isMobile ? "xs" : "sm"}>
          <ActionIcon
            variant="subtle"
            size={isMobile ? "md" : "lg"}
            onClick={() => toggleColorScheme()}
            title={colorScheme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
          >
            {colorScheme === "dark" ? <IconSun size={isMobile ? 18 : 20} /> : <IconMoon size={isMobile ? 18 : 20} />}
          </ActionIcon>

          <Menu shadow="md" width={200} position={isMobile ? "bottom-end" : "bottom-end"}>
            <Menu.Target>
              <UnstyledButton>
                <Group gap={isMobile ? "xs" : "sm"}>
                  <Avatar color="blue" radius="xl" size={isMobile ? "sm" : undefined}>
                    {getInitials(user.hoTen)}
                  </Avatar>
                  {!isMobile && (
                    <div style={{ flex: 1 }}>
                      <Text size="sm" fw={500}>
                        {user.hoTen}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {user.email}
                      </Text>
                    </div>
                  )}
                  {isMobile && (
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text size="xs" fw={500} truncate>
                        {user.hoTen}
                      </Text>
                      {user.email && (
                        <Text size="10px" c="dimmed" truncate>
                          {user.email}
                        </Text>
                      )}
                    </div>
                  )}
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Tài khoản</Menu.Label>
              <Menu.Item
                leftSection={<IconUser size={16} />}
                onClick={() => router.push("/profile")}
              >
                Thông tin cá nhân
              </Menu.Item>
              <Menu.Item
                leftSection={<IconSettings size={16} />}
                onClick={() => router.push("/cai-dat")}
              >
                Cài đặt
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item
                color="red"
                leftSection={<IconLogout size={16} />}
                onClick={handleLogout}
              >
                Đăng xuất
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </Box>
  );
}


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
  IconPower,
} from "@tabler/icons-react";
import Image from "next/image";
import { useAuth } from "@/features/auth/AuthContext";
import { notifications } from "@mantine/notifications";

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  // Sử dụng md breakpoint (992px) để đồng bộ với DashboardLayout - iPad Mini (768px) sẽ không show sidebar
  const isMobileOrTablet = !useMediaQuery(`(min-width: ${theme.breakpoints.md})`);
  const isMobile = !useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);
  // Sử dụng isMobileOrTablet cho việc hiển thị logo/text để xử lý tốt iPad Mini (768px)
  // iPad Mini sẽ hiển thị logo thay vì text dài để tránh overflow
  const shouldShowLogo = isMobileOrTablet;

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
        left: isMobileOrTablet ? 0 : 280,
        right: 0,
        zIndex: 100,
        width: isMobileOrTablet ? "100%" : "calc(100% - 280px)",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <Group h="100%" px={isMobile ? "md" : "lg"} justify="space-between" gap="xs" wrap="nowrap">
        <Group gap="xs" style={{ flex: 1, minWidth: 0 }} wrap="nowrap">
          {shouldShowLogo && (
            <>
              <Image
                src="/logo-vicenza.png"
                alt="Vicenza Logo"
                width={28}
                height={28}
                priority
                style={{
                  objectFit: "contain",
                  flexShrink: 0,
                }}
              />
              <Text 
                size="md" 
                fw={700} 
                style={{ 
                  color: colorScheme === "dark" ? "#fecd21" : "#0a133b",
                  whiteSpace: "nowrap",
                }}
              >
                VICENZA IAS
              </Text>
            </>
          )}
          {!shouldShowLogo && (
            <Text 
              size="lg" 
              fw={500}
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Hệ thống Đánh giá Nội bộ
            </Text>
          )}
        </Group>

        <Group gap={isMobile ? "xs" : "sm"} wrap="nowrap" style={{ flexShrink: 0 }}>
          <ActionIcon
            variant="subtle"
            size={isMobile ? "md" : "lg"}
            onClick={() => toggleColorScheme()}
            title={colorScheme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
            style={{ flexShrink: 0 }}
          >
            {colorScheme === "dark" ? <IconSun size={isMobile ? 18 : 20} /> : <IconMoon size={isMobile ? 18 : 20} />}
          </ActionIcon>

          <Menu shadow="md" width={200} position={isMobile ? "bottom-end" : "bottom-end"}>
            <Menu.Target>
              <UnstyledButton style={{ flexShrink: 0 }}>
                <Group gap={isMobile ? "xs" : "sm"} wrap="nowrap">
                  <Avatar color="blue" radius="xl" size={isMobile ? "sm" : undefined} style={{ flexShrink: 0 }}>
                    {getInitials(user.hoTen)}
                  </Avatar>
                  {!isMobile && (
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" fw={500} truncate>
                        {user.hoTen}
                      </Text>
                      <Text size="xs" c="dimmed" truncate>
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


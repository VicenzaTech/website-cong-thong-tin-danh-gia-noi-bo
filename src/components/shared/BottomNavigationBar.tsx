"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Box, Group, UnstyledButton, Text, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconEye,
  IconUserStar,
  IconUserCheck,
  IconUser,
} from "@tabler/icons-react";
import { useAuth } from "@/features/auth/AuthContext";
import { notifications } from "@mantine/notifications";
import { Role } from "@/types/schema";

export function BottomNavigationBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, checkPermission } = useAuth();
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const isMobile = !useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);

  if (!user) return null;
  
  if (!isMobile) return null;

  const handleLogout = () => {
    logout();
    notifications.show({
      title: "Đăng xuất thành công",
      message: "Hẹn gặp lại bạn!",
      color: "blue",
    });
    router.push("/login");
  };

  const borderColor = colorScheme === "dark" 
    ? "var(--mantine-color-dark-4)" 
    : "var(--mantine-color-gray-3)";

  const canViewEvaluations = checkPermission([Role.admin, Role.truong_phong]);

  return (
    <Box
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        borderTop: `1px solid ${borderColor}`,
        backgroundColor: "var(--mantine-color-body)",
        zIndex: 1000,
      }}
    >
      <Group h="100%" px="xs" justify="space-around" gap={0}>
        {canViewEvaluations && (
          <UnstyledButton
            component={Link}
            href="/xem-danh-gia"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              padding: "8px 4px",
              borderRadius: 8,
              backgroundColor: pathname === "/xem-danh-gia" 
                ? (colorScheme === "dark" ? "var(--mantine-color-dark-6)" : "var(--mantine-color-gray-1)")
                : "transparent",
            }}
          >
            <IconEye size={24} color={pathname === "/xem-danh-gia" ? "var(--mantine-color-blue-6)" : undefined} />
            <Text size="xs" fw={pathname === "/xem-danh-gia" ? 600 : 400}>
              Xem đánh giá
            </Text>
          </UnstyledButton>
        )}

        <UnstyledButton
          component={Link}
          href="/danh-gia-lanh-dao"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "8px 4px",
            borderRadius: 8,
            backgroundColor: pathname === "/danh-gia-lanh-dao" 
              ? (colorScheme === "dark" ? "var(--mantine-color-dark-6)" : "var(--mantine-color-gray-1)")
              : "transparent",
          }}
        >
          <IconUserStar size={24} color={pathname === "/danh-gia-lanh-dao" ? "var(--mantine-color-blue-6)" : undefined} />
          <Text size="xs" fw={pathname === "/danh-gia-lanh-dao" ? 600 : 400}>
            Lãnh đạo
          </Text>
        </UnstyledButton>

        <UnstyledButton
          component={Link}
          href="/"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "8px 4px",
            borderRadius: 8,
            backgroundColor: pathname === "/" 
              ? (colorScheme === "dark" ? "var(--mantine-color-dark-6)" : "var(--mantine-color-gray-1)")
              : "transparent",
          }}
        >
          <Image
            src="/logo-vicenza.png"
            alt="Vicenza Logo"
            width={32}
            height={32}
            priority
            style={{
              objectFit: "contain",
            }}
          />
          <Text size="xs" fw={pathname === "/" ? 600 : 400}>
            Trang chủ
          </Text>
        </UnstyledButton>

        <UnstyledButton
          component={Link}
          href="/danh-gia-nhan-vien"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "8px 4px",
            borderRadius: 8,
            backgroundColor: pathname === "/danh-gia-nhan-vien" 
              ? (colorScheme === "dark" ? "var(--mantine-color-dark-6)" : "var(--mantine-color-gray-1)")
              : "transparent",
          }}
        >
          <IconUserCheck size={24} color={pathname === "/danh-gia-nhan-vien" ? "var(--mantine-color-blue-6)" : undefined} />
          <Text size="xs" fw={pathname === "/danh-gia-nhan-vien" ? 600 : 400}>
            Nhân viên
          </Text>
        </UnstyledButton>

        <UnstyledButton
          onClick={handleLogout}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "8px 4px",
            borderRadius: 8,
          }}
        >
          <IconUser size={24} />
          <Text size="xs" fw={400}>
            Tài khoản
          </Text>
        </UnstyledButton>
      </Group>
    </Box>
  );
}


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
  IconPower,
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

  const navItems = [
    ...(canViewEvaluations ? [{
      href: "/xem-danh-gia",
      icon: <IconEye size={22} />,
      label: "Xem",
      isActive: pathname === "/xem-danh-gia",
    }] : []),
    {
      href: "/danh-gia-lanh-dao",
      icon: <IconUserStar size={22} />,
      label: "Lãnh đạo",
      isActive: pathname === "/danh-gia-lanh-dao",
    },
    {
      href: "/",
      icon: (
        <Image
          src="/logo-vicenza.png"
          alt="Vicenza Logo"
          width={28}
          height={28}
          priority
          style={{
            objectFit: "contain",
          }}
        />
      ),
      label: "Trang chủ",
      isActive: pathname === "/",
    },
    {
      href: "/danh-gia-nhan-vien",
      icon: <IconUserCheck size={22} />,
      label: "Nhân viên",
      isActive: pathname === "/danh-gia-nhan-vien",
    },
    {
      href: null,
      icon: <IconPower size={22} />,
      label: "Đăng xuất",
      isActive: false,
      onClick: handleLogout,
    },
  ];

  return (
    <Box
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 65,
        borderTop: `1px solid ${borderColor}`,
        backgroundColor: "var(--mantine-color-body)",
        zIndex: 1000,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <Group h="100%" px={4} justify="space-around" gap={0}>
        {navItems.map((item, index) => {
          const activeBg = colorScheme === "dark" 
            ? "var(--mantine-color-dark-6)" 
            : "var(--mantine-color-gray-1)";
          const activeColor = "var(--mantine-color-blue-6)";

          if (item.href) {
            return (
              <UnstyledButton
                key={index}
                component={Link}
                href={item.href}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  padding: "6px 2px",
                  borderRadius: 8,
                  minWidth: 0,
                  backgroundColor: item.isActive ? activeBg : "transparent",
                  transition: "background-color 0.2s ease",
                }}
              >
                <Box
                  style={{
                    color: item.isActive ? activeColor : undefined,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </Box>
                <Text 
                  size="10px" 
                  fw={item.isActive ? 600 : 400}
                  style={{
                    lineHeight: 1.2,
                    textAlign: "center",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                  }}
                >
                  {item.label}
                </Text>
              </UnstyledButton>
            );
          }

          return (
            <UnstyledButton
              key={index}
              onClick={item.onClick}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                padding: "6px 2px",
                borderRadius: 8,
                minWidth: 0,
                transition: "background-color 0.2s ease",
              }}
            >
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </Box>
              <Text 
                size="10px" 
                fw={400}
                style={{
                  lineHeight: 1.2,
                  textAlign: "center",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                }}
              >
                {item.label}
              </Text>
            </UnstyledButton>
          );
        })}
      </Group>
    </Box>
  );
}


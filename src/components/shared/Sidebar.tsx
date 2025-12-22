"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Stack, NavLink, Text, Box, Center, useMantineColorScheme } from "@mantine/core";
import {
  IconHome,
  IconUsers,
  IconClipboardText,
  IconFileText,
  IconSettings,
  IconChartBar,
  IconUserCheck,
  IconUserStar,
  IconHistory,
  IconEye,
} from "@tabler/icons-react";
import { useAuth } from "@/features/auth/AuthContext";
import { Role } from "@/types/schema";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  allowedRoles: Role[];
}

const menuItems: MenuItem[] = [
  {
    label: "Tổng quan",
    href: "/",
    icon: <IconHome size={20} />,
    allowedRoles: [Role.admin, Role.truong_phong, Role.nhan_vien],
  },
  {
    label: "Đánh giá lãnh đạo",
    href: "/danh-gia-lanh-dao",
    icon: <IconUserStar size={20} />,
    allowedRoles: [Role.admin, Role.truong_phong, Role.nhan_vien],
  },
  {
    label: "Đánh giá nhân viên",
    href: "/danh-gia-nhan-vien",
    icon: <IconUserCheck size={20} />,
    allowedRoles: [Role.admin, Role.truong_phong, Role.nhan_vien],
  },
  {
    label: "Lịch sử đánh giá",
    href: "/lich-su-danh-gia",
    icon: <IconHistory size={20} />,
    allowedRoles: [Role.admin, Role.truong_phong, Role.nhan_vien],
  },
  {
    label: "Xem đánh giá",
    href: "/xem-danh-gia",
    icon: <IconEye size={20} />,
    allowedRoles: [Role.admin, Role.truong_phong],
  },
  {
    label: "Báo cáo & Thống kê",
    href: "/bao-cao",
    icon: <IconChartBar size={20} />,
    allowedRoles: [Role.admin, Role.truong_phong, Role.nhan_vien],
  },
  {
    label: "Quản lý người dùng",
    href: "/nguoi-dung",
    icon: <IconUsers size={20} />,
    allowedRoles: [Role.admin, Role.truong_phong, Role.nhan_vien],
  },
  {
    label: "Quản lý biểu mẫu",
    href: "/bieu-mau",
    icon: <IconFileText size={20} />,
    allowedRoles: [Role.admin],
  },
  {
    label: "Quản lý kỳ đánh giá",
    href: "/ky-danh-gia",
    icon: <IconClipboardText size={20} />,
    allowedRoles: [Role.admin],
  },
  {
    label: "Cài đặt",
    href: "/cai-dat",
    icon: <IconSettings size={20} />,
    allowedRoles: [Role.admin, Role.truong_phong, Role.nhan_vien],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, checkPermission } = useAuth();
  const { colorScheme } = useMantineColorScheme();

  if (!user) return null;

  const filteredMenuItems = menuItems.filter((item) => checkPermission(item.allowedRoles));

  const borderColor = colorScheme === "dark" 
    ? "var(--mantine-color-dark-4)" 
    : "var(--mantine-color-gray-3)";

  return (
    <Box
      style={{
        width: 280,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        borderRight: `1px solid ${borderColor}`,
        backgroundColor: "var(--mantine-color-body)",
        overflowY: "auto",
      }}
    >
      <Box p="md" style={{ borderBottom: `1px solid ${borderColor}` }}>
        <Center mb="sm">
          <Image
            src="/logo-vicenza.png"
            alt="Vicenza Logo"
            width={60}
            height={60}
            priority
          />
        </Center>
        <Text size="lg" fw={700} c="blue" ta="center" lh={1.3}>
          Cổng thông tin
        </Text>
        <Text size="sm" fw={600} c="blue" ta="center" lh={1.3}>
          Đánh giá nhân sự nội bộ
        </Text>
      </Box>

      <Stack gap={4} p="sm">
        {filteredMenuItems.map((item) => (
          <NavLink
            key={item.href}
            component={Link}
            href={item.href}
            label={item.label}
            leftSection={item.icon}
            active={pathname === item.href}
            variant="subtle"
          />
        ))}
      </Stack>

      <Box p="md" mt="auto" style={{ borderTop: `1px solid ${borderColor}` }}>
        <Text size="xs" c="dimmed">
          Vai trò:{" "}
          {user.role === Role.admin
            ? "Quản trị viên"
            : user.role === Role.truong_phong
              ? "Trưởng phòng"
              : "Nhân viên"}
        </Text>
      </Box>
    </Box>
  );
}


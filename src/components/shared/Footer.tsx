"use client";

import { Box, Container, Text, Group, Anchor, Stack, SimpleGrid } from "@mantine/core";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      style={{
        borderTop: "1px solid var(--mantine-color-gray-3)",
        backgroundColor: "var(--mantine-color-body)",
        padding: "30px 0 20px",
      }}
    >
      <Container size="xl">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mb="xl">
          {/* Company Info */}
          <Stack gap="xs">
            <Group gap="sm">
              <Image
                src="/logo-vicenza.png"
                alt="Vicenza Logo"
                width={40}
                height={40}
              />
              <div>
                <Text size="sm" fw={600}>
                  Cổng thông tin
                </Text>
                <Text size="xs" fw={500}>
                  Đánh giá nhân sự nội bộ
                </Text>
              </div>
            </Group>
            <Text size="xs" c="dimmed">
              © {currentYear} Vicenza. All rights reserved.
            </Text>
          </Stack>

          {/* Quick Links */}
          <Stack gap="xs">
            <Text size="sm" fw={600} mb="xs">
              Liên kết nhanh
            </Text>
            <Anchor component={Link} href="/" size="xs" c="dimmed">
              Trang chủ
            </Anchor>
            <Anchor component={Link} href="/danh-gia-lanh-dao" size="xs" c="dimmed">
              Đánh giá lãnh đạo
            </Anchor>
            <Anchor component={Link} href="/danh-gia-nhan-vien" size="xs" c="dimmed">
              Đánh giá nhân viên
            </Anchor>
            <Anchor component={Link} href="/lich-su-danh-gia" size="xs" c="dimmed">
              Lịch sử đánh giá
            </Anchor>
            <Anchor component={Link} href="/bao-cao" size="xs" c="dimmed">
              Báo cáo & Thống kê
            </Anchor>
          </Stack>

          {/* Management */}
          <Stack gap="xs">
            <Text size="sm" fw={600} mb="xs">
              Quản lý
            </Text>
            <Anchor component={Link} href="/nguoi-dung" size="xs" c="dimmed">
              Quản lý người dùng
            </Anchor>
            <Anchor component={Link} href="/phong-ban" size="xs" c="dimmed">
              Quản lý phòng ban
            </Anchor>
            <Anchor component={Link} href="/bieu-mau" size="xs" c="dimmed">
              Quản lý biểu mẫu
            </Anchor>
            <Anchor component={Link} href="/ky-danh-gia" size="xs" c="dimmed">
              Quản lý kỳ đánh giá
            </Anchor>
          </Stack>

          {/* Support */}
          <Stack gap="xs">
            <Text size="sm" fw={600} mb="xs">
              Hỗ trợ
            </Text>
            <Anchor component={Link} href="/huong-dan" size="xs" c="dimmed">
              Hướng dẫn sử dụng
            </Anchor>
            <Anchor component={Link} href="/lien-he" size="xs" c="dimmed">
              Liên hệ hỗ trợ
            </Anchor>
            <Anchor component={Link} href="/chinh-sach" size="xs" c="dimmed">
              Chính sách bảo mật
            </Anchor>
          </Stack>
        </SimpleGrid>

        <Box
          style={{
            borderTop: "1px solid var(--mantine-color-gray-3)",
            paddingTop: "15px",
          }}
        >
          <Text size="xs" c="dimmed" ta="center">
            Phát triển bởi Văn phòng Chủ tịch Hội đồng quản trị - Vicenza
          </Text>
        </Box>
      </Container>
    </Box>
  );
}


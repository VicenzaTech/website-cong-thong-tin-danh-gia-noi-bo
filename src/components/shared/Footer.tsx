"use client";

import { Box, Container, Text, Group, Anchor, Stack, SimpleGrid, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const isMobile = !useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);

  const borderColor = colorScheme === "dark" 
    ? "var(--mantine-color-dark-4)" 
    : "var(--mantine-color-gray-3)";

  return (
    <Box
      component="footer"
      style={{
        borderTop: `1px solid ${borderColor}`,
        backgroundColor: "var(--mantine-color-body)",
        padding: isMobile ? "20px 0 15px" : "30px 0 20px",
      }}
    >
      <Container size="xl" px={isMobile ? "sm" : "md"}>
        {isMobile ? (
          // Mobile layout - simplified
          <Stack gap="md">
            {/* Company Info */}
            <Stack gap="xs" align="center">
              <Group gap="sm" justify="center">
                <Image
                  src="/logo-vicenza.png"
                  alt="Vicenza Logo"
                  width={32}
                  height={32}
                />
                <div>
                  <Text size="xs" fw={600}>
                    Cổng thông tin
                  </Text>
                  <Text size="10px" fw={500}>
                    Đánh giá nhân sự nội bộ
                  </Text>
                </div>
              </Group>
              <Text size="10px" c="dimmed" ta="center">
                © {currentYear} Vicenza. All rights reserved.
              </Text>
            </Stack>

            {/* Quick Links - Compact */}
            <Stack gap={4} align="center">
              <Text size="xs" fw={600} mb={4}>
                Liên kết nhanh
              </Text>
              <Group gap="md" justify="center" wrap="wrap">
                <Anchor component={Link} href="/" size="10px" c="dimmed">
                  Trang chủ
                </Anchor>
                <Anchor component={Link} href="/danh-gia-lanh-dao" size="10px" c="dimmed">
                  Đánh giá lãnh đạo
                </Anchor>
                <Anchor component={Link} href="/danh-gia-nhan-vien" size="10px" c="dimmed">
                  Đánh giá nhân viên
                </Anchor>
                <Anchor component={Link} href="/lich-su-danh-gia" size="10px" c="dimmed">
                  Lịch sử
                </Anchor>
                <Anchor component={Link} href="/huong-dan" size="10px" c="dimmed">
                  Hướng dẫn
                </Anchor>
                <Anchor component={Link} href="/lien-he" size="10px" c="dimmed">
                  Liên hệ
                </Anchor>
              </Group>
            </Stack>

            <Box
              style={{
                borderTop: `1px solid ${borderColor}`,
                paddingTop: "10px",
              }}
            >
              <Text size="9px" c="dimmed" ta="center" style={{ lineHeight: 1.4 }}>
                Phát triển bởi Văn phòng Chủ tịch Hội đồng quản trị
              </Text>
              <Text size="9px" c="dimmed" ta="center" mt={2}>
                Công ty cổ phần đầu tư phát triển Vicenza
              </Text>
            </Box>
          </Stack>
        ) : (
          // Desktop layout - full content
          <>
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
                borderTop: `1px solid ${borderColor}`,
                paddingTop: "15px",
              }}
            >
              <Text size="xs" c="dimmed" ta="center">
                Phát triển bởi Văn phòng Chủ tịch Hội đồng quản trị - Công ty cổ phần đầu tư phát triển Vicenza
              </Text>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}


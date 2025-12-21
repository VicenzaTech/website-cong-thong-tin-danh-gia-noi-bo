"use client";

import { Box, Container, Text, Group, Anchor } from "@mantine/core";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      style={{
        borderTop: "1px solid var(--mantine-color-gray-3)",
        backgroundColor: "var(--mantine-color-body)",
        padding: "20px 0",
      }}
    >
      <Container size="xl">
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <Image
              src="/logo-vicenza.png"
              alt="Vicenza Logo"
              width={40}
              height={40}
            />
            <div>
              <Text size="sm" fw={600}>
                Hệ thống Đánh giá Nội bộ
              </Text>
              <Text size="xs" c="dimmed">
                © {currentYear} Vicenza. All rights reserved.
              </Text>
            </div>
          </Group>

          <Group gap="md">
            <Anchor href="#" size="xs" c="dimmed">
              Hướng dẫn sử dụng
            </Anchor>
            <Anchor href="#" size="xs" c="dimmed">
              Liên hệ hỗ trợ
            </Anchor>
            <Anchor href="#" size="xs" c="dimmed">
              Chính sách bảo mật
            </Anchor>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}


"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Title,
  Text,
  Paper,
  Stack,
  Grid,
  ThemeIcon,
  Group,
  Divider,
  Button,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconMail,
  IconPhone,
  IconMapPin,
  IconClock,
  IconBrandFacebook,
  IconBrandLinkedin,
  IconWorld,
} from "@tabler/icons-react";
import { useAuth } from "@/features/auth/AuthContext";

export default function LienHePage() {
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

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="xs">
            Liên hệ hỗ trợ
          </Title>
          <Text c="dimmed">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn trong quá trình sử dụng hệ thống
          </Text>
        </div>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder shadow="sm" p="xl" radius="md" h="100%">
              <Stack gap="xl">
                <div>
                  <Text fw={600} size="lg" mb="md">
                    Thông tin liên hệ
                  </Text>
                  <Text size="sm" c="dimmed">
                    Liên hệ với chúng tôi qua các kênh sau
                  </Text>
                </div>

                <Stack gap="lg">
                  <Group>
                    <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                      <IconMail size={20} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" c="dimmed">
                        Email
                      </Text>
                      <Text fw={500}>support@vicenza.vn</Text>
                    </div>
                  </Group>

                  <Group>
                    <ThemeIcon size="lg" radius="md" variant="light" color="green">
                      <IconPhone size={20} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" c="dimmed">
                        Điện thoại
                      </Text>
                      <Text fw={500}>(024) 1234 5678</Text>
                    </div>
                  </Group>

                  <Group>
                    <ThemeIcon size="lg" radius="md" variant="light" color="red">
                      <IconMapPin size={20} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" c="dimmed">
                        Địa chỉ
                      </Text>
                      <Text fw={500}>
                        Văn phòng Chủ tịch Hội đồng quản trị
                        <br />
                        Công ty cổ phần đầu tư phát triển Vicenza
                      </Text>
                    </div>
                  </Group>

                  <Group>
                    <ThemeIcon size="lg" radius="md" variant="light" color="orange">
                      <IconClock size={20} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" c="dimmed">
                        Giờ làm việc
                      </Text>
                      <Text fw={500}>
                        Thứ 2 - Thứ 6: 8:00 - 17:00
                        <br />
                        Thứ 7: 8:00 - 12:00
                      </Text>
                    </div>
                  </Group>
                </Stack>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder shadow="sm" p="xl" radius="md" h="100%">
              <Stack gap="xl">
                <div>
                  <Text fw={600} size="lg" mb="md">
                    Hỗ trợ kỹ thuật
                  </Text>
                  <Text size="sm" c="dimmed">
                    Gặp vấn đề kỹ thuật? Chúng tôi sẵn sàng giúp đỡ
                  </Text>
                </div>

                <Stack gap="md">
                  <Paper withBorder p="md" radius="md">
                    <Text fw={600} size="sm" mb="xs">
                      Báo lỗi hệ thống
                    </Text>
                    <Text size="xs" c="dimmed" mb="md">
                      Gửi email chi tiết về lỗi bạn gặp phải đến support@vicenza.vn
                    </Text>
                    <Button variant="light" size="xs" fullWidth>
                      Gửi báo cáo lỗi
                    </Button>
                  </Paper>

                  <Paper withBorder p="md" radius="md">
                    <Text fw={600} size="sm" mb="xs">
                      Yêu cầu tính năng mới
                    </Text>
                    <Text size="xs" c="dimmed" mb="md">
                      Có ý tưởng cải thiện hệ thống? Hãy chia sẻ với chúng tôi
                    </Text>
                    <Button variant="light" size="xs" fullWidth>
                      Gửi yêu cầu
                    </Button>
                  </Paper>

                  <Paper withBorder p="md" radius="md">
                    <Text fw={600} size="sm" mb="xs">
                      Hỗ trợ trực tuyến
                    </Text>
                    <Text size="xs" c="dimmed" mb="md">
                      Chat trực tiếp với đội ngũ hỗ trợ trong giờ làm việc
                    </Text>
                    <Button variant="light" size="xs" fullWidth>
                      Bắt đầu chat
                    </Button>
                  </Paper>
                </Stack>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        <Paper withBorder shadow="sm" p="xl" radius="md">
          <Stack gap="md">
            <Text fw={600} size="lg">
              Kết nối với chúng tôi
            </Text>
            <Divider />
            <Group>
              <Button
                variant="light"
                leftSection={<IconWorld size={18} />}
                component="a"
                href="https://vicenza.vn"
                target="_blank"
              >
                Website
              </Button>
              <Button
                variant="light"
                leftSection={<IconBrandFacebook size={18} />}
                component="a"
                href="#"
                target="_blank"
              >
                Facebook
              </Button>
              <Button
                variant="light"
                leftSection={<IconBrandLinkedin size={18} />}
                component="a"
                href="#"
                target="_blank"
              >
                LinkedIn
              </Button>
            </Group>
          </Stack>
        </Paper>

        <Paper 
          withBorder 
          shadow="sm" 
          p="xl" 
          radius="md" 
          bg={colorScheme === "dark" ? "dark.6" : "blue.0"}
        >
          <Stack gap="xs">
            <Text fw={600} size="lg">
              Câu hỏi thường gặp
            </Text>
            <Text size="sm">
              Trước khi liên hệ, bạn có thể tìm câu trả lời nhanh chóng tại trang{" "}
              <Text
                component="a"
                href="/huong-dan"
                c="blue"
                td="underline"
                style={{ cursor: "pointer" }}
              >
                Hướng dẫn sử dụng
              </Text>
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}


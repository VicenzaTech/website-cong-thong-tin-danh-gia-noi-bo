"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Title,
  Text,
  Paper,
  Stack,
  Accordion,
  List,
  ThemeIcon,
  Badge,
} from "@mantine/core";
import { IconCircleCheck } from "@tabler/icons-react";
import { useAuth } from "@/features/auth/AuthContext";

export default function HuongDanPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

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
            Hướng dẫn sử dụng hệ thống
          </Title>
          <Text c="dimmed">
            Tài liệu hướng dẫn chi tiết về cách sử dụng Cổng thông tin Đánh giá nhân sự nội bộ
          </Text>
        </div>

        <Paper withBorder shadow="sm" p="xl" radius="md">
          <Accordion variant="separated" defaultValue="login">
            {/* Đăng nhập */}
            <Accordion.Item value="login">
              <Accordion.Control>
                <Text fw={600}>1. Đăng nhập hệ thống</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Text size="sm">
                    Để đăng nhập vào hệ thống, bạn cần có:
                  </Text>
                  <List
                    spacing="xs"
                    size="sm"
                    icon={
                      <ThemeIcon color="blue" size={20} radius="xl">
                        <IconCircleCheck size={14} />
                      </ThemeIcon>
                    }
                  >
                    <List.Item>Mã nhân viên (được cấp bởi phòng Nhân sự)</List.Item>
                    <List.Item>Chọn đúng phòng ban của bạn</List.Item>
                    <List.Item>Mật khẩu (nếu đã đăng ký)</List.Item>
                  </List>
                  <Text size="sm" mt="md">
                    <strong>Lưu ý:</strong> Nếu là lần đầu đăng nhập, hệ thống sẽ yêu cầu bạn
                    hoàn tất thông tin đăng ký (họ tên, email, mật khẩu).
                  </Text>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            {/* Đánh giá lãnh đạo */}
            <Accordion.Item value="evaluate-leader">
              <Accordion.Control>
                <Text fw={600}>2. Đánh giá lãnh đạo</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Text size="sm">
                    Chức năng này cho phép nhân viên đánh giá trưởng phòng của mình:
                  </Text>
                  <List spacing="xs" size="sm">
                    <List.Item>
                      Truy cập menu <strong>"Đánh giá lãnh đạo"</strong>
                    </List.Item>
                    <List.Item>
                      Kiểm tra kỳ đánh giá hiện tại và thông tin trưởng phòng
                    </List.Item>
                    <List.Item>
                      Nhấn <strong>"Thực hiện đánh giá"</strong>
                    </List.Item>
                    <List.Item>
                      Chấm điểm cho từng tiêu chí (thang điểm 1-5)
                    </List.Item>
                    <List.Item>
                      Nhập nhận xét chung (bắt buộc, tối thiểu 10 ký tự)
                    </List.Item>
                    <List.Item>
                      Nhấn <strong>"Gửi đánh giá"</strong> để hoàn tất
                    </List.Item>
                  </List>
                  <Badge color="orange" variant="light" mt="xs">
                    Lưu ý: Mỗi nhân viên chỉ đánh giá trưởng phòng một lần trong mỗi kỳ
                  </Badge>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            {/* Đánh giá đồng nghiệp */}
            <Accordion.Item value="evaluate-peer">
              <Accordion.Control>
                <Text fw={600}>3. Đánh giá đồng nghiệp</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Text size="sm">
                    Đánh giá năng lực của các đồng nghiệp trong cùng phòng ban:
                  </Text>
                  <List spacing="xs" size="sm">
                    <List.Item>
                      Truy cập menu <strong>"Đánh giá nhân viên"</strong>
                    </List.Item>
                    <List.Item>
                      Xem danh sách đồng nghiệp và trạng thái đánh giá
                    </List.Item>
                    <List.Item>
                      Chọn đồng nghiệp cần đánh giá, nhấn <strong>"Bắt đầu đánh giá"</strong>
                    </List.Item>
                    <List.Item>
                      Chấm điểm và nhập nhận xét tương tự như đánh giá lãnh đạo
                    </List.Item>
                    <List.Item>
                      Gửi đánh giá khi hoàn tất
                    </List.Item>
                  </List>
                  <Badge color="blue" variant="light" mt="xs">
                    Tiến độ: Hệ thống hiển thị số lượng đã hoàn thành / tổng số
                  </Badge>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            {/* Lịch sử đánh giá */}
            <Accordion.Item value="history">
              <Accordion.Control>
                <Text fw={600}>4. Lịch sử đánh giá</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Text size="sm">
                    Xem lại các đánh giá đã thực hiện:
                  </Text>
                  <List spacing="xs" size="sm">
                    <List.Item>
                      Truy cập menu <strong>"Lịch sử đánh giá"</strong>
                    </List.Item>
                    <List.Item>
                      Xem danh sách tất cả đánh giá đã gửi
                    </List.Item>
                    <List.Item>
                      Nhấn biểu tượng <strong>mắt</strong> để xem chi tiết
                    </List.Item>
                    <List.Item>
                      Nhấn biểu tượng <strong>bút</strong> để chỉnh sửa (nếu còn trong thời hạn)
                    </List.Item>
                  </List>
                  <Badge color="green" variant="light" mt="xs">
                    Chỉ có thể chỉnh sửa khi kỳ đánh giá chưa kết thúc
                  </Badge>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            {/* Báo cáo (Admin/Manager) */}
            <Accordion.Item value="reports">
              <Accordion.Control>
                <Text fw={600}>5. Báo cáo & Thống kê (Quản lý)</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Text size="sm">
                    Dành cho Quản trị viên và Trưởng phòng:
                  </Text>
                  <List spacing="xs" size="sm">
                    <List.Item>
                      Truy cập menu <strong>"Báo cáo & Thống kê"</strong>
                    </List.Item>
                    <List.Item>
                      Chọn kỳ đánh giá cần xem
                    </List.Item>
                    <List.Item>
                      <strong>Admin:</strong> Chọn phòng ban hoặc xem toàn công ty
                    </List.Item>
                    <List.Item>
                      <strong>Trưởng phòng:</strong> Chỉ xem dữ liệu phòng ban của mình
                    </List.Item>
                    <List.Item>
                      Xem biểu đồ phân bố điểm, radar tiêu chí, bảng xếp hạng
                    </List.Item>
                  </List>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            {/* Quản lý (Admin) */}
            <Accordion.Item value="admin">
              <Accordion.Control>
                <Text fw={600}>6. Quản lý hệ thống (Quản trị viên)</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Text size="sm">
                    Các chức năng dành riêng cho Quản trị viên:
                  </Text>
                  <List spacing="xs" size="sm">
                    <List.Item>
                      <strong>Quản lý người dùng:</strong> Thêm, sửa, xóa, kích hoạt/vô hiệu hóa tài khoản
                    </List.Item>
                    <List.Item>
                      <strong>Quản lý phòng ban:</strong> Tạo phòng ban, phân quyền trưởng phòng
                    </List.Item>
                    <List.Item>
                      <strong>Quản lý biểu mẫu:</strong> Tạo/sửa biểu mẫu đánh giá, thêm câu hỏi
                    </List.Item>
                    <List.Item>
                      <strong>Quản lý kỳ đánh giá:</strong> Tạo kỳ mới, mở/đóng kỳ đánh giá
                    </List.Item>
                  </List>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Paper>

        <Paper withBorder shadow="sm" p="xl" radius="md" bg="blue.0">
          <Stack gap="xs">
            <Text fw={600} size="lg">
              Cần hỗ trợ thêm?
            </Text>
            <Text size="sm">
              Nếu bạn gặp khó khăn trong quá trình sử dụng, vui lòng liên hệ:
            </Text>
            <List size="sm">
              <List.Item>Email: support@vicenza.vn</List.Item>
              <List.Item>Điện thoại: (024) 1234 5678</List.Item>
              <List.Item>Văn phòng Chủ tịch Hội đồng quản trị</List.Item>
            </List>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}


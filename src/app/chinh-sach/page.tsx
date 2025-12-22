"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Title,
  Text,
  Paper,
  Stack,
  List,
  Divider,
  Badge,
  useMantineColorScheme,
} from "@mantine/core";
import { useAuth } from "@/features/auth/AuthContext";

export default function ChinhSachPage() {
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
            Chính sách bảo mật
          </Title>
          <Text c="dimmed">
            Cam kết bảo vệ thông tin cá nhân và dữ liệu đánh giá của bạn
          </Text>
          <Badge color="blue" variant="light" mt="sm">
            Cập nhật lần cuối: Tháng 12, 2024
          </Badge>
        </div>

        <Paper withBorder shadow="sm" p="xl" radius="md">
          <Stack gap="xl">
            <div>
              <Text fw={600} size="lg" mb="md">
                1. Thu thập thông tin
              </Text>
              <Text size="sm" mb="md">
                Chúng tôi thu thập các thông tin sau từ người dùng:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>
                  <strong>Thông tin cá nhân:</strong> Họ tên, mã nhân viên, email, phòng ban
                </List.Item>
                <List.Item>
                  <strong>Thông tin đánh giá:</strong> Điểm số, nhận xét, đánh giá năng lực
                </List.Item>
                <List.Item>
                  <strong>Thông tin hệ thống:</strong> Lịch sử đăng nhập, hoạt động trong hệ thống
                </List.Item>
              </List>
            </div>

            <Divider />

            <div>
              <Text fw={600} size="lg" mb="md">
                2. Mục đích sử dụng thông tin
              </Text>
              <Text size="sm" mb="md">
                Thông tin được thu thập để:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>Quản lý tài khoản và xác thực người dùng</List.Item>
                <List.Item>Thực hiện quy trình đánh giá năng lực nhân sự</List.Item>
                <List.Item>Tạo báo cáo và thống kê phục vụ quản lý</List.Item>
                <List.Item>Cải thiện chất lượng dịch vụ và hệ thống</List.Item>
                <List.Item>Tuân thủ các quy định pháp luật hiện hành</List.Item>
              </List>
            </div>

            <Divider />

            <div>
              <Text fw={600} size="lg" mb="md">
                3. Bảo mật thông tin
              </Text>
              <Text size="sm" mb="md">
                Chúng tôi cam kết bảo vệ thông tin của bạn thông qua:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>
                  <strong>Mã hóa dữ liệu:</strong> Tất cả thông tin nhạy cảm được mã hóa
                </List.Item>
                <List.Item>
                  <strong>Kiểm soát truy cập:</strong> Chỉ người có thẩm quyền mới được truy cập
                </List.Item>
                <List.Item>
                  <strong>Phân quyền rõ ràng:</strong> Mỗi vai trò chỉ xem được dữ liệu phù hợp
                </List.Item>
                <List.Item>
                  <strong>Sao lưu định kỳ:</strong> Dữ liệu được sao lưu thường xuyên
                </List.Item>
                <List.Item>
                  <strong>Giám sát an ninh:</strong> Hệ thống được giám sát 24/7
                </List.Item>
              </List>
            </div>

            <Divider />

            <div>
              <Text fw={600} size="lg" mb="md">
                4. Quyền riêng tư của người dùng
              </Text>
              <Text size="sm" mb="md">
                Bạn có các quyền sau đối với thông tin cá nhân:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>
                  <strong>Quyền truy cập:</strong> Xem thông tin cá nhân và lịch sử đánh giá
                </List.Item>
                <List.Item>
                  <strong>Quyền chỉnh sửa:</strong> Cập nhật thông tin cá nhân khi cần thiết
                </List.Item>
                <List.Item>
                  <strong>Quyền xóa:</strong> Yêu cầu xóa dữ liệu (theo quy định công ty)
                </List.Item>
                <List.Item>
                  <strong>Quyền phản đối:</strong> Phản đối việc xử lý dữ liệu không phù hợp
                </List.Item>
                <List.Item>
                  <strong>Quyền khiếu nại:</strong> Khiếu nại về vi phạm quyền riêng tư
                </List.Item>
              </List>
            </div>

            <Divider />

            <div>
              <Text fw={600} size="lg" mb="md">
                5. Chia sẻ thông tin
              </Text>
              <Text size="sm" mb="md">
                Thông tin của bạn có thể được chia sẻ trong các trường hợp:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>
                  <strong>Nội bộ công ty:</strong> Với cấp quản lý trực tiếp và phòng Nhân sự
                </List.Item>
                <List.Item>
                  <strong>Yêu cầu pháp lý:</strong> Khi có yêu cầu từ cơ quan có thẩm quyền
                </List.Item>
                <List.Item>
                  <strong>Bảo vệ quyền lợi:</strong> Để bảo vệ quyền và lợi ích hợp pháp
                </List.Item>
              </List>
              <Text size="sm" mt="md" c="dimmed">
                <strong>Lưu ý:</strong> Chúng tôi KHÔNG bán hoặc cho thuê thông tin cá nhân của bạn
                cho bên thứ ba.
              </Text>
            </div>

            <Divider />

            <div>
              <Text fw={600} size="lg" mb="md">
                6. Lưu trữ dữ liệu
              </Text>
              <Text size="sm" mb="md">
                Dữ liệu của bạn được lưu trữ:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>
                  Trên máy chủ bảo mật của công ty tại Việt Nam
                </List.Item>
                <List.Item>
                  Trong thời gian bạn còn làm việc tại công ty
                </List.Item>
                <List.Item>
                  Sau khi nghỉ việc, dữ liệu được lưu trữ theo quy định pháp luật
                </List.Item>
                <List.Item>
                  Dữ liệu đánh giá được lưu trữ tối thiểu 5 năm để phục vụ kiểm toán
                </List.Item>
              </List>
            </div>

            <Divider />

            <div>
              <Text fw={600} size="lg" mb="md">
                7. Cookies và công nghệ theo dõi
              </Text>
              <Text size="sm" mb="md">
                Hệ thống sử dụng cookies để:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>Duy trì phiên đăng nhập của bạn</List.Item>
                <List.Item>Ghi nhớ tùy chọn và cài đặt</List.Item>
                <List.Item>Phân tích cách sử dụng hệ thống</List.Item>
                <List.Item>Cải thiện trải nghiệm người dùng</List.Item>
              </List>
              <Text size="sm" mt="md" c="dimmed">
                Bạn có thể xóa cookies trong trình duyệt, nhưng điều này có thể ảnh hưởng đến
                chức năng hệ thống.
              </Text>
            </div>

            <Divider />

            <div>
              <Text fw={600} size="lg" mb="md">
                8. Thay đổi chính sách
              </Text>
              <Text size="sm">
                Chúng tôi có quyền cập nhật chính sách bảo mật này. Mọi thay đổi quan trọng sẽ
                được thông báo qua email hoặc thông báo trong hệ thống. Việc tiếp tục sử dụng
                hệ thống sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận chính sách mới.
              </Text>
            </div>

            <Divider />

            <div>
              <Text fw={600} size="lg" mb="md">
                9. Liên hệ
              </Text>
              <Text size="sm" mb="md">
                Nếu bạn có câu hỏi về chính sách bảo mật, vui lòng liên hệ:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>
                  <strong>Email:</strong> privacy@vicenza.vn
                </List.Item>
                <List.Item>
                  <strong>Điện thoại:</strong> (024) 1234 5678
                </List.Item>
                <List.Item>
                  <strong>Địa chỉ:</strong> Văn phòng Chủ tịch Hội đồng quản trị, Công ty cổ phần đầu tư phát triển Vicenza
                </List.Item>
              </List>
            </div>
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
              Cam kết của chúng tôi
            </Text>
            <Text size="sm">
              Công ty cổ phần đầu tư phát triển Vicenza cam kết bảo vệ quyền riêng tư và thông tin cá nhân của tất cả nhân viên.
              Chúng tôi tuân thủ nghiêm ngặt các quy định về bảo vệ dữ liệu cá nhân và luôn
              nỗ lực cải thiện các biện pháp bảo mật.
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}


"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  Stack,
  Title,
  Paper,
  Group,
  Button,
  Text,
  Loader,
  Center,
  Divider,
  Badge,
  Table,
  Grid,
  Card,
} from "@mantine/core";
import { IconArrowLeft, IconUser, IconStar } from "@tabler/icons-react";
import { useAuth } from "@/features/auth/AuthContext";
import { getDanhGiaById } from "@/actions/danh-gia";
import { getAllUsers } from "@/actions/users";
import type { DanhGia, User, BieuMau, KyDanhGia, CauHoi, CauTraLoi } from "@/types/schema";
import { Role } from "@/types/schema";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

export default function ChiTietDanhGiaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [danhGia, setDanhGia] = useState<DanhGia | null>(null);
  const [nguoiDanhGia, setNguoiDanhGia] = useState<User | null>(null);
  const [nguoiDuocDanhGia, setNguoiDuocDanhGia] = useState<User | null>(null);
  const [bieuMau, setBieuMau] = useState<BieuMau | null>(null);
  const [kyDanhGia, setKyDanhGia] = useState<KyDanhGia | null>(null);
  const [cauHois, setCauHois] = useState<CauHoi[]>([]);
  const [cauTraLois, setCauTraLois] = useState<CauTraLoi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
      return;
    }

    if (currentUser) {
      loadData();
    }
  }, [currentUser, authLoading, id]);

  const loadData = async () => {
    if (!currentUser || !id) return;

    setIsLoading(true);
    try {
      const danhGiaResult = await getDanhGiaById(id);

      if (!danhGiaResult.success || !danhGiaResult.data) {
        router.push("/lich-su-danh-gia");
        return;
      }

      const danhGiaData = danhGiaResult.data;
      const nguoiDanhGiaData = danhGiaData.nguoiDanhGia;
      const nguoiDuocDanhGiaData = danhGiaData.nguoiDuocDanhGia;

      if (!nguoiDanhGiaData || !nguoiDuocDanhGiaData) {
        router.push("/lich-su-danh-gia");
        return;
      }

      let canAccess = false;

      if (currentUser.role === Role.admin) {
        canAccess = true;
      } else if (currentUser.role === Role.truong_phong) {
        const usersResult = await getAllUsers();
        const allUsers = usersResult.success && usersResult.data ? usersResult.data : [];
        const departmentUserIds = allUsers
          .filter((u) => u.phongBanId === currentUser.phongBanId && u.trangThaiKH)
          .map((u) => u.id);
        canAccess =
          departmentUserIds.includes(danhGiaData.nguoiDanhGiaId) ||
          departmentUserIds.includes(danhGiaData.nguoiDuocDanhGiaId);
      } else {
        canAccess =
          danhGiaData.nguoiDanhGiaId === currentUser.id ||
          danhGiaData.nguoiDuocDanhGiaId === currentUser.id;
      }

      if (!canAccess) {
        router.push("/lich-su-danh-gia");
        return;
      }

      setHasAccess(true);
      setDanhGia(danhGiaData as any);
      setNguoiDanhGia(nguoiDanhGiaData as any);
      setNguoiDuocDanhGia(nguoiDuocDanhGiaData as any);
      setBieuMau((danhGiaData.bieuMau || null) as any);
      setKyDanhGia((danhGiaData.kyDanhGia || null) as any);
      setCauHois((danhGiaData.bieuMau?.cauHois?.sort((a, b) => a.thuTu - b.thuTu) || []) as any);
      setCauTraLois((danhGiaData.cauTraLois || []) as any);
    } catch (error) {
      console.error("Failed to load evaluation details:", error);
      router.push("/lich-su-danh-gia");
    } finally {
      setIsLoading(false);
    }
  };

  const getPhongBanName = (user: any) => {
    if (!user || !user.phongBan) return "N/A";
    return user.phongBan.tenPhongBan || "N/A";
  };

  const getLoaiDanhGiaBadge = (loai?: string) => {
    switch (loai) {
      case "LANH_DAO":
        return <Badge color="blue">Đánh giá Lãnh đạo</Badge>;
      case "NHAN_VIEN":
        return <Badge color="green">Đánh giá Nhân viên</Badge>;
      default:
        return <Badge color="gray">Khác</Badge>;
    }
  };

  const getAnswerForQuestion = (cauHoiId: string): CauTraLoi | undefined => {
    return cauTraLois.find((ctl) => ctl.cauHoiId === cauHoiId);
  };

  if (authLoading || isLoading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  if (!hasAccess || !danhGia || !nguoiDanhGia || !nguoiDuocDanhGia || !bieuMau || !kyDanhGia) {
    return (
      <Center h={400}>
        <Text c="dimmed">Không tìm thấy đánh giá hoặc bạn không có quyền truy cập</Text>
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Group>
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.back()}
          >
            Quay lại
          </Button>
          <Title order={2}>Chi tiết Đánh giá</Title>
        </Group>
        {getLoaiDanhGiaBadge(bieuMau.loaiDanhGia)}
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder shadow="sm" p="md" radius="md">
            <Group gap="xs" mb="md">
              <IconUser size={20} />
              <Text fw={600}>Người đánh giá</Text>
            </Group>
            <Divider mb="md" />
            <Stack gap="xs">
              <div>
                <Text size="sm" c="dimmed">
                  Họ tên
                </Text>
                <Text fw={500}>{nguoiDanhGia.hoTen || "N/A"}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  Mã nhân viên
                </Text>
                <Text fw={500}>{nguoiDanhGia.maNhanVien}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  Phòng ban
                </Text>
                <Text fw={500}>{getPhongBanName(nguoiDanhGia)}</Text>
              </div>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder shadow="sm" p="md" radius="md">
            <Group gap="xs" mb="md">
              <IconStar size={20} />
              <Text fw={600}>Người được đánh giá</Text>
            </Group>
            <Divider mb="md" />
            <Stack gap="xs">
              <div>
                <Text size="sm" c="dimmed">
                  Họ tên
                </Text>
                <Text fw={500}>{nguoiDuocDanhGia.hoTen || "N/A"}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  Mã nhân viên
                </Text>
                <Text fw={500}>{nguoiDuocDanhGia.maNhanVien}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  Phòng ban
                </Text>
                <Text fw={500}>{getPhongBanName(nguoiDuocDanhGia)}</Text>
              </div>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      <Paper withBorder shadow="sm" p="md" radius="md">
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600} size="lg">
              Thông tin Đánh giá
            </Text>
            <Badge color={danhGia.daHoanThanh ? "green" : "orange"}>
              {danhGia.daHoanThanh ? "Đã hoàn thành" : "Nháp"}
            </Badge>
          </Group>
          <Divider />
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div>
                <Text size="sm" c="dimmed">
                  Biểu mẫu
                </Text>
                <Text fw={500}>{bieuMau.tenBieuMau}</Text>
              </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div>
                <Text size="sm" c="dimmed">
                  Kỳ đánh giá
                </Text>
                <Text fw={500}>{kyDanhGia.tenKy}</Text>
              </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div>
                <Text size="sm" c="dimmed">
                  Điểm trung bình
                </Text>
                <Text fw={500} size="lg" c="blue">
                  {danhGia.diemTrungBinh?.toFixed(2) || "0.00"} / 5.00
                </Text>
              </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div>
                <Text size="sm" c="dimmed">
                  Ngày gửi
                </Text>
                <Text fw={500}>
                  {danhGia.submittedAt
                    ? dayjs(danhGia.submittedAt).format("DD/MM/YYYY HH:mm")
                    : "Chưa gửi"}
                </Text>
              </div>
            </Grid.Col>
          </Grid>
        </Stack>
      </Paper>

      <Paper withBorder shadow="sm" p="md" radius="md">
        <Text fw={600} size="lg" mb="md">
          Câu hỏi và Trả lời
        </Text>
        <Divider mb="md" />
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: "50px" }}>STT</Table.Th>
              <Table.Th>Câu hỏi</Table.Th>
              <Table.Th style={{ width: "100px" }}>Điểm</Table.Th>
              <Table.Th>Nhận xét</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {cauHois.map((cauHoi, index) => {
              const cauTraLoi = getAnswerForQuestion(cauHoi.id);
              return (
                <Table.Tr key={cauHoi.id}>
                  <Table.Td>{index + 1}</Table.Td>
                  <Table.Td>
                    <Text size="sm">{cauHoi.noiDung}</Text>
                    {cauHoi.batBuoc && (
                      <Badge size="xs" color="red" variant="light" ml="xs">
                        Bắt buộc
                      </Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {cauTraLoi ? (
                      <Badge color="blue" variant="light" size="lg">
                        {cauTraLoi.diem} / {cauHoi.diemToiDa}
                      </Badge>
                    ) : (
                      <Text size="sm" c="dimmed">
                        Chưa trả lời
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {cauTraLoi?.nhanXet ? (
                      <Text size="sm">{cauTraLoi.nhanXet}</Text>
                    ) : (
                      <Text size="sm" c="dimmed" fs="italic">
                        Không có nhận xét
                      </Text>
                    )}
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Paper>

      <Paper withBorder shadow="sm" p="md" radius="md">
        <Text fw={600} size="lg" mb="md">
          Nhận xét chung
        </Text>
        <Divider mb="md" />
        <Text
          size="sm"
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            maxWidth: "100%",
          }}
        >
          {danhGia.nhanXetChung || "Không có nhận xét chung"}
        </Text>
      </Paper>
    </Stack>
  );
}


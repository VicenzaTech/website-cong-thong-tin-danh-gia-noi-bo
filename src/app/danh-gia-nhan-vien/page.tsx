"use client";

import { useState, useEffect } from "react";
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
  Badge,
  Card,
  Avatar,
  SimpleGrid,
} from "@mantine/core";
import { IconUsers, IconCalendar, IconCheck, IconClock } from "@tabler/icons-react";
import { useAuth } from "@/features/auth/AuthContext";
import { getActiveKyDanhGias } from "@/actions/ky-danh-gia";
import { getBieuMausByLoai } from "@/actions/bieu-mau";
import { checkExistingDanhGia } from "@/actions/danh-gia";
import { getUsersByPhongBan } from "@/actions/users";
import { LoaiDanhGia, type KyDanhGia, type User, type BieuMau } from "@/types/schema";
import dayjs from "dayjs";

export default function DanhGiaNhanVienPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [kyDanhGias, setKyDanhGias] = useState<KyDanhGia[]>([]);
  const [dongNghieps, setDongNghieps] = useState<User[]>([]);
  const [bieuMau, setBieuMau] = useState<BieuMau | null>(null);
  const [danhGiaStatus, setDanhGiaStatus] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const kyResult = await getActiveKyDanhGias();
      const activeKys = kyResult.success && kyResult.data ? kyResult.data : [];
      setKyDanhGias(activeKys as any);

      const colleaguesResult = await getUsersByPhongBan(currentUser.phongBanId);
      const colleagues = (colleaguesResult.success && colleaguesResult.data ? colleaguesResult.data : [])
        .filter((u) => u.id !== currentUser.id && u.trangThaiKH);
      setDongNghieps(colleagues as any);

      const bieuMauResult = await getBieuMausByLoai(LoaiDanhGia.NHAN_VIEN);
      const bieuMaus = bieuMauResult.success && bieuMauResult.data ? bieuMauResult.data : [];
      
      if (bieuMaus.length > 0) {
        setBieuMau(bieuMaus[0] as any);

        if (activeKys.length > 0) {
          const statusMap: Record<string, boolean> = {};
          for (const colleague of colleagues) {
            const existingResult = await checkExistingDanhGia(
              currentUser.id,
              colleague.id,
              bieuMaus[0].id,
              activeKys[0].id
            );
            statusMap[colleague.id] = !!(existingResult.success && existingResult.data?.daHoanThanh);
          }
          setDanhGiaStatus(statusMap);
        }
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEvaluation = (dongNghiepId: string) => {
    if (bieuMau && kyDanhGias[0]) {
      router.push(
        `/danh-gia-nhan-vien/thuc-hien?nguoiDuocDanhGiaId=${dongNghiepId}&bieuMauId=${bieuMau.id}&kyDanhGiaId=${kyDanhGias[0].id}`
      );
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const completedCount = Object.values(danhGiaStatus).filter(Boolean).length;
  const totalCount = dongNghieps.length;

  if (authLoading || !currentUser) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <Title order={2}>Đánh giá Năng lực Nhân viên</Title>

      {kyDanhGias.length === 0 ? (
        <Paper withBorder shadow="sm" p="xl" radius="md">
          <Center>
            <Stack align="center" gap="md">
              <IconCalendar size={48} color="gray" />
              <Text c="dimmed" size="lg">
                Hiện tại không có kỳ đánh giá nào đang mở
              </Text>
              <Text c="dimmed" size="sm">
                Vui lòng quay lại khi có kỳ đánh giá mới
              </Text>
            </Stack>
          </Center>
        </Paper>
      ) : (
        <Stack gap="lg">
          <Card withBorder shadow="sm" padding="lg" radius="md">
            <Group>
              <IconCalendar size={24} color="var(--mantine-color-blue-6)" />
              <div style={{ flex: 1 }}>
                <Text fw={600} size="lg">
                  {kyDanhGias[0].tenKy}
                </Text>
                <Text size="sm" c="dimmed">
                  {dayjs(kyDanhGias[0].ngayBatDau).format("DD/MM/YYYY")} -{" "}
                  {dayjs(kyDanhGias[0].ngayKetThuc).format("DD/MM/YYYY")}
                </Text>
              </div>
              <Badge color="green" size="lg">
                Đang mở
              </Badge>
            </Group>
          </Card>

          {!bieuMau ? (
            <Paper withBorder shadow="sm" p="xl" radius="md">
              <Center>
                <Stack align="center" gap="md">
                  <IconUsers size={48} color="gray" />
                  <Text c="dimmed" size="lg">
                    Chưa có biểu mẫu đánh giá nhân viên
                  </Text>
                  <Text c="dimmed" size="sm">
                    Vui lòng liên hệ quản trị viên để được hỗ trợ
                  </Text>
                </Stack>
              </Center>
            </Paper>
          ) : dongNghieps.length === 0 ? (
            <Paper withBorder shadow="sm" p="xl" radius="md">
              <Center>
                <Stack align="center" gap="md">
                  <IconUsers size={48} color="gray" />
                  <Text c="dimmed" size="lg">
                    Không có đồng nghiệp nào trong phòng ban
                  </Text>
                  <Text c="dimmed" size="sm">
                    Bạn là người duy nhất trong phòng ban này
                  </Text>
                </Stack>
              </Center>
            </Paper>
          ) : (
            <Stack gap="md">
              <Paper withBorder shadow="sm" p="md" radius="md">
                <Group justify="space-between">
                  <Group>
                    <IconUsers size={24} color="var(--mantine-color-blue-6)" />
                    <div>
                      <Text fw={600} size="lg">
                        Danh sách đồng nghiệp
                      </Text>
                      <Text size="sm" c="dimmed">
                        Biểu mẫu: {bieuMau.tenBieuMau}
                      </Text>
                    </div>
                  </Group>
                  <div style={{ textAlign: "right" }}>
                    <Text size="xl" fw={700} c="blue">
                      {completedCount}/{totalCount}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Đã hoàn thành
                    </Text>
                  </div>
                </Group>
              </Paper>

              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                {dongNghieps.map((dongNghiep) => {
                  const daDanhGia = danhGiaStatus[dongNghiep.id];
                  return (
                    <Card key={dongNghiep.id} withBorder shadow="sm" padding="lg" radius="md">
                      <Stack gap="md">
                        <Group>
                          <Avatar color="blue" radius="xl" size="md">
                            {getInitials(dongNghiep.hoTen)}
                          </Avatar>
                          <div style={{ flex: 1 }}>
                            <Text fw={600}>{dongNghiep.hoTen}</Text>
                            <Text size="xs" c="dimmed">
                              {dongNghiep.maNhanVien}
                            </Text>
                          </div>
                        </Group>

                        {daDanhGia ? (
                          <Badge
                            color="green"
                            size="lg"
                            leftSection={<IconCheck size={16} />}
                            fullWidth
                          >
                            Đã đánh giá
                          </Badge>
                        ) : (
                          <Badge
                            color="orange"
                            size="lg"
                            leftSection={<IconClock size={16} />}
                            fullWidth
                          >
                            Chưa đánh giá
                          </Badge>
                        )}

                        <Button
                          onClick={() => handleStartEvaluation(dongNghiep.id)}
                          disabled={daDanhGia}
                          fullWidth
                          size="sm"
                        >
                          {daDanhGia ? "Đã hoàn thành" : "Bắt đầu đánh giá"}
                        </Button>
                      </Stack>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Stack>
          )}
        </Stack>
      )}
    </Stack>
  );
}


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
  Divider,
} from "@mantine/core";
import { IconUserStar, IconCalendar, IconCheck } from "@tabler/icons-react";
import { useAuth } from "@/features/auth/AuthContext";
import { getActiveKyDanhGias, getBieuMausByLoai, checkExistingDanhGia, getPhongBanById } from "@/actions";
import { LoaiDanhGia } from "@/types/schema";
import dayjs from "dayjs";

export default function DanhGiaLanhDaoPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [kyDanhGias, setKyDanhGias] = useState<any[]>([]);
  const [truongPhong, setTruongPhong] = useState<any>(null);
  const [bieuMau, setBieuMau] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [daDanhGia, setDaDanhGia] = useState(false);

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
    setIsLoading(true);
    try {
      const kyResult = await getActiveKyDanhGias();
      const activeKys = kyResult.success && kyResult.data ? kyResult.data : [];
      setKyDanhGias(activeKys);

      if (currentUser) {
        const phongBanResult = await getPhongBanById(currentUser.phongBanId);
        const phongBan = phongBanResult.success ? phongBanResult.data : null;
        
        if (phongBan?.truongPhong) {
          setTruongPhong(phongBan.truongPhong);

          const bieuMausResult = await getBieuMausByLoai(LoaiDanhGia.LANH_DAO);
          const bieuMaus = bieuMausResult.success && bieuMausResult.data ? bieuMausResult.data : [];
          
          if (bieuMaus.length > 0) {
            setBieuMau(bieuMaus[0]);

            if (activeKys.length > 0) {
              const existingResult = await checkExistingDanhGia(
                currentUser.id,
                phongBan.truongPhong.id,
                bieuMaus[0].id,
                activeKys[0].id
              );
              setDaDanhGia(!!(existingResult.success && existingResult.exists && existingResult.data?.daHoanThanh));
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEvaluation = () => {
    if (truongPhong && bieuMau && kyDanhGias[0]) {
      router.push(
        `/danh-gia-lanh-dao/thuc-hien?nguoiDuocDanhGiaId=${truongPhong.id}&bieuMauId=${bieuMau.id}&kyDanhGiaId=${kyDanhGias[0].id}`
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

  const getPhongBanName = (phongBan: any) => {
    return phongBan?.tenPhongBan || "N/A";
  };

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
      <Title order={2}>Đánh giá Năng lực Lãnh đạo</Title>

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

          {!truongPhong ? (
            <Paper withBorder shadow="sm" p="xl" radius="md">
              <Center>
                <Stack align="center" gap="md">
                  <IconUserStar size={48} color="gray" />
                  <Text c="dimmed" size="lg">
                    Phòng ban của bạn chưa có Trưởng phòng
                  </Text>
                  <Text c="dimmed" size="sm">
                    Vui lòng liên hệ quản trị viên để được hỗ trợ
                  </Text>
                </Stack>
              </Center>
            </Paper>
          ) : !bieuMau ? (
            <Paper withBorder shadow="sm" p="xl" radius="md">
              <Center>
                <Stack align="center" gap="md">
                  <IconUserStar size={48} color="gray" />
                  <Text c="dimmed" size="lg">
                    Chưa có biểu mẫu đánh giá lãnh đạo
                  </Text>
                  <Text c="dimmed" size="sm">
                    Vui lòng liên hệ quản trị viên để được hỗ trợ
                  </Text>
                </Stack>
              </Center>
            </Paper>
          ) : (
            <Card withBorder shadow="sm" padding="lg" radius="md">
              <Stack gap="md">
                <Group>
                  <IconUserStar size={24} color="var(--mantine-color-blue-6)" />
                  <Text fw={600} size="lg">
                    Đánh giá Trưởng phòng
                  </Text>
                </Group>

                <Divider />

                <Group>
                  <Avatar color="blue" radius="xl" size="lg">
                    {getInitials(truongPhong.hoTen)}
                  </Avatar>
                  <div style={{ flex: 1 }}>
                    <Text fw={600} size="lg">
                      {truongPhong.hoTen}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {truongPhong.maNhanVien} • {getPhongBanName(truongPhong.phongBan)}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {truongPhong.email}
                    </Text>
                  </div>
                </Group>

                <Divider />

                <Group justify="space-between">
                  <div>
                    <Text size="sm" c="dimmed">
                      Biểu mẫu
                    </Text>
                    <Text fw={500}>{bieuMau.tenBieuMau}</Text>
                  </div>
                  {daDanhGia ? (
                    <Badge color="green" size="lg" leftSection={<IconCheck size={16} />}>
                      Đã hoàn thành
                    </Badge>
                  ) : (
                    <Badge color="orange" size="lg">
                      Chưa đánh giá
                    </Badge>
                  )}
                </Group>

                <Button
                  size="md"
                  onClick={handleStartEvaluation}
                  disabled={daDanhGia}
                  fullWidth
                >
                  {daDanhGia ? "Bạn đã hoàn thành đánh giá" : "Bắt đầu đánh giá"}
                </Button>
              </Stack>
            </Card>
          )}
        </Stack>
      )}
    </Stack>
  );
}


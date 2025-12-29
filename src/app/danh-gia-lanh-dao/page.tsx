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
import { mockService } from "@/services/mockService";
import { phongBans } from "@/_mock/db";
import { LoaiDanhGia, type KyDanhGia, type User, type BieuMau } from "@/types/schema";
import dayjs from "dayjs";

export default function DanhGiaLanhDaoPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading, canPerformEvaluation } = useAuth();
  const [kyDanhGias, setKyDanhGias] = useState<KyDanhGia[]>([]);
  const [leaders, setLeaders] = useState<User[]>([]);
  const [bieuMau, setBieuMau] = useState<BieuMau | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [danhGiaStatuses, setDanhGiaStatuses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    } else if (!authLoading && currentUser && !canPerformEvaluation) {
      router.push("/xem-danh-gia");
    }
  }, [currentUser, authLoading, canPerformEvaluation, router]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const activeKys = await mockService.kyDanhGias.getActive();
      setKyDanhGias(activeKys);

      if (currentUser) {
        // Fetch leaders with boPhan === "Bộ phận lãnh đạo" and same phongBanId
        const leadersRes = await fetch(`/api/users?boPhan=${encodeURIComponent("Bộ phận lãnh đạo")}&phongBanId=${currentUser.phongBanId}&perPage=200`);
        const leadersData = await leadersRes.json();
        const leadersList = leadersData.items || [];
        setLeaders(leadersList);

        const bieuMaus = await mockService.bieuMaus.getByLoai(LoaiDanhGia.LANH_DAO);
        if (bieuMaus.length > 0) {
          setBieuMau(bieuMaus[0]);

          if (activeKys.length > 0) {
            const statusMap: Record<string, boolean> = {};
            for (const leader of leadersList) {
              try {
                const response = await fetch(`/api/danh-gias/check-status?nguoiDanhGiaId=${currentUser.id}&nguoiDuocDanhGiaId=${leader.id}&bieuMauId=${bieuMaus[0].id}&kyDanhGiaId=${activeKys[0].id}&phongBanId=${currentUser.phongBanId}`);
                const data = await response.json();
                statusMap[leader.id] = data.hasEvaluated && data.daHoanThanh;
              } catch (e) {
                // Fallback to mock service
                const existing = await mockService.danhGias.checkExisting(
                  currentUser.id,
                  leader.id,
                  bieuMaus[0].id,
                  activeKys[0].id
                );
                statusMap[leader.id] = !!existing && existing.daHoanThanh;
              }
            }
            setDanhGiaStatuses(statusMap);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEvaluation = (leaderId: string) => {
    if (bieuMau && kyDanhGias[0]) {
      router.push(
        `/danh-gia-lanh-dao/thuc-hien?nguoiDuocDanhGiaId=${leaderId}&bieuMauId=${bieuMau.id}&kyDanhGiaId=${kyDanhGias[0].id}`
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

  const getPhongBanName = (phongBanId: string) => {
    const phongBan = phongBans.find((pb) => pb.id === phongBanId);
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
      <Paper withBorder shadow="sm" p="sm" radius="md" mb="md">
        <Title order={5}>Thang chấm điểm</Title>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "6px 8px" }}>Nội dung</th>
              <th style={{ textAlign: "center", padding: "6px 8px" }}>Rất kém</th>
              <th style={{ textAlign: "center", padding: "6px 8px" }}>Kém</th>
              <th style={{ textAlign: "center", padding: "6px 8px" }}>Trung bình</th>
              <th style={{ textAlign: "center", padding: "6px 8px" }}>Tốt</th>
              <th style={{ textAlign: "center", padding: "6px 8px" }}>Rất tốt</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "6px 8px" }}>Số điểm đánh giá</td>
              <td style={{ textAlign: "center", padding: "6px 8px" }}>1</td>
              <td style={{ textAlign: "center", padding: "6px 8px" }}>2</td>
              <td style={{ textAlign: "center", padding: "6px 8px" }}>3</td>
              <td style={{ textAlign: "center", padding: "6px 8px" }}>4</td>
              <td style={{ textAlign: "center", padding: "6px 8px" }}>5</td>
            </tr>
          </tbody>
        </table>
      </Paper>
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
          ) : leaders.length === 0 ? (
            <Paper withBorder shadow="sm" p="xl" radius="md">
              <Center>
                <Stack align="center" gap="md">
                  <IconUserStar size={48} color="gray" />
                  <Text c="dimmed" size="lg">
                    Không có lãnh đạo nào để đánh giá
                  </Text>
                  <Text c="dimmed" size="sm">
                    Vui lòng liên hệ quản trị viên để được hỗ trợ
                  </Text>
                </Stack>
              </Center>
            </Paper>
          ) : (
            <Stack gap="md">
              <Group>
                <IconUserStar size={24} color="var(--mantine-color-blue-6)" />
                <Text fw={600} size="lg">
                  Danh sách Lãnh đạo cần đánh giá
                </Text>
              </Group>
              {leaders.map((leader) => {
                const daDanhGia = danhGiaStatuses[leader.id];
                return (
                  <Card key={leader.id} withBorder shadow="sm" padding="lg" radius="md">
                    <Stack gap="md">
                      <Group>
                        <Avatar color="blue" radius="xl" size="lg">
                          {getInitials(leader.hoTen)}
                        </Avatar>
                        <div style={{ flex: 1 }}>
                          <Text fw={600} size="lg">
                            {leader.hoTen}
                          </Text>
                          <Text size="sm" c="dimmed">
                            {leader.maNhanVien} • {getPhongBanName(leader.phongBanId)}
                          </Text>
                          <Text size="sm" c="dimmed">
                            {leader.email}
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
                        onClick={() => handleStartEvaluation(leader.id)}
                        disabled={daDanhGia}
                        fullWidth
                      >
                        {daDanhGia ? "Đã hoàn thành đánh giá" : "Bắt đầu đánh giá"}
                      </Button>
                    </Stack>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Stack>
      )}
    </Stack>
  );
}


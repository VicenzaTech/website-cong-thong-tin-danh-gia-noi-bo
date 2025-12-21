"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Stack,
  Title,
  Paper,
  Table,
  Badge,
  Button,
  Group,
  Text,
  Loader,
  Center,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { IconEdit, IconEye, IconCalendar } from "@tabler/icons-react";
import { useAuth } from "@/features/auth/AuthContext";
import { mockService } from "@/services/mockService";
import type { DanhGia, User, BieuMau, KyDanhGia } from "@/types/schema";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

interface DanhGiaWithDetails extends DanhGia {
  nguoiDuocDanhGia?: User;
  bieuMau?: BieuMau;
  kyDanhGia?: KyDanhGia;
  canEdit?: boolean;
}

export default function LichSuDanhGiaPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [danhGias, setDanhGias] = useState<DanhGiaWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    if (currentUser) {
      loadDanhGias();
    }
  }, [currentUser]);

  const loadDanhGias = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const myDanhGias = await mockService.danhGias.getByNguoiDanhGia(currentUser.id);

      const danhGiasWithDetails = await Promise.all(
        myDanhGias.map(async (dg) => {
          const [nguoiDuocDanhGia, bieuMau, kyDanhGia, canEdit] = await Promise.all([
            mockService.users.getById(dg.nguoiDuocDanhGiaId),
            mockService.bieuMaus.getById(dg.bieuMauId),
            mockService.kyDanhGias.getById(dg.kyDanhGiaId),
            mockService.danhGias.canEdit(dg.id),
          ]);

          return {
            ...dg,
            nguoiDuocDanhGia,
            bieuMau,
            kyDanhGia,
            canEdit,
          };
        })
      );

      // Sort by submission date, newest first
      danhGiasWithDetails.sort((a, b) => {
        const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return dateB - dateA;
      });

      setDanhGias(danhGiasWithDetails);
    } catch (error) {
      console.error("Failed to load evaluation history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (danhGia: DanhGiaWithDetails) => {
    if (!danhGia.bieuMau) return;

    // Determine the edit route based on evaluation type
    if (danhGia.bieuMau.loaiDanhGia === "LANH_DAO") {
      router.push(
        `/danh-gia-lanh-dao/chinh-sua/${danhGia.id}?managerId=${danhGia.nguoiDuocDanhGiaId}&formId=${danhGia.bieuMauId}&kyId=${danhGia.kyDanhGiaId}`
      );
    } else if (danhGia.bieuMau.loaiDanhGia === "NHAN_VIEN") {
      router.push(
        `/danh-gia-nhan-vien/chinh-sua/${danhGia.id}?nguoiDuocDanhGiaId=${danhGia.nguoiDuocDanhGiaId}&bieuMauId=${danhGia.bieuMauId}&kyDanhGiaId=${danhGia.kyDanhGiaId}`
      );
    }
  };

  const handleView = (danhGia: DanhGiaWithDetails) => {
    router.push(`/lich-su-danh-gia/${danhGia.id}`);
  };

  const getLoaiDanhGiaBadge = (loai?: string) => {
    switch (loai) {
      case "LANH_DAO":
        return <Badge color="blue">Lãnh đạo</Badge>;
      case "NHAN_VIEN":
        return <Badge color="green">Nhân viên</Badge>;
      case "TU_DANH_GIA":
        return <Badge color="purple">Tự đánh giá</Badge>;
      default:
        return <Badge color="gray">Khác</Badge>;
    }
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
      <Group justify="space-between">
        <Title order={2}>Lịch sử Đánh giá</Title>
        <Text c="dimmed" size="sm">
          Tổng số: {danhGias.length} đánh giá
        </Text>
      </Group>

      {danhGias.length === 0 ? (
        <Paper withBorder shadow="sm" p="xl" radius="md">
          <Center>
            <Stack align="center" gap="md">
              <IconCalendar size={48} color="gray" />
              <Text c="dimmed" size="lg">
                Bạn chưa có đánh giá nào
              </Text>
              <Text c="dimmed" size="sm">
                Các đánh giá bạn thực hiện sẽ được hiển thị ở đây
              </Text>
              <Group mt="md">
                <Button onClick={() => router.push("/danh-gia-lanh-dao")}>
                  Đánh giá Lãnh đạo
                </Button>
                <Button variant="light" onClick={() => router.push("/danh-gia-nhan-vien")}>
                  Đánh giá Đồng nghiệp
                </Button>
              </Group>
            </Stack>
          </Center>
        </Paper>
      ) : (
        <Paper withBorder shadow="sm" radius="md">
          <Table.ScrollContainer minWidth={800}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Người được đánh giá</Table.Th>
                  <Table.Th>Loại đánh giá</Table.Th>
                  <Table.Th>Biểu mẫu</Table.Th>
                  <Table.Th>Kỳ đánh giá</Table.Th>
                  <Table.Th>Điểm TB</Table.Th>
                  <Table.Th>Ngày gửi</Table.Th>
                  <Table.Th>Trạng thái</Table.Th>
                  <Table.Th>Thao tác</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {danhGias.map((danhGia) => (
                  <Table.Tr key={danhGia.id}>
                    <Table.Td>
                      <div>
                        <Text fw={500}>{danhGia.nguoiDuocDanhGia?.hoTen || "N/A"}</Text>
                        <Text size="xs" c="dimmed">
                          {danhGia.nguoiDuocDanhGia?.maNhanVien || "N/A"}
                        </Text>
                      </div>
                    </Table.Td>
                    <Table.Td>{getLoaiDanhGiaBadge(danhGia.bieuMau?.loaiDanhGia)}</Table.Td>
                    <Table.Td>
                      <Text size="sm">{danhGia.bieuMau?.tenBieuMau || "N/A"}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{danhGia.kyDanhGia?.tenKy || "N/A"}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="blue" variant="light">
                        {danhGia.diemTrungBinh?.toFixed(2) || "0.00"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {danhGia.submittedAt
                          ? dayjs(danhGia.submittedAt).format("DD/MM/YYYY HH:mm")
                          : "N/A"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {danhGia.daHoanThanh ? (
                        <Badge color="green">Đã hoàn thành</Badge>
                      ) : (
                        <Badge color="orange">Nháp</Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="Xem chi tiết">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => handleView(danhGia)}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                        </Tooltip>
                        {danhGia.canEdit && (
                          <Tooltip label="Chỉnh sửa">
                            <ActionIcon
                              variant="light"
                              color="orange"
                              onClick={() => handleEdit(danhGia)}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                        {!danhGia.canEdit && (
                          <Tooltip label="Không thể sửa (đã hết hạn)">
                            <ActionIcon variant="light" color="gray" disabled>
                              <IconEdit size={16} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      )}
    </Stack>
  );
}


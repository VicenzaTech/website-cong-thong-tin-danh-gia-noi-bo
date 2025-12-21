"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Stack,
  Title,
  Paper,
  Group,
  Button,
  Table,
  Text,
  Loader,
  Center,
  Badge,
  Switch,
  ActionIcon,
} from "@mantine/core";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import { useAuth } from "@/features/auth/AuthContext";
import { mockService } from "@/services/mockService";
import { Role, type KyDanhGia } from "@/types/schema";
import { KyDanhGiaFormModal } from "@/features/ky-danh-gia/KyDanhGiaFormModal";
import { DeleteKyDanhGiaModal } from "@/features/ky-danh-gia/DeleteKyDanhGiaModal";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";

export default function KyDanhGiaPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [kyDanhGias, setKyDanhGias] = useState<KyDanhGia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedKy, setSelectedKy] = useState<KyDanhGia | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    if (currentUser?.role !== Role.admin) {
      router.push("/");
      return;
    }
    loadKyDanhGias();
  }, [currentUser, router]);

  const loadKyDanhGias = async () => {
    setIsLoading(true);
    try {
      const data = await mockService.kyDanhGias.getAll();
      setKyDanhGias(data);
    } catch (error) {
      console.error("Failed to load ky danh gias:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDangMo = async (ky: KyDanhGia) => {
    setTogglingId(ky.id);
    try {
      await mockService.kyDanhGias.update(ky.id, {
        dangMo: !ky.dangMo,
      });

      notifications.show({
        title: "Thành công",
        message: ky.dangMo ? "Đã đóng kỳ đánh giá" : "Đã mở kỳ đánh giá",
        color: "green",
      });

      loadKyDanhGias();
    } catch (error) {
      console.error("Failed to toggle ky danh gia:", error);
      notifications.show({
        title: "Lỗi",
        message: "Không thể thay đổi trạng thái kỳ đánh giá",
        color: "red",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleAddKy = () => {
    setSelectedKy(null);
    setIsFormModalOpen(true);
  };

  const handleEditKy = (ky: KyDanhGia) => {
    setSelectedKy(ky);
    setIsFormModalOpen(true);
  };

  const handleDeleteKy = (ky: KyDanhGia) => {
    setSelectedKy(ky);
    setIsDeleteModalOpen(true);
  };

  const handleFormSuccess = () => {
    loadKyDanhGias();
    setIsFormModalOpen(false);
    setSelectedKy(null);
  };

  const handleDeleteSuccess = () => {
    loadKyDanhGias();
    setIsDeleteModalOpen(false);
    setSelectedKy(null);
  };

  const formatDate = (date: Date) => {
    return dayjs(date).format("DD/MM/YYYY");
  };

  const getStatusBadge = (ky: KyDanhGia) => {
    const now = new Date();
    const start = new Date(ky.ngayBatDau);
    const end = new Date(ky.ngayKetThuc);

    if (!ky.dangMo) {
      return <Badge color="gray">Đã đóng</Badge>;
    }

    if (now < start) {
      return <Badge color="blue">Sắp diễn ra</Badge>;
    }

    if (now > end) {
      return <Badge color="orange">Quá hạn</Badge>;
    }

    return <Badge color="green">Đang diễn ra</Badge>;
  };

  if (authLoading || !currentUser) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  if (currentUser.role !== Role.admin) {
    return null;
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Quản lý Kỳ đánh giá</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={handleAddKy}>
          Thêm kỳ đánh giá
        </Button>
      </Group>

      <Paper withBorder shadow="sm" p="md" radius="md">
        {isLoading ? (
          <Center h={200}>
            <Loader />
          </Center>
        ) : kyDanhGias.length === 0 ? (
          <Center h={200}>
            <Text c="dimmed">Chưa có kỳ đánh giá nào</Text>
          </Center>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Tên kỳ</Table.Th>
                <Table.Th>Mô tả</Table.Th>
                <Table.Th>Ngày bắt đầu</Table.Th>
                <Table.Th>Ngày kết thúc</Table.Th>
                <Table.Th>Trạng thái</Table.Th>
                <Table.Th>Mở/Đóng</Table.Th>
                <Table.Th>Thao tác</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {kyDanhGias.map((ky) => (
                <Table.Tr key={ky.id}>
                  <Table.Td>
                    <Text fw={500}>{ky.tenKy}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {ky.moTa || "Không có mô tả"}
                    </Text>
                  </Table.Td>
                  <Table.Td>{formatDate(ky.ngayBatDau)}</Table.Td>
                  <Table.Td>{formatDate(ky.ngayKetThuc)}</Table.Td>
                  <Table.Td>{getStatusBadge(ky)}</Table.Td>
                  <Table.Td>
                    <Switch
                      checked={ky.dangMo}
                      onChange={() => handleToggleDangMo(ky)}
                      disabled={togglingId === ky.id}
                      label={ky.dangMo ? "Đang mở" : "Đã đóng"}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon variant="subtle" color="blue" onClick={() => handleEditKy(ky)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="red" onClick={() => handleDeleteKy(ky)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <KyDanhGiaFormModal
        opened={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedKy(null);
        }}
        kyDanhGia={selectedKy}
        onSuccess={handleFormSuccess}
      />

      <DeleteKyDanhGiaModal
        opened={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedKy(null);
        }}
        kyDanhGia={selectedKy}
        onSuccess={handleDeleteSuccess}
      />
    </Stack>
  );
}


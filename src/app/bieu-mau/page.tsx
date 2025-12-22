"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Stack,
  Title,
  Paper,
  Group,
  Button,
  Select,
  Table,
  Badge,
  ActionIcon,
  Text,
  Loader,
  Center,
} from "@mantine/core";
import { IconPlus, IconEdit, IconEye, IconTrash } from "@tabler/icons-react";
import { useAuth } from "@/features/auth/AuthContext";
import { getAllBieuMaus, deleteBieuMau } from "@/actions";
import { Role, LoaiDanhGia, TrangThaiBieuMau } from "@/types/schema";
import { notifications } from "@mantine/notifications";

export default function BieuMauPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [bieuMaus, setBieuMaus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterLoai, setFilterLoai] = useState<string | null>(null);
  const [filterTrangThai, setFilterTrangThai] = useState<string | null>(null);

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
    loadBieuMaus();
  }, [currentUser, router]);

  const loadBieuMaus = async () => {
    setIsLoading(true);
    try {
      const result = await getAllBieuMaus();
      if (result.success && result.data) {
        setBieuMaus(result.data);
      }
    } catch (error) {
      console.error("Failed to load bieu maus:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBieuMaus = useMemo(() => {
    let filtered = bieuMaus;

    if (filterLoai) {
      filtered = filtered.filter((bm) => bm.loaiDanhGia === filterLoai);
    }

    if (filterTrangThai) {
      filtered = filtered.filter((bm) => bm.trangThai === filterTrangThai);
    }

    return filtered;
  }, [bieuMaus, filterLoai, filterTrangThai]);

  const handleCreate = () => {
    router.push("/bieu-mau/tao-moi");
  };

  const handleEdit = (id: string) => {
    router.push(`/bieu-mau/${id}/chinh-sua`);
  };

  const handlePreview = (id: string) => {
    router.push(`/bieu-mau/${id}/xem-truoc`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa biểu mẫu này?")) return;

    try {
      const result = await deleteBieuMau(id);
      if (result.success) {
        notifications.show({
          title: "Thành công",
          message: "Xóa biểu mẫu thành công",
          color: "green",
        });
        loadBieuMaus();
      } else {
        notifications.show({
          title: "Lỗi",
          message: result.error || "Không thể xóa biểu mẫu",
          color: "red",
        });
      }
    } catch (error) {
      console.error("Failed to delete bieu mau:", error);
      notifications.show({
        title: "Lỗi",
        message: "Không thể xóa biểu mẫu",
        color: "red",
      });
    }
  };

  const getLoaiBadge = (loai: LoaiDanhGia) => {
    return loai === LoaiDanhGia.LANH_DAO ? (
      <Badge color="blue">Lãnh đạo</Badge>
    ) : (
      <Badge color="green">Nhân viên</Badge>
    );
  };

  const getTrangThaiBadge = (trangThai: TrangThaiBieuMau) => {
    const config = {
      [TrangThaiBieuMau.NHAP]: { label: "Nháp", color: "gray" },
      [TrangThaiBieuMau.KICH_HOAT]: { label: "Kích hoạt", color: "green" },
      [TrangThaiBieuMau.VO_HIEU]: { label: "Vô hiệu", color: "red" },
    };
    const { label, color } = config[trangThai];
    return <Badge color={color}>{label}</Badge>;
  };

  const getPhongBanName = (phongBan: any) => {
    if (!phongBan) return "Toàn công ty";
    return phongBan.tenPhongBan || "N/A";
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
        <Title order={2}>Quản lý Biểu mẫu</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
          Tạo biểu mẫu mới
        </Button>
      </Group>

      <Paper withBorder shadow="sm" p="md" radius="md">
        <Group mb="md">
          <Select
            placeholder="Lọc theo loại"
            data={[
              { value: "", label: "Tất cả loại" },
              { value: LoaiDanhGia.LANH_DAO, label: "Lãnh đạo" },
              { value: LoaiDanhGia.NHAN_VIEN, label: "Nhân viên" },
            ]}
            value={filterLoai || ""}
            onChange={(value) => setFilterLoai(value || null)}
            clearable
            style={{ minWidth: 200 }}
          />
          <Select
            placeholder="Lọc theo trạng thái"
            data={[
              { value: "", label: "Tất cả trạng thái" },
              { value: TrangThaiBieuMau.NHAP, label: "Nháp" },
              { value: TrangThaiBieuMau.KICH_HOAT, label: "Kích hoạt" },
              { value: TrangThaiBieuMau.VO_HIEU, label: "Vô hiệu" },
            ]}
            value={filterTrangThai || ""}
            onChange={(value) => setFilterTrangThai(value || null)}
            clearable
            style={{ minWidth: 200 }}
          />
        </Group>

        {isLoading ? (
          <Center h={200}>
            <Loader />
          </Center>
        ) : filteredBieuMaus.length === 0 ? (
          <Center h={200}>
            <Text c="dimmed">Không tìm thấy biểu mẫu nào</Text>
          </Center>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Tên biểu mẫu</Table.Th>
                <Table.Th>Loại</Table.Th>
                <Table.Th>Phạm vi</Table.Th>
                <Table.Th>Trạng thái</Table.Th>
                <Table.Th>Thao tác</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredBieuMaus.map((bieuMau) => (
                <Table.Tr key={bieuMau.id}>
                  <Table.Td>
                    <Text fw={500}>{bieuMau.tenBieuMau}</Text>
                    {bieuMau.moTa && (
                      <Text size="xs" c="dimmed">
                        {bieuMau.moTa}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>{getLoaiBadge(bieuMau.loaiDanhGia)}</Table.Td>
                  <Table.Td>{getPhongBanName(bieuMau.phongBan)}</Table.Td>
                  <Table.Td>{getTrangThaiBadge(bieuMau.trangThai)}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handlePreview(bieuMau.id)}
                        title="Xem trước"
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="green"
                        onClick={() => handleEdit(bieuMau.id)}
                        title="Chỉnh sửa"
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(bieuMau.id)}
                        title="Xóa"
                      >
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
    </Stack>
  );
}


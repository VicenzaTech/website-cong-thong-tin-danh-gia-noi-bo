"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Stack,
  Title,
  Paper,
  Table,
  Badge,
  Group,
  Text,
  Loader,
  Center,
  ActionIcon,
  Tooltip,
  Select,
  Button,
  Flex,
} from "@mantine/core";
import { IconEye, IconRefresh, IconFilter } from "@tabler/icons-react";
import { useAuth } from "@/features/auth/AuthContext";
import { mockService } from "@/services/mockService";
import { users, phongBans } from "@/_mock/db";
import type { DanhGia, User, BieuMau, KyDanhGia, PhongBan } from "@/types/schema";
import { Role, LoaiDanhGia } from "@/types/schema";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

interface DanhGiaWithDetails extends DanhGia {
  nguoiDanhGia?: User;
  nguoiDuocDanhGia?: User;
  bieuMau?: BieuMau;
  kyDanhGia?: KyDanhGia;
  phongBanNguoiDanhGia?: PhongBan;
  phongBanNguoiDuocDanhGia?: PhongBan;
}

export default function XemDanhGiaPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [danhGias, setDanhGias] = useState<DanhGiaWithDetails[]>([]);
  const [filteredDanhGias, setFilteredDanhGias] = useState<DanhGiaWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [kyDanhGias, setKyDanhGias] = useState<KyDanhGia[]>([]);
  const [phongBanList, setPhongBanList] = useState<PhongBan[]>([]);
  
  const [selectedKyId, setSelectedKyId] = useState<string | null>(null);
  const [selectedLoaiDanhGia, setSelectedLoaiDanhGia] = useState<string | null>(null);
  const [selectedPhongBanId, setSelectedPhongBanId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
      return;
    }

    if (currentUser && currentUser.role !== Role.admin && currentUser.role !== Role.truong_phong) {
      router.push("/");
      return;
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    if (currentUser && (currentUser.role === Role.admin || currentUser.role === Role.truong_phong)) {
      loadData();
    }
  }, [currentUser]);

  useEffect(() => {
    applyFilters();
  }, [danhGias, selectedKyId, selectedLoaiDanhGia, selectedPhongBanId]);

  const loadData = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const [allDanhGias, allKyDanhGias, allPhongBans] = await Promise.all([
        mockService.danhGias.getAll(),
        mockService.kyDanhGias.getAll(),
        mockService.phongBans.getAll(),
      ]);

      setKyDanhGias(allKyDanhGias);
      setPhongBanList(allPhongBans);

      let filteredEvaluations: DanhGia[] = [];

      if (currentUser.role === Role.admin) {
        filteredEvaluations = allDanhGias.filter((dg) => dg.daHoanThanh);
      } else if (currentUser.role === Role.truong_phong) {
        const departmentUserIds = users
          .filter((u) => u.phongBanId === currentUser.phongBanId && !u.deletedAt && u.trangThaiKH)
          .map((u) => u.id);
        
        filteredEvaluations = allDanhGias.filter(
          (dg) =>
            dg.daHoanThanh &&
            (departmentUserIds.includes(dg.nguoiDanhGiaId) || departmentUserIds.includes(dg.nguoiDuocDanhGiaId))
        );
      }

      const danhGiasWithDetails = await Promise.all(
        filteredEvaluations.map(async (dg) => {
          const [nguoiDanhGia, nguoiDuocDanhGia, bieuMau, kyDanhGia] = await Promise.all([
            mockService.users.getById(dg.nguoiDanhGiaId),
            mockService.users.getById(dg.nguoiDuocDanhGiaId),
            mockService.bieuMaus.getById(dg.bieuMauId),
            mockService.kyDanhGias.getById(dg.kyDanhGiaId),
          ]);

          const phongBanNguoiDanhGia = nguoiDanhGia
            ? phongBans.find((pb) => pb.id === nguoiDanhGia.phongBanId)
            : undefined;
          const phongBanNguoiDuocDanhGia = nguoiDuocDanhGia
            ? phongBans.find((pb) => pb.id === nguoiDuocDanhGia.phongBanId)
            : undefined;

          return {
            ...dg,
            nguoiDanhGia,
            nguoiDuocDanhGia,
            bieuMau,
            kyDanhGia,
            phongBanNguoiDanhGia,
            phongBanNguoiDuocDanhGia,
          };
        })
      );

      danhGiasWithDetails.sort((a, b) => {
        const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return dateB - dateA;
      });

      // Filter for truong_phong: only show NHAN_VIEN evaluations (not LANH_DAO)
      let finalDanhGias = danhGiasWithDetails;
      if (currentUser.role === Role.truong_phong) {
        finalDanhGias = danhGiasWithDetails.filter(
          (dg) => dg.bieuMau?.loaiDanhGia === LoaiDanhGia.NHAN_VIEN
        );
      }

      setDanhGias(finalDanhGias);
    } catch (error) {
      console.error("Failed to load evaluations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...danhGias];

    if (selectedKyId) {
      filtered = filtered.filter((dg) => dg.kyDanhGiaId === selectedKyId);
    }

    if (selectedLoaiDanhGia) {
      filtered = filtered.filter((dg) => dg.bieuMau?.loaiDanhGia === selectedLoaiDanhGia);
    }

    if (selectedPhongBanId && currentUser?.role === Role.admin) {
      const departmentUserIds = users
        .filter((u) => u.phongBanId === selectedPhongBanId && !u.deletedAt && u.trangThaiKH)
        .map((u) => u.id);
      filtered = filtered.filter(
        (dg) =>
          departmentUserIds.includes(dg.nguoiDanhGiaId) ||
          departmentUserIds.includes(dg.nguoiDuocDanhGiaId)
      );
    }

    setFilteredDanhGias(filtered);
  };

  const handleView = (danhGia: DanhGiaWithDetails) => {
    router.push(`/lich-su-danh-gia/${danhGia.id}`);
  };

  const handleResetFilters = () => {
    setSelectedKyId(null);
    setSelectedLoaiDanhGia(null);
    setSelectedPhongBanId(null);
  };

  const getLoaiDanhGiaBadge = (loai?: string) => {
    switch (loai) {
      case "LANH_DAO":
        return <Badge color="blue">Lãnh đạo</Badge>;
      case "NHAN_VIEN":
        return <Badge color="green">Nhân viên</Badge>;
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

  if (currentUser.role !== Role.admin && currentUser.role !== Role.truong_phong) {
    return null;
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
        <Title order={2}>
          {currentUser.role === Role.admin ? "Xem Tất Cả Đánh Giá" : "Xem Đánh Giá Phòng Ban"}
        </Title>
        <Text c="dimmed" size="sm">
          Tổng số: {filteredDanhGias.length} đánh giá
        </Text>
      </Group>

      <Paper withBorder shadow="sm" p="md" radius="md">
        <Flex gap="md" align="flex-end" wrap="wrap">
          <Select
            label="Kỳ đánh giá"
            placeholder="Tất cả kỳ"
            data={kyDanhGias.map((ky) => ({ value: ky.id, label: ky.tenKy }))}
            value={selectedKyId}
            onChange={(value) => setSelectedKyId(value)}
            clearable
            style={{ flex: 1, minWidth: 200 }}
          />

          <Select
            label="Loại đánh giá"
            placeholder="Tất cả loại"
            data={[
              { value: "LANH_DAO", label: "Đánh giá Lãnh đạo" },
              { value: "NHAN_VIEN", label: "Đánh giá Nhân viên" },
            ]}
            value={selectedLoaiDanhGia}
            onChange={(value) => setSelectedLoaiDanhGia(value)}
            clearable
            style={{ flex: 1, minWidth: 200 }}
          />

          {currentUser.role === Role.admin && (
            <Select
              label="Phòng ban"
              placeholder="Tất cả phòng ban"
              data={phongBanList.map((pb) => ({ value: pb.id, label: pb.tenPhongBan }))}
              value={selectedPhongBanId}
              onChange={(value) => setSelectedPhongBanId(value)}
              clearable
              style={{ flex: 1, minWidth: 200 }}
            />
          )}

          <Button
            variant="light"
            leftSection={<IconRefresh size={16} />}
            onClick={handleResetFilters}
          >
            Đặt lại
          </Button>

          <Button
            variant="light"
            leftSection={<IconRefresh size={16} />}
            onClick={loadData}
          >
            Làm mới
          </Button>
        </Flex>
      </Paper>

      {filteredDanhGias.length === 0 ? (
        <Paper withBorder shadow="sm" p="xl" radius="md">
          <Center>
            <Stack align="center" gap="md">
              <Text c="dimmed" size="lg">
                {selectedKyId || selectedLoaiDanhGia || selectedPhongBanId
                  ? "Không có đánh giá nào khớp với bộ lọc"
                  : "Chưa có đánh giá nào"}
              </Text>
              {(selectedKyId || selectedLoaiDanhGia || selectedPhongBanId) && (
                <Button variant="light" onClick={handleResetFilters}>
                  Xóa bộ lọc
                </Button>
              )}
            </Stack>
          </Center>
        </Paper>
      ) : (
        <Paper withBorder shadow="sm" radius="md">
          <Table.ScrollContainer minWidth={1000}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Người đánh giá</Table.Th>
                  <Table.Th>Người được đánh giá</Table.Th>
                  <Table.Th>Phòng ban</Table.Th>
                  <Table.Th>Loại đánh giá</Table.Th>
                  <Table.Th>Biểu mẫu</Table.Th>
                  <Table.Th>Kỳ đánh giá</Table.Th>
                  <Table.Th>Điểm TB</Table.Th>
                  <Table.Th>Ngày gửi</Table.Th>
                  <Table.Th>Thao tác</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredDanhGias.map((danhGia) => (
                  <Table.Tr key={danhGia.id}>
                    <Table.Td>
                      <div>
                        <Text fw={500}>{danhGia.nguoiDanhGia?.hoTen || "N/A"}</Text>
                        <Text size="xs" c="dimmed">
                          {danhGia.nguoiDanhGia?.maNhanVien || "N/A"}
                        </Text>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <div>
                        <Text fw={500}>{danhGia.nguoiDuocDanhGia?.hoTen || "N/A"}</Text>
                        <Text size="xs" c="dimmed">
                          {danhGia.nguoiDuocDanhGia?.maNhanVien || "N/A"}
                        </Text>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {danhGia.phongBanNguoiDanhGia?.tenPhongBan || "N/A"}
                      </Text>
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
                      <Tooltip label="Xem chi tiết">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => handleView(danhGia)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      </Tooltip>
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


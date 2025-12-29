"use client";

import { useEffect, useState, useMemo, Fragment } from "react";
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
  Divider,
  Collapse,
  Pagination,
} from "@mantine/core";
import { IconEye, IconRefresh, IconFilter } from "@tabler/icons-react";
import { useAuth } from "@/features/auth/AuthContext";
import { mockService } from "@/services/mockService";
import { users, phongBans } from "@/_mock/db";
import type { DanhGia, User, BieuMau, KyDanhGia, PhongBan, CauHoi } from "@/types/schema";
import { Role, LoaiDanhGia } from "@/types/schema";
import "dayjs/locale/vi";
import dayjs from "dayjs";
import * as XLSX from 'xlsx-js-style';

dayjs.locale("vi");

const ITEMS_PER_PAGE = 30;

interface DanhGiaWithDetails extends DanhGia {
  answers: any[];
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
  const [cauHois, setCauHois] = useState<CauHoi[]>([]);

  const [selectedKyId, setSelectedKyId] = useState<string | null>(null);
  const [selectedLoaiDanhGia, setSelectedLoaiDanhGia] = useState<string | null>(null);
  const [selectedPhongBanId, setSelectedPhongBanId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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
    setCurrentPage(1); // Reset to first page when filters change
  }, [danhGias, selectedKyId, selectedLoaiDanhGia, selectedPhongBanId]);

  const loadData = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      // load evaluations from local data folder via API route
      const [allDanhGias, allKyDanhGias, allPhongBans, allCauHois] = await Promise.all([
        fetch(`/api/evaluations/phongban=${currentUser.phongBanId}`).then((r) => r.json()),
        mockService.kyDanhGias.getAll(),
        mockService.phongBans.getAll(),
        mockService.cauHois.getAll(),
      ]);
      console.log("ALL DG :", allDanhGias)
      setKyDanhGias(allKyDanhGias);
      setPhongBanList(allPhongBans);
      setCauHois(allCauHois);
      let filteredEvaluations: DanhGia[] = [];

      if (currentUser.role === Role.admin) {
        // API returns objects from files, ensure we filter completed ones
        filteredEvaluations = allDanhGias.filter((dg: any) => dg.daHoanThanh);
      } else if (currentUser.role === Role.truong_phong) {
        const departmentUserIds = users
          .filter((u) => u.phongBanId === currentUser.phongBanId && !u.deletedAt && u.trangThaiKH)
          .map((u) => u.id);

        filteredEvaluations = allDanhGias.filter((dg: any) =>
          dg.daHoanThanh &&
          (departmentUserIds.includes(dg.nguoiDanhGiaId) || departmentUserIds.includes(dg.nguoiDuocDanhGiaId))
        );
      } else if (currentUser.role === Role.nhan_vien) {
        // nhan_vien can view evaluations where they are either the evaluator or the evaluated person
        filteredEvaluations = allDanhGias.filter((dg: any) =>
          dg.daHoanThanh &&
          (dg.nguoiDanhGiaId === currentUser.id || dg.nguoiDuocDanhGiaId === currentUser.id)
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
            answers: (dg as any).answers,
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

    console.log("Filtered Evaluations: ", filtered);

    setFilteredDanhGias(filtered);
  };

  const paginatedDanhGias = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredDanhGias.slice(startIndex, endIndex);
  }, [filteredDanhGias, currentPage]);

  const totalPages = Math.ceil(filteredDanhGias.length / ITEMS_PER_PAGE);

  const handleView = (danhGia: DanhGiaWithDetails) => {
    setExpandedId((prev) => (prev === danhGia.id ? null : danhGia.id));
  };

  const handleResetFilters = () => {
    setSelectedKyId(null);
    setSelectedLoaiDanhGia(null);
    setSelectedPhongBanId(null);
  };

  const handleExportExcel = () => {
    if (!currentUser) return;

    const targetPhongBanId = currentUser.role === Role.admin && selectedPhongBanId ? selectedPhongBanId : currentUser.phongBanId;
    if (!targetPhongBanId) return;

    const departmentUsers = users.filter(u => u.phongBanId === targetPhongBanId && !u.deletedAt && u.trangThaiKH);

    // Nhóm nhân viên theo bộ phận
    const usersByBoPhan = departmentUsers.reduce((acc, user) => {
      const boPhan = user.boPhan || 'Không xác định';
      if (!acc[boPhan]) {
        acc[boPhan] = [];
      }
      acc[boPhan].push(user);
      return acc;
    }, {} as Record<string, typeof departmentUsers>);

    // Tạo workbook mới
    const wb = XLSX.utils.book_new();

    // Tạo một sheet cho mỗi bộ phận
    Object.keys(usersByBoPhan).forEach(boPhan => {
      const usersInBoPhan = usersByBoPhan[boPhan];
      
      // Tạo dữ liệu với các cột theo yêu cầu
      const rows: any[][] = [
        // Header row - viết hoa, căn giữa (sẽ được xử lý sau nếu cần thư viện styling)
        ['STT', 'HỌ VÀ TÊN', 'MÃ NHÂN VIÊN', 'BỘ PHẬN', 'ĐIỂM ĐÁNH GIÁ', 'ĐIỂM TRỪ']
      ];

      // Thêm dữ liệu cho từng nhân viên
      usersInBoPhan.forEach((user, index) => {
        const userEvaluations = danhGias.filter(dg => dg.nguoiDuocDanhGiaId === user.id);
        const avgScore = userEvaluations.length > 0
          ? userEvaluations.reduce((sum, dg) => sum + (dg.diemTrungBinh || 0), 0) / userEvaluations.length
          : 0;
        
        rows.push([
          index + 1, // STT
          user.hoTen || '', // HỌ VÀ TÊN
          user.maNhanVien || '', // MÃ NHÂN VIÊN
          boPhan, // BỘ PHẬN (giống tên sheet)
          parseFloat(avgScore.toFixed(2)), // ĐIỂM ĐÁNH GIÁ (Điểm TB hiện tại)
          '' // ĐIỂM TRỪ (để trống tạm thời)
        ]);
      });

      // Tạo sheet với tên bộ phận (giới hạn 31 ký tự cho tên sheet Excel)
      const sheetName = boPhan.length > 31 ? boPhan.substring(0, 31) : boPhan;
      const ws = XLSX.utils.aoa_to_sheet(rows);
      
      // Thiết lập độ rộng cột hợp lý
      ws['!cols'] = [
        { wch: 6 },  // STT
        { wch: 25 }, // HỌ VÀ TÊN
        { wch: 15 }, // MÃ NHÂN VIÊN
        { wch: 20 }, // BỘ PHẬN
        { wch: 15 }, // ĐIỂM ĐÁNH GIÁ
        { wch: 12 }  // ĐIỂM TRỪ
      ];

      // Định dạng header: viết hoa, căn giữa, in đậm, nền dark blue, chữ trắng
      const headerStyle = {
        font: { bold: true, color: { rgb: 'FFFFFF' } }, // Chữ trắng, in đậm
        alignment: { horizontal: 'center', vertical: 'center' },
        fill: { fgColor: { rgb: '1E3A8A' } } // Màu nền dark blue
      };

      // Áp dụng style cho hàng header (hàng đầu tiên, index 0)
      const headerRow = 0;
      const columnHeaders = ['A', 'B', 'C', 'D', 'E', 'F'];
      columnHeaders.forEach((col, idx) => {
        const cellAddress = `${col}${headerRow + 1}`;
        if (!ws[cellAddress]) ws[cellAddress] = { v: rows[headerRow][idx] };
        ws[cellAddress].s = headerStyle;
      });
      
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    // Tạo tên file với format ISO 8601
    const iso8601Timestamp = dayjs().format('YYYYMMDDTHHmmss'); // Format: 20250115T143025
    const fileName = `cds_danhgianhansu_${iso8601Timestamp}.xlsx`;
    
    XLSX.writeFile(wb, fileName);
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

  console.log("danhGia.answers", danhGias)

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
          <Button
            variant="light"
            onClick={handleExportExcel}
          >
            Xuất Excel
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
                {paginatedDanhGias.map((danhGia) => (
                  <Fragment key={danhGia.id}>
                    <Table.Tr>
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

                    <Table.Tr>
                      <Table.Td colSpan={9} style={{ padding: 0, borderTop: 0 }}>
                        <Collapse in={expandedId === danhGia.id} transitionDuration={200}>
                          <Paper withBorder p="md" radius="md" m={8}>
                            <Group justify="apart" align="center">
                              <Text fw={700}>Chi tiết: {danhGia.id}</Text>
                              <Button variant="subtle" size="xs" onClick={() => setExpandedId(null)}>
                                Đóng
                              </Button>
                            </Group>

                            <Divider my="sm" />

                            <Stack justify="sm">
                              <Group grow>
                                <div>
                                  <Text fw={600}>Người đánh giá</Text>
                                  <Text size="sm">{danhGia.nguoiDanhGia?.hoTen || "N/A"}</Text>
                                  <Text size="xs" c="dimmed">{danhGia.nguoiDanhGia?.maNhanVien || "N/A"}</Text>
                                </div>

                                <div>
                                  <Text fw={600}>Người được đánh giá</Text>
                                  <Text size="sm">{danhGia.nguoiDuocDanhGia?.hoTen || "N/A"}</Text>
                                  <Text size="xs" c="dimmed">{danhGia.nguoiDuocDanhGia?.maNhanVien || "N/A"}</Text>
                                </div>
                              </Group>

                              <Group>
                                <Text size="sm">Phòng ban: {danhGia.phongBanNguoiDanhGia?.tenPhongBan || "N/A"}</Text>
                                <Text size="sm">Loại: {danhGia.bieuMau?.loaiDanhGia || "N/A"}</Text>
                                <Text size="sm">Biểu mẫu: {danhGia.bieuMau?.tenBieuMau || "N/A"}</Text>
                                <Text size="sm">Kỳ: {danhGia.kyDanhGia?.tenKy || "N/A"}</Text>
                              </Group>

                              <Group>
                                <Badge color="blue" variant="light">Điểm TB: {danhGia.diemTrungBinh?.toFixed(2) || "0.00"}</Badge>
                                <Text size="sm">Ngày gửi: {danhGia.submittedAt ? dayjs(danhGia.submittedAt).format("DD/MM/YYYY HH:mm") : "N/A"}</Text>
                              </Group>

                              <Divider />

                              <div>
                                <Text fw={600} mb="xs">
                                  Nhận xét chung: {danhGia.nhanXetChung || " N/A"}
                                </Text>
                                <Text fw={600}>Câu trả lời</Text>
                                <Stack gap="xs" mt="xs">
                                  {Array.isArray(danhGia.answers) && danhGia.answers.length > 0 ? (
                                    (danhGia.answers as any[]).map((a) => (
                                      <Paper key={a.cauHoiId || Math.random()} withBorder p="sm" radius="sm">
                                        <Group justify="apart">
                                          <Text size="sm">Câu: {cauHois.find(ch => ch.id === a.cauHoiId)?.noiDung || a.cauHoiId}</Text>
                                          <Text size="sm">Điểm: {a.diem}</Text>
                                        </Group>
                                        <Text size="xs" c="dimmed">Nhận xét: {a.nhanXet || "-"}</Text>
                                      </Paper>
                                    ))
                                  ) : (
                                    <Text size="sm" c="dimmed">Không có câu trả lời</Text>
                                  )}
                                </Stack>
                              </div>
                            </Stack>
                          </Paper>
                        </Collapse>
                      </Table.Td>
                    </Table.Tr>
                  </Fragment>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
          
          {totalPages > 1 && (
            <Group justify="center" mt="md" mb="md">
              <Pagination
                total={totalPages}
                value={currentPage}
                onChange={setCurrentPage}
                size="sm"
              />
            </Group>
          )}
        </Paper>
      )}

    </Stack>
  );
}


"use client";

import { useEffect, useState, useMemo, Fragment, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconEye, IconRefresh, IconFilter, IconSortAscending, IconSortDescending } from "@tabler/icons-react";
import { useAuth } from "@/features/auth/AuthContext";
import { mockService } from "@/services/mockService";
import { users, phongBans } from "@/_mock/db";
import { tongHopDiemPhats } from "@/_mock/tongHopDiemPhat";
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

function XemDanhGiaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const theme = useMantineTheme();
  // Sử dụng breakpoint md (992px) để xác định tablet/desktop, giúp iPad Mini (768px) được xử lý như mobile
  const isMobileOrTablet = !useMediaQuery(`(min-width: ${theme.breakpoints.md})`);
  const isMobile = !useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);
  const [danhGias, setDanhGias] = useState<DanhGiaWithDetails[]>([]);
  const [filteredDanhGias, setFilteredDanhGias] = useState<DanhGiaWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [kyDanhGias, setKyDanhGias] = useState<KyDanhGia[]>([]);
  const [phongBanList, setPhongBanList] = useState<PhongBan[]>([]);
  const [boPhanList, setBoPhanList] = useState<string[]>([]);
  const [cauHois, setCauHois] = useState<CauHoi[]>([]);

  const [selectedKyId, setSelectedKyId] = useState<string | null>(null);
  const [selectedLoaiDanhGia, setSelectedLoaiDanhGia] = useState<string | null>(null);
  const [selectedPhongBanId, setSelectedPhongBanId] = useState<string | null>(null);
  const [selectedBoPhan, setSelectedBoPhan] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'az' | null>(null);

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
    const phongBanId = searchParams.get('phongBanId');
    if (phongBanId && currentUser?.role === Role.admin) {
      setSelectedPhongBanId(phongBanId);
    }
  }, [searchParams, currentUser]);

  useEffect(() => {
    applyFilters();
    setCurrentPage(1); // Reset to first page when filters change
  }, [danhGias, selectedKyId, selectedLoaiDanhGia, selectedPhongBanId, sortBy, sortOrder]);

  const loadData = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const phongBanId = searchParams.get('phongBanId');
      const targetPhongBanId = (currentUser.role === Role.admin && phongBanId) ? phongBanId : currentUser.phongBanId;

      // load evaluations from local data folder via API route
      const [allDanhGias, allKyDanhGias, allPhongBans, allCauHois] = await Promise.all([
        fetch(`/api/evaluations/phongban=${targetPhongBanId}`).then((r) => r.json()),
        mockService.kyDanhGias.getAll(),
        mockService.phongBans.getAll(),
        mockService.cauHois.getAll(),
      ]);
      console.log("ALL DG :", allDanhGias)
      setKyDanhGias(allKyDanhGias);
      setPhongBanList(allPhongBans);
      // const targetPhongBanId = (currentUser.role === Role.admin && phongBanId) ? phongBanId : currentUser.phongBanId;
      const departmentUsers = users.filter(u => u.phongBanId === targetPhongBanId);
      const allBoPhan = [...new Set(departmentUsers.map(u => u.boPhan).filter(Boolean))];
      setBoPhanList(allBoPhan);
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
        const boPhanA = a.nguoiDuocDanhGia?.boPhan || "";
        const boPhanB = b.nguoiDuocDanhGia?.boPhan || "";
        if (boPhanA !== boPhanB) {
          return boPhanA.localeCompare(boPhanB);
        }
        const scoreA = a.diemTrungBinh || 0;
        const scoreB = b.diemTrungBinh || 0;
        return scoreB - scoreA;
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

    // Áp dụng sắp xếp
    if (sortBy && sortOrder) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortBy) {
          case 'nguoiDanhGia':
            aValue = a.nguoiDanhGia?.hoTen || '';
            bValue = b.nguoiDanhGia?.hoTen || '';
            break;
          case 'nguoiDuocDanhGia':
            aValue = a.nguoiDuocDanhGia?.hoTen || '';
            bValue = b.nguoiDuocDanhGia?.hoTen || '';
            break;
          case 'boPhan':
            aValue = a.nguoiDuocDanhGia?.boPhan || '';
            bValue = b.nguoiDuocDanhGia?.boPhan || '';
            break;
          case 'phongBan':
            aValue = a.phongBanNguoiDanhGia?.tenPhongBan || '';
            bValue = b.phongBanNguoiDanhGia?.tenPhongBan || '';
            break;
          case 'loaiDanhGia':
            aValue = a.bieuMau?.loaiDanhGia || '';
            bValue = b.bieuMau?.loaiDanhGia || '';
            break;
          case 'bieuMau':
            aValue = a.bieuMau?.tenBieuMau || '';
            bValue = b.bieuMau?.tenBieuMau || '';
            break;
          case 'kyDanhGia':
            aValue = a.kyDanhGia?.tenKy || '';
            bValue = b.kyDanhGia?.tenKy || '';
            break;
          case 'diemTB':
            aValue = a.diemTrungBinh || 0;
            bValue = b.diemTrungBinh || 0;
            break;
          case 'ngayGui':
            aValue = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
            bValue = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
            break;
          default:
            return 0;
        }

        // Xử lý sắp xếp
        if (sortOrder === 'az') {
          // Sắp xếp A-Z (tăng dần theo alphabet cho text, tăng dần cho số)
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return aValue.localeCompare(bValue, 'vi', { sensitivity: 'base' });
          }
          // Với số, A-Z tương đương tăng dần
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else if (sortOrder === 'asc') {
          // Tăng dần
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return aValue.localeCompare(bValue, 'vi', { sensitivity: 'base' });
          }
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else if (sortOrder === 'desc') {
          // Giảm dần
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return bValue.localeCompare(aValue, 'vi', { sensitivity: 'base' });
          }
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }

        return 0;
      });
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
    setSortBy(null);
    setSortOrder(null);
  };

  const handleExportExcel = () => {
    if (!currentUser) return;

    const targetPhongBanId = currentUser.role === Role.admin && selectedPhongBanId ? selectedPhongBanId : currentUser.phongBanId;
    if (!targetPhongBanId) return;

    const departmentUsers = users.filter(u => u.phongBanId === targetPhongBanId && !u.deletedAt && u.trangThaiKH);

    // Tạo map từ mãNhânViên -> tổng điểm phạt
    const diemPhatMap = new Map<string, number>();
    tongHopDiemPhats.forEach(item => {
      if (item.mãNhânViên && item.tổng !== null && item.tổng !== undefined) {
        diemPhatMap.set(item.mãNhânViên, item.tổng);
      }
    });

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
        // Header row - viết hoa, căn giữa
        ['STT', 'HỌ VÀ TÊN', 'MÃ NHÂN VIÊN', 'BỘ PHẬN', 'ĐIỂM ĐÁNH GIÁ', 'ĐIỂM TRỪ']
      ];

      // Lưu thông tin về các dòng có điểm phạt để áp dụng style
      const rowsWithPhat: number[] = [];

      // Thêm dữ liệu cho từng nhân viên
      usersInBoPhan.forEach((user, index) => {
        const userEvaluations = danhGias.filter(dg => dg.nguoiDuocDanhGiaId === user.id);
        const avgScore = userEvaluations.length > 0
          ? userEvaluations.reduce((sum, dg) => sum + (dg.diemTrungBinh || 0), 0) / userEvaluations.length
          : 0;
        
        // Lấy điểm phạt từ map
        const diemPhat = user.maNhanVien ? (diemPhatMap.get(user.maNhanVien) || 0) : 0;
        
        // Lưu số hàng Excel của dòng có điểm phạt (index + 2: +1 cho header, +1 cho Excel 1-based)
        if (diemPhat > 0) {
          rowsWithPhat.push(index + 2);
        }
        
        rows.push([
          index + 1, // STT
          user.hoTen || '', // HỌ VÀ TÊN
          user.maNhanVien || '', // MÃ NHÂN VIÊN
          boPhan, // BỘ PHẬN (giống tên sheet)
          parseFloat(avgScore.toFixed(2)), // ĐIỂM ĐÁNH GIÁ (Điểm TB hiện tại)
          diemPhat > 0 ? diemPhat : '' // ĐIỂM TRỪ
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

      // Style cho dòng có điểm phạt: màu đỏ mờ
      const rowWithPhatStyle = {
        fill: { fgColor: { rgb: 'FFEBEE' } } // Màu đỏ mờ (light red)
      };

      // Áp dụng style cho hàng header (hàng đầu tiên, index 0)
      const headerRow = 0;
      const columnHeaders = ['A', 'B', 'C', 'D', 'E', 'F'];
      columnHeaders.forEach((col, idx) => {
        const cellAddress = `${col}${headerRow + 1}`;
        if (!ws[cellAddress]) ws[cellAddress] = { v: rows[headerRow][idx] };
        ws[cellAddress].s = headerStyle;
      });

      // Áp dụng style màu đỏ mờ cho các dòng có điểm phạt
      // rowsWithPhat chứa số hàng Excel (1-based: 2, 3, 4...)
      rowsWithPhat.forEach(rowNum => {
        columnHeaders.forEach((col) => {
          const cellAddress = `${col}${rowNum}`;
          if (ws[cellAddress]) {
            // Giữ style hiện tại nếu có, thêm màu nền
            if (!ws[cellAddress].s) {
              ws[cellAddress].s = {};
            }
            ws[cellAddress].s.fill = rowWithPhatStyle.fill;
          }
        });
      });
      const safeSheetName = sheetName.replace(/\//g, '-'); // Thay thế ký tự không hợp lệ
      XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
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
    <Stack gap={isMobile ? "md" : "lg"}>
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Title order={2} style={{ fontSize: isMobile ? '1.25rem' : undefined }}>
          {currentUser.role === Role.admin ? "Xem Tất Cả Đánh Giá" : "Xem Đánh Giá Phòng Ban"}
        </Title>
        <Text c="dimmed" size="sm">
          Tổng số: {filteredDanhGias.length} đánh giá
        </Text>
      </Group>

      <Paper withBorder shadow="sm" p={isMobile ? "sm" : "md"} radius="md">
        <Flex gap={isMobile ? "sm" : "md"} align="flex-end" wrap="wrap">
          {/* <Select
            label="Kỳ đánh giá"
            placeholder="Tất cả kỳ"
            data={kyDanhGias.map((ky) => ({ value: ky.id, label: ky.tenKy }))}
            value={selectedKyId}
            onChange={(value) => setSelectedKyId(value)}
            clearable
            style={{ flex: 1, minWidth: isMobile ? '100%' : isMobileOrTablet ? 180 : 200 }}
          /> */}

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
            style={{ flex: 1, minWidth: isMobile ? '100%' : isMobileOrTablet ? 180 : 200 }}
          />

          {currentUser.role === Role.admin && (
            <Select
              label="Phòng ban"
              placeholder="Tất cả phòng ban"
              data={phongBanList.map((pb) => ({ value: pb.id, label: pb.tenPhongBan }))}
              value={selectedPhongBanId}
              onChange={(value) => setSelectedPhongBanId(value)}
              clearable
              style={{ flex: 1, minWidth: isMobile ? '100%' : isMobileOrTablet ? 180 : 200 }}
            />
          )}

          <Select
            label="Sắp xếp theo"
            placeholder="Chọn cột"
            data={[
              { value: 'nguoiDanhGia', label: 'Người đánh giá' },
              { value: 'nguoiDuocDanhGia', label: 'Người được đánh giá' },
              { value: 'boPhan', label: 'Bộ phận' },
              { value: 'phongBan', label: 'Phòng ban' },
              { value: 'loaiDanhGia', label: 'Loại đánh giá' },
              { value: 'bieuMau', label: 'Biểu mẫu' },
              { value: 'kyDanhGia', label: 'Kỳ đánh giá' },
              { value: 'diemTB', label: 'Điểm TB' },
              { value: 'ngayGui', label: 'Ngày gửi' },
            ]}
            value={sortBy}
            onChange={(value) => {
              setSortBy(value);
              if (!value) {
                setSortOrder(null);
              } else if (!sortOrder) {
                // Nếu chưa có sortOrder, mặc định là A-Z cho text, tăng dần cho số
                const isNumeric = value === 'diemTB' || value === 'ngayGui';
                setSortOrder(isNumeric ? 'asc' : 'az');
              }
            }}
            clearable
            style={{ flex: 1, minWidth: isMobile ? '100%' : isMobileOrTablet ? 180 : 200 }}
          />

          <Select
            label="Thứ tự"
            placeholder="Chọn thứ tự"
            data={[
              { value: 'az', label: 'A-Z' },
              { value: 'asc', label: 'Tăng dần' },
              { value: 'desc', label: 'Giảm dần' },
            ]}
            value={sortOrder}
            onChange={(value) => setSortOrder(value as 'asc' | 'desc' | 'az' | null)}
            disabled={!sortBy}
            clearable
            style={{ flex: 1, minWidth: isMobile ? '100%' : isMobileOrTablet ? 150 : 150 }}
          />

          <Button
            variant="light"
            leftSection={<IconRefresh size={16} />}
            onClick={handleResetFilters}
            style={{ flex: isMobile ? '1 1 100%' : '0 1 auto', minWidth: isMobile ? '100%' : 'auto' }}
          >
            Đặt lại
          </Button>

          <Button
            variant="light"
            leftSection={<IconRefresh size={16} />}
            onClick={loadData}
            style={{ flex: isMobile ? '1 1 100%' : '0 1 auto', minWidth: isMobile ? '100%' : 'auto' }}
          >
            Làm mới
          </Button>
          <Button
            variant="light"
            onClick={handleExportExcel}
            style={{ flex: isMobile ? '1 1 100%' : '0 1 auto', minWidth: isMobile ? '100%' : 'auto' }}
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
        <Paper withBorder shadow="sm" radius="md" style={{ overflow: 'hidden' }}>
          <Table.ScrollContainer minWidth={isMobile ? 500 : isMobileOrTablet ? 800 : 1000}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ padding: isMobile ? '8px 4px' : undefined, fontSize: isMobile ? '0.75rem' : undefined }}>
                    Người đánh giá
                  </Table.Th>
                  <Table.Th style={{ padding: isMobile ? '8px 4px' : undefined, fontSize: isMobile ? '0.75rem' : undefined }}>
                    Người được đánh giá
                  </Table.Th>
                  <Table.Th style={{ padding: isMobile ? '8px 4px' : undefined, fontSize: isMobile ? '0.75rem' : undefined }}>
                    Bộ phận
                  </Table.Th>
                  <Table.Th style={{ padding: isMobile ? '8px 4px' : undefined, fontSize: isMobile ? '0.75rem' : undefined }}>
                    Loại đánh giá
                  </Table.Th>
                  <Table.Th style={{ padding: isMobile ? '8px 4px' : undefined, fontSize: isMobile ? '0.75rem' : undefined }}>
                    Biểu mẫu
                  </Table.Th>
                  <Table.Th style={{ padding: isMobile ? '8px 4px' : undefined, fontSize: isMobile ? '0.75rem' : undefined }}>
                    Kỳ đánh giá
                  </Table.Th>
                  <Table.Th style={{ padding: isMobile ? '8px 4px' : undefined, fontSize: isMobile ? '0.75rem' : undefined }}>
                    Điểm TB
                  </Table.Th>
                  <Table.Th style={{ padding: isMobile ? '8px 4px' : undefined, fontSize: isMobile ? '0.75rem' : undefined }}>
                    Ngày gửi
                  </Table.Th>
                  <Table.Th style={{ padding: isMobile ? '8px 4px' : undefined, fontSize: isMobile ? '0.75rem' : undefined }}>
                    Thao tác
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginatedDanhGias.map((danhGia) => (
                  <Fragment key={danhGia.id}>
                    <Table.Tr>
                      <Table.Td style={{ padding: isMobile ? '8px 4px' : undefined }}>
                        <div>
                          <Text fw={500} size={isMobile ? "xs" : "sm"} style={{ lineHeight: 1.3 }}>
                            {danhGia.nguoiDanhGia?.hoTen || "N/A"}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {danhGia.nguoiDanhGia?.maNhanVien || "N/A"}
                          </Text>
                        </div>
                      </Table.Td>
                      <Table.Td style={{ padding: isMobile ? '8px 4px' : undefined }}>
                        <div>
                          <Text fw={500} size={isMobile ? "xs" : "sm"} style={{ lineHeight: 1.3 }}>
                            {danhGia.nguoiDuocDanhGia?.hoTen || "N/A"}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {danhGia.nguoiDuocDanhGia?.maNhanVien || "N/A"}
                          </Text>
                        </div>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {danhGia.nguoiDuocDanhGia?.boPhan || "N/A"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {danhGia.phongBanNguoiDanhGia?.tenPhongBan || "N/A"}
                        </Text>
                      </Table.Td>
                      <Table.Td style={{ padding: isMobile ? '8px 4px' : undefined}}>{getLoaiDanhGiaBadge(danhGia.bieuMau?.loaiDanhGia)}</Table.Td>
                      <Table.Td style={{ padding: isMobile ? '8px 4px' : undefined }}>
                        <Text size={isMobile ? "xs" : "sm"} style={{ lineHeight: 1.3 }}>
                          {danhGia.bieuMau?.tenBieuMau || "N/A"}
                        </Text>
                      </Table.Td>
                      <Table.Td style={{ padding: isMobile ? '8px 4px' : undefined }}>
                        <Text size={isMobile ? "xs" : "sm"} style={{ lineHeight: 1.3 }}>
                          {danhGia.kyDanhGia?.tenKy || "N/A"}
                        </Text>
                      </Table.Td>
                      <Table.Td style={{ padding: isMobile ? '8px 4px' : undefined }}>
                        <Badge color="blue" variant="light" size={isMobile ? "xs" : "sm"}>
                          {danhGia.diemTrungBinh?.toFixed(2) || "0.00"}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ padding: isMobile ? '8px 4px' : undefined }}>
                        <Text size={isMobile ? "xs" : "sm"} style={{ lineHeight: 1.3 }}>
                          {danhGia.submittedAt
                            ? dayjs(danhGia.submittedAt).format(isMobile ? "DD/MM/YY HH:mm" : "DD/MM/YYYY HH:mm")
                            : "N/A"}
                        </Text>
                      </Table.Td>
                      <Table.Td style={{ padding: isMobile ? '8px 4px' : undefined }}>
                        <Tooltip label="Xem chi tiết">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => handleView(danhGia)}
                            size={isMobile ? "sm" : "md"}
                          >
                            <IconEye size={isMobile ? 14 : 16} />
                          </ActionIcon>
                        </Tooltip>
                      </Table.Td>
                    </Table.Tr>

                    <Table.Tr key={`${danhGia.id}-detail`}>
                      <Table.Td colSpan={10} style={{ padding: 0, borderTop: 0 }}>
                        <Collapse in={expandedId === danhGia.id} transitionDuration={200}>
                          <Paper withBorder p={isMobile ? "sm" : "md"} radius="md" m={isMobile ? 4 : 8}>
                            <Group justify="apart" align="center" wrap="wrap" gap="xs">
                              <Text fw={700} style={{ wordBreak: 'break-word' }}>Chi tiết: {danhGia.id}</Text>
                              <Button variant="subtle" size="xs" onClick={() => setExpandedId(null)}>
                                Đóng
                              </Button>
                            </Group>

                            <Divider my="sm" />

                            <Stack justify="sm">
                              <Group grow wrap="wrap">
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

                              <Group wrap="wrap" gap="xs">
                                <Text size="sm">Phòng ban: {danhGia.phongBanNguoiDanhGia?.tenPhongBan || "N/A"}</Text>
                                <Text size="sm">Loại: {danhGia.bieuMau?.loaiDanhGia || "N/A"}</Text>
                                <Text size="sm">Biểu mẫu: {danhGia.bieuMau?.tenBieuMau || "N/A"}</Text>
                                <Text size="sm">Kỳ: {danhGia.kyDanhGia?.tenKy || "N/A"}</Text>
                              </Group>

                              <Group wrap="wrap" gap="xs">
                                <Badge color="blue" variant="light">Điểm TB: {danhGia.diemTrungBinh?.toFixed(2) || "0.00"}</Badge>
                                <Text size="sm">Ngày gửi: {danhGia.submittedAt ? dayjs(danhGia.submittedAt).format("DD/MM/YYYY HH:mm") : "N/A"}</Text>
                              </Group>

                              <Divider />

                              <div>
                                <Text fw={600} mb="xs">
                                  Nhận xét chung: {danhGia.nhanXetChung || "(Không có)"}
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

export default function XemDanhGiaPage() {
  return (
    <Suspense fallback={<Center h={400}><Loader /></Center>}>
      <XemDanhGiaContent />
    </Suspense>
  );
}


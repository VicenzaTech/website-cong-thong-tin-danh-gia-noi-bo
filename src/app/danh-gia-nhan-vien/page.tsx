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
import { mockService } from "@/services/mockService";
import { LoaiDanhGia, Role, type KyDanhGia, type User, type BieuMau } from "@/types/schema";
import { Tabs, Table } from "@mantine/core";
import dayjs from "dayjs";
import React from "react";
import * as XLSX from "xlsx";
import { usePathname } from "next/navigation";

export default function DanhGiaNhanVienPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [kyDanhGias, setKyDanhGias] = useState<KyDanhGia[]>([]);
  const [dongNghieps, setDongNghieps] = useState<User[]>([]);
  const [bieuMau, setBieuMau] = useState<BieuMau | null>(null);
  const [danhGiaStatus, setDanhGiaStatus] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<string>("list");
  const [departmentEvals, setDepartmentEvals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNhanVienId, setSelectedNhanVienId] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, authLoading, router]);
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  // Listen for evaluation completion broadcasts to update UI optimistically
  useEffect(() => {
    if (typeof window === "undefined") return;
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("evaluations");
      const handler = (ev: MessageEvent) => {
        const id = ev.data?.nguoiDuocDanhGiaId;
        if (!id) return;
        setDongNghieps((prev) => prev.filter((u) => u.id !== id));
        setDanhGiaStatus((prev) => ({ ...prev, [id]: true }));
        console.log(danhGiaStatus)
      };
      bc.addEventListener("message", handler);
      return () => {
        bc?.removeEventListener("message", handler);
        bc?.close();
      };
    } catch (e) {
      // ignore if BroadcastChannel not supported
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  // load manager summary when tab active
  useEffect(() => {
    if (activeTab !== "summary" && activeTab !== "export") return;
    if (!currentUser || currentUser.role !== Role.truong_phong) return;
    const loadSummary = async () => {
      try {
        const res = await fetch(`/api/danh-gias/for-department?phongBanId=${currentUser.phongBanId}`);
        const data = await res.json();
        console.log("CHECK DATA: " , data)
        setDepartmentEvals(data.items || []);
      } catch (e) {
        console.error("Failed to load department evaluations", e);
      }
    };
    loadSummary();
  }, [activeTab, currentUser]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const activeKys = await mockService.kyDanhGias.getActive();
      setKyDanhGias(activeKys);

      if (currentUser) {
        let colleagues: any[] = [];

        if (currentUser.role === Role.nhan_vien) {
          if (!currentUser.boPhan) {
            console.warn("Nhân viên không có bộ phận:", currentUser);
          }

          const requests = [
            fetch(
              `/api/users?phongBanId=${currentUser.phongBanId}&role=${Role.truong_phong}&perPage=200`
            ),
          ];

          if (currentUser.boPhan) {
            requests.unshift(
              fetch(
                `/api/users?phongBanId=${currentUser.phongBanId}&boPhan=${encodeURIComponent(currentUser.boPhan)}&role=${Role.nhan_vien}&excludeId=${currentUser.id}&perPage=200`
              )
            );
          }

          const responses = await Promise.all(requests);
          const dataResults = await Promise.all(responses.map(r => r.json()));

          if (currentUser.boPhan) {
            colleagues = [
              ...(dataResults[0].items || []),
              ...(dataResults[1].items || []),
            ];
          } else {
            colleagues = dataResults[0].items || [];
          }
        } else {
          const usersRes = await fetch(
            `/api/users?phongBanId=${currentUser.phongBanId}&excludeId=${currentUser.id}&perPage=200`
          );
          const usersData = await usersRes.json();
          colleagues = usersData.items || [];
        }

        setDongNghieps(colleagues);

        const bieuMaus = await mockService.bieuMaus.getByLoai(LoaiDanhGia.NHAN_VIEN);
        if (bieuMaus.length > 0) {
          setBieuMau(bieuMaus[0]);

          if (activeKys.length > 0) {
            const checkRes = await fetch(`/api/danh-gias/check-status`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                nguoiDanhGiaId: currentUser.id,
                bieuMauId: bieuMaus[0].id,
                kyDanhGiaId: activeKys[0].id,
                nguoiDuocDanhGiaIds: colleagues.map((c: any) => c.id),
                phongBanId: currentUser.phongBanId,
              }),
            });
            const checkData = await checkRes.json();
            console.log("CHECK STATUS DATA:", checkData);
            const statusMap: Record<string, boolean> = checkData.statuses || {};
            setDanhGiaStatus(statusMap);
          }
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
  const handleExportDanhGia = () => {
    const rows = [
      ["Người đánh giá", "Người được đánh giá", "Biểu mẫu", "Điểm TB", "Hoàn thành", "Ngày"],
      ...departmentEvals.map((e) => [
        e.nguoiDanhGiaName,
        e.nguoiDuocDanhGiaName,
        e.bieuMauName,
        e.diemTrungBinh ?? "-",
        e.daHoanThanh ? "Có" : "Chưa",
        e.submittedAt
          ? dayjs(e.submittedAt).format("DD/MM/YYYY HH:mm:ss")
          : "-",
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhGia");

    XLSX.writeFile(workbook, "danh_gia.xlsx");
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
      {currentUser?.role === Role.truong_phong ? (
        <Tabs value={activeTab} onChange={(v) => setActiveTab(v || "list")}>
          <Tabs.List>
            <Tabs.Tab value="list">Danh sách đồng nghiệp</Tabs.Tab>
            <Tabs.Tab value="summary">Tổng hợp đánh giá</Tabs.Tab>
            <Tabs.Tab value="export">Xuất file đánh giá</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      ) : null}

      {activeTab === "summary" && currentUser?.role === Role.truong_phong ? (
        <div>
          <Title order={3}>Danh sách nhân viên trong phòng ban</Title>
          <Stack>
            {dongNghieps.map((nhanVien) => (
              <Card key={nhanVien.id} withBorder shadow="sm" padding="md" radius="md">
                <Group justify="space-between">
                  <Group>
                    <Avatar color="blue" radius="xl" size="md">
                      {getInitials(nhanVien.hoTen)}
                    </Avatar>
                    <Text fw={600}>{nhanVien.hoTen}</Text>
                    <Text size="xs" c="dimmed">{nhanVien.maNhanVien}</Text>
                  </Group>
                  <Button
                    size="xs"
                    onClick={() =>
                      setSelectedNhanVienId(selectedNhanVienId === nhanVien.id ? null : nhanVien.id)
                    }
                  >
                    {selectedNhanVienId === nhanVien.id ? "Đóng" : "Xem đánh giá"}
                  </Button>
                </Group>
                {selectedNhanVienId === nhanVien.id && (
                  <div style={{ marginTop: 16 }}>
                    <Table highlightOnHover withColumnBorders>
                      <thead>
                        <tr>
                          <th style={{ width: 180, textAlign: "left" }}>Người đánh giá</th>
                          <th style={{ width: 220, textAlign: "left" }}>Biểu mẫu</th>
                          <th style={{ width: 100, textAlign: "center" }}>Điểm TB</th>
                          <th style={{ width: 120, textAlign: "center" }}>Hoàn thành</th>
                          <th style={{ width: 180, textAlign: "center" }}>Ngày</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departmentEvals
                          .filter((e) => e.nguoiDuocDanhGiaId === nhanVien.id)
                          .map((e) => (
                            <React.Fragment key={e.id}>
                              <tr>
                                <td style={{ textAlign: "left" }}>{e.nguoiDanhGiaName}</td>
                                <td style={{ textAlign: "left" }}>{e.bieuMauName}</td>
                                <td style={{ textAlign: "center" }}>{e.diemTrungBinh ?? "-"}</td>
                                <td style={{ textAlign: "center" }}>{e.daHoanThanh ? "Có" : "Chưa"}</td>
                                <td style={{ textAlign: "center" }}>
                                  {e.submittedAt ? dayjs(e.submittedAt).format("DD/MM/YYYY HH:mm:ss") : "-"}
                                </td>
                              </tr>
                              {/* Hiển thị chi tiết tiêu chí nếu có */}
                              {/* {e.chiTietTieuChi && Array.isArray(e.chiTietTieuChi) && (
                                <tr>
                                  <td colSpan={5} style={{ background: "#f8f9fa" }}>
                                    <Table withColumnBorders>
                                      <thead>
                                        <tr>
                                          <th style={{ width: 200 }}>Tiêu chí</th>
                                          <th style={{ width: 100 }}>Điểm</th>
                                          <th style={{ width: 300 }}>Nhận xét</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {e.chiTietTieuChi.map((ct: { tenTieuChi: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; diem: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; nhanXet: any; }, idx: React.Key | null | undefined) => (
                                          <tr key={idx}>
                                            <td>{ct.tenTieuChi}</td>
                                            <td style={{ textAlign: "center" }}>{ct.diem}</td>
                                            <td>{ct.nhanXet || ""}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </Table>
                                  </td>
                                </tr>
                              )} */}
                            </React.Fragment>
                          ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card>
            ))}
          </Stack>
        </div>
      ) : null}

      {activeTab === "export" && currentUser?.role === Role.truong_phong ? (
        <div>
          <Title order={3}>Xuất file đánh giá</Title>
          <Text mb="md">Tất cả thông tin đánh giá giữa các nhân viên và lãnh đạo.</Text>
          {/* Nút xuất file, ví dụ xuất CSV */}
          <Button mb="md" onClick={handleExportDanhGia}>
            Xuất file Excel
          </Button>
          <Table highlightOnHover withColumnBorders>
            <thead>
              <tr>
                <th style={{ width: 180 }}>Người đánh giá</th>
                <th style={{ width: 180 }}>Người được đánh giá</th>
                <th style={{ width: 220 }}>Biểu mẫu</th>
                <th style={{ width: 100 }}>Điểm TB</th>
                <th style={{ width: 120 }}>Hoàn thành</th>
                <th style={{ width: 180 }}>Ngày</th>
              </tr>
            </thead>
            <tbody>
              {departmentEvals.map((e) => (
                <tr key={e.id}>
                  <td>{e.nguoiDanhGiaName}</td>
                  <td>{e.nguoiDuocDanhGiaName}</td>
                  <td>{e.bieuMauName}</td>
                  <td>{e.diemTrungBinh ?? "-"}</td>
                  <td>{e.daHoanThanh ? "Có" : "Chưa"}</td>
                  <td>{e.submittedAt ? new Date(e.submittedAt).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : null}
      {activeTab !== "summary" && (
        <>
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
        </>
      )}
    </Stack>
  );
}


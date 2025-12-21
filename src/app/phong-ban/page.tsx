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
  Select,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useAuth } from "@/features/auth/AuthContext";
import { mockService } from "@/services/mockService";
import { phongBans, users } from "@/_mock/db";
import { Role, type PhongBan, type User } from "@/types/schema";
import { notifications } from "@mantine/notifications";

export default function PhongBanPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [phongBanList, setPhongBanList] = useState<PhongBan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
    loadPhongBans();
  }, [currentUser, router]);

  const loadPhongBans = async () => {
    setIsLoading(true);
    try {
      const data = await mockService.phongBans.getAll();
      setPhongBanList(data);
    } catch (error) {
      console.error("Failed to load phong bans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignTruongPhong = async (phongBanId: string, truongPhongId: string | null) => {
    setUpdatingId(phongBanId);
    try {
      await mockService.phongBans.update(phongBanId, {
        truongPhongId: truongPhongId || undefined,
      });

      if (truongPhongId) {
        await mockService.users.update(truongPhongId, {
          role: Role.truong_phong,
        });
      }

      notifications.show({
        title: "Thành công",
        message: "Gán trưởng phòng thành công",
        color: "green",
      });

      loadPhongBans();
    } catch (error) {
      console.error("Failed to assign truong phong:", error);
      notifications.show({
        title: "Lỗi",
        message: "Không thể gán trưởng phòng",
        color: "red",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const getTruongPhongName = (truongPhongId?: string) => {
    if (!truongPhongId) return "Chưa gán";
    const user = users.find((u) => u.id === truongPhongId);
    return user?.hoTen || "N/A";
  };

  const getTruongPhongOptions = (phongBanId: string) => {
    const phongBanUsers = users.filter(
      (u) => u.phongBanId === phongBanId && !u.deletedAt && u.trangThaiKH
    );

    return [
      { value: "", label: "Chưa gán" },
      ...phongBanUsers.map((u) => ({
        value: u.id,
        label: `${u.hoTen} (${u.maNhanVien})`,
      })),
    ];
  };

  const getEmployeeCount = (phongBanId: string) => {
    return users.filter((u) => u.phongBanId === phongBanId && !u.deletedAt).length;
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
        <Title order={2}>Quản lý Phòng ban</Title>
        <Button leftSection={<IconPlus size={16} />} disabled>
          Thêm phòng ban
        </Button>
      </Group>

      <Paper withBorder shadow="sm" p="md" radius="md">
        {isLoading ? (
          <Center h={200}>
            <Loader />
          </Center>
        ) : phongBanList.length === 0 ? (
          <Center h={200}>
            <Text c="dimmed">Không có phòng ban nào</Text>
          </Center>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Tên phòng ban</Table.Th>
                <Table.Th>Mô tả</Table.Th>
                <Table.Th>Trưởng phòng</Table.Th>
                <Table.Th>Số nhân viên</Table.Th>
                <Table.Th>Gán trưởng phòng</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {phongBanList.map((phongBan) => (
                <Table.Tr key={phongBan.id}>
                  <Table.Td>
                    <Text fw={500}>{phongBan.tenPhongBan}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {phongBan.moTa || "Không có mô tả"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {phongBan.truongPhongId ? (
                      <Group gap="xs">
                        <Badge color="blue">{getTruongPhongName(phongBan.truongPhongId)}</Badge>
                      </Group>
                    ) : (
                      <Text c="dimmed" size="sm">
                        Chưa gán
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light">{getEmployeeCount(phongBan.id)}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Select
                      placeholder="Chọn trưởng phòng"
                      data={getTruongPhongOptions(phongBan.id)}
                      value={phongBan.truongPhongId || ""}
                      onChange={(value) => handleAssignTruongPhong(phongBan.id, value)}
                      disabled={updatingId === phongBan.id}
                      searchable
                      style={{ minWidth: 200 }}
                    />
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


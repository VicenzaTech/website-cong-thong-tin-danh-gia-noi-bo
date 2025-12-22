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
import { useAuthSession } from "@/hooks/useAuthSession";
import { getAllPhongBans, updatePhongBan, getUsersByPhongBan, updateUser } from "@/actions";
import { Role } from "@/types/schema";
import { notifications } from "@mantine/notifications";

export default function PhongBanPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuthSession();
  const [phongBanList, setPhongBanList] = useState<any[]>([]);
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
      const result = await getAllPhongBans();
      if (result.success && result.data) {
        setPhongBanList(result.data);
      }
    } catch (error) {
      console.error("Failed to load phong bans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignTruongPhong = async (phongBanId: string, truongPhongId: string | null) => {
    setUpdatingId(phongBanId);
    try {
      const result = await updatePhongBan(phongBanId, {
        truongPhongId: truongPhongId || undefined,
      });

      if (!result.success) {
        notifications.show({
          title: "Lỗi",
          message: result.error || "Không thể gán trưởng phòng",
          color: "red",
        });
        setUpdatingId(null);
        return;
      }

      if (truongPhongId) {
        await updateUser(truongPhongId, {
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

  const getTruongPhongName = (phongBan: any) => {
    if (!phongBan.truongPhong) return "Chưa gán";
    return phongBan.truongPhong.hoTen || "N/A";
  };

  const getTruongPhongOptions = (phongBanId: string) => {
    const phongBan = phongBanList.find((pb: any) => pb.id === phongBanId);
    const phongBanUsers = phongBan?.users || [];

    return [
      { value: "", label: "Chưa gán" },
      ...phongBanUsers.map((u: any) => ({
        value: u.id,
        label: `${u.hoTen} (${u.maNhanVien})`,
      })),
    ];
  };

  const getEmployeeCount = (phongBan: any) => {
    return phongBan._count?.users || 0;
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
                        <Badge color="blue">{getTruongPhongName(phongBan)}</Badge>
                      </Group>
                    ) : (
                      <Text c="dimmed" size="sm">
                        Chưa gán
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light">{getEmployeeCount(phongBan)}</Badge>
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


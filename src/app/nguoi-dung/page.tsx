"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Stack,
  Title,
  Paper,
  Group,
  Button,
  TextInput,
  Select,
  Table,
  Badge,
  ActionIcon,
  Text,
  Pagination,
  Loader,
  Center,
} from "@mantine/core";
import { IconSearch, IconPlus, IconEdit, IconTrash, IconUserOff } from "@tabler/icons-react";
import { useAuth } from "@/features/auth/AuthContext";
import { mockService } from "@/services/mockService";
import { phongBans } from "@/_mock/db";
import { Role, type User } from "@/types/schema";
import { UserFormModal } from "@/features/users/UserFormModal";
import { DeleteUserModal } from "@/features/users/DeleteUserModal";

const ITEMS_PER_PAGE = 10;

export default function NguoiDungPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPhongBan, setFilterPhongBan] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await mockService.users.getAll();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.maNhanVien.toLowerCase().includes(query) ||
          user.hoTen?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
      );
    }

    if (filterPhongBan) {
      filtered = filtered.filter((user) => user.phongBanId === filterPhongBan);
    }

    if (currentUser?.role === Role.truong_phong) {
      filtered = filtered.filter((user) => user.phongBanId === currentUser.phongBanId);
    } else if (currentUser?.role === Role.nhan_vien) {
      filtered = filtered.filter((user) => user.phongBanId === currentUser.phongBanId);
    }

    return filtered;
  }, [users, searchQuery, filterPhongBan, currentUser]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsFormModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsFormModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleFormSuccess = () => {
    loadUsers();
    setIsFormModalOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteSuccess = () => {
    loadUsers();
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const getRoleBadge = (role: Role) => {
    const roleConfig = {
      [Role.admin]: { label: "Quản trị viên", color: "red" },
      [Role.truong_phong]: { label: "Trưởng phòng", color: "blue" },
      [Role.nhan_vien]: { label: "Nhân viên", color: "green" },
    };
    const config = roleConfig[role];
    return <Badge color={config.color}>{config.label}</Badge>;
  };

  const getPhongBanName = (phongBanId: string) => {
    const phongBan = phongBans.find((pb) => pb.id === phongBanId);
    return phongBan?.tenPhongBan || "N/A";
  };

  const phongBanOptions = phongBans
    .filter((pb) => !pb.deletedAt)
    .map((pb) => ({
      value: pb.id,
      label: pb.tenPhongBan,
    }));

  const canEdit = currentUser?.role === Role.admin;

  if (authLoading || !currentUser) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Quản lý Người dùng</Title>
        {canEdit && (
          <Button leftSection={<IconPlus size={16} />} onClick={handleAddUser}>
            Thêm người dùng
          </Button>
        )}
      </Group>

      <Paper withBorder shadow="sm" p="md" radius="md">
        <Group mb="md">
          <TextInput
            placeholder="Tìm kiếm theo mã NV, họ tên, email..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.currentTarget.value);
              setCurrentPage(1);
            }}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Lọc theo phòng ban"
            data={[{ value: "", label: "Tất cả phòng ban" }, ...phongBanOptions]}
            value={filterPhongBan || ""}
            onChange={(value) => {
              setFilterPhongBan(value || null);
              setCurrentPage(1);
            }}
            clearable
            style={{ minWidth: 200 }}
          />
        </Group>

        {isLoading ? (
          <Center h={200}>
            <Loader />
          </Center>
        ) : paginatedUsers.length === 0 ? (
          <Center h={200}>
            <Text c="dimmed">Không tìm thấy người dùng nào</Text>
          </Center>
        ) : (
          <>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Mã NV</Table.Th>
                  <Table.Th>Họ tên</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Phòng ban</Table.Th>
                  <Table.Th>Vai trò</Table.Th>
                  <Table.Th>Trạng thái</Table.Th>
                  {canEdit && <Table.Th>Thao tác</Table.Th>}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginatedUsers.map((user) => (
                  <Table.Tr key={user.id}>
                    <Table.Td>{user.maNhanVien}</Table.Td>
                    <Table.Td>{user.hoTen || "Chưa cập nhật"}</Table.Td>
                    <Table.Td>{user.email || "Chưa cập nhật"}</Table.Td>
                    <Table.Td>{getPhongBanName(user.phongBanId)}</Table.Td>
                    <Table.Td>{getRoleBadge(user.role)}</Table.Td>
                    <Table.Td>
                      <Badge color={user.trangThaiKH ? "green" : "red"} variant="light">
                        {user.trangThaiKH ? "Hoạt động" : "Vô hiệu"}
                      </Badge>
                    </Table.Td>
                    {canEdit && (
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => handleEditUser(user)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color={user.trangThaiKH ? "orange" : "red"}
                            onClick={() => handleDeleteUser(user)}
                          >
                            {user.trangThaiKH ? <IconUserOff size={16} /> : <IconTrash size={16} />}
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    )}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {totalPages > 1 && (
              <Group justify="center" mt="md">
                <Pagination
                  total={totalPages}
                  value={currentPage}
                  onChange={setCurrentPage}
                  size="sm"
                />
              </Group>
            )}
          </>
        )}
      </Paper>

      <UserFormModal
        opened={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={handleFormSuccess}
      />

      <DeleteUserModal
        opened={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={handleDeleteSuccess}
      />
    </Stack>
  );
}


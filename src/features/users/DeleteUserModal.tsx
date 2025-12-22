"use client";

import { useState } from "react";
import { Modal, Stack, Text, Button, Group, Alert } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { updateUser, deleteUser } from "@/actions";

interface DeleteUserModalProps {
  opened: boolean;
  onClose: () => void;
  user: any;
  onSuccess: () => void;
}

export function DeleteUserModal({ opened, onClose, user, onSuccess }: DeleteUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const isActive = user.trangThaiKH;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      if (isActive) {
        const result = await updateUser(user.id, {
          trangThaiKH: false,
        });

        if (!result.success) {
          notifications.show({
            title: "Lỗi",
            message: result.error || "Không thể vô hiệu hóa người dùng",
            color: "red",
          });
          setIsLoading(false);
          return;
        }

        notifications.show({
          title: "Thành công",
          message: "Vô hiệu hóa người dùng thành công",
          color: "orange",
        });
      } else {
        const result = await deleteUser(user.id);

        if (!result.success) {
          notifications.show({
            title: "Lỗi",
            message: result.error || "Không thể xóa người dùng",
            color: "red",
          });
          setIsLoading(false);
          return;
        }

        notifications.show({
          title: "Thành công",
          message: "Xóa người dùng thành công",
          color: "green",
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to delete/disable user:", error);
      notifications.show({
        title: "Lỗi",
        message: "Không thể thực hiện thao tác",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isActive ? "Vô hiệu hóa người dùng" : "Xóa người dùng"}
      size="md"
    >
      <Stack gap="md">
        <Alert icon={<IconAlertTriangle size={16} />} color={isActive ? "orange" : "red"}>
          {isActive
            ? "Bạn có chắc chắn muốn vô hiệu hóa người dùng này?"
            : "Bạn có chắc chắn muốn xóa vĩnh viễn người dùng này?"}
        </Alert>

        <Stack gap="xs">
          <Group>
            <Text fw={500} w={120}>
              Mã nhân viên:
            </Text>
            <Text>{user.maNhanVien}</Text>
          </Group>
          <Group>
            <Text fw={500} w={120}>
              Họ tên:
            </Text>
            <Text>{user.hoTen || "Chưa cập nhật"}</Text>
          </Group>
          <Group>
            <Text fw={500} w={120}>
              Email:
            </Text>
            <Text>{user.email || "Chưa cập nhật"}</Text>
          </Group>
        </Stack>

        {isActive ? (
          <Text size="sm" c="dimmed">
            Người dùng sẽ không thể đăng nhập vào hệ thống. Bạn có thể kích hoạt lại sau.
          </Text>
        ) : (
          <Text size="sm" c="dimmed">
            Thao tác này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị xóa.
          </Text>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button color={isActive ? "orange" : "red"} onClick={handleConfirm} loading={isLoading}>
            {isActive ? "Vô hiệu hóa" : "Xóa"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}


"use client";

import { useState } from "react";
import { Modal, Stack, Text, Button, Group, Alert } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { deleteKyDanhGia } from "@/actions/ky-danh-gia";
import type { KyDanhGia } from "@/types/schema";
import dayjs from "dayjs";

interface DeleteKyDanhGiaModalProps {
  opened: boolean;
  onClose: () => void;
  kyDanhGia: KyDanhGia | null;
  onSuccess: () => void;
}

export function DeleteKyDanhGiaModal({
  opened,
  onClose,
  kyDanhGia,
  onSuccess,
}: DeleteKyDanhGiaModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!kyDanhGia) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const result = await deleteKyDanhGia(kyDanhGia.id);

      if (!result.success) {
        notifications.show({
          title: "Lỗi",
          message: result.error || "Không thể xóa kỳ đánh giá",
          color: "red",
        });
        return;
      }

      notifications.show({
        title: "Thành công",
        message: "Xóa kỳ đánh giá thành công",
        color: "green",
      });

      onSuccess();
    } catch (error) {
      console.error("Failed to delete ky danh gia:", error);
      notifications.show({
        title: "Lỗi",
        message: "Không thể xóa kỳ đánh giá",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return dayjs(date).format("DD/MM/YYYY");
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Xóa kỳ đánh giá" size="md">
      <Stack gap="md">
        <Alert icon={<IconAlertTriangle size={16} />} color="red">
          Bạn có chắc chắn muốn xóa kỳ đánh giá này?
        </Alert>

        <Stack gap="xs">
          <Group>
            <Text fw={500} w={120}>
              Tên kỳ:
            </Text>
            <Text>{kyDanhGia.tenKy}</Text>
          </Group>
          <Group>
            <Text fw={500} w={120}>
              Thời gian:
            </Text>
            <Text>
              {formatDate(kyDanhGia.ngayBatDau)} - {formatDate(kyDanhGia.ngayKetThuc)}
            </Text>
          </Group>
          <Group>
            <Text fw={500} w={120}>
              Trạng thái:
            </Text>
            <Text>{kyDanhGia.dangMo ? "Đang mở" : "Đã đóng"}</Text>
          </Group>
        </Stack>

        <Text size="sm" c="dimmed">
          Cảnh báo: Tất cả dữ liệu đánh giá liên quan đến kỳ này sẽ bị ảnh hưởng. Thao tác này
          không thể hoàn tác.
        </Text>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button color="red" onClick={handleConfirm} loading={isLoading}>
            Xóa
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}


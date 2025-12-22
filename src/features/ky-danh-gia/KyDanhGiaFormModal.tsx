"use client";

import { useEffect, useState } from "react";
import { Modal, Stack, TextInput, Textarea, Button, Group, Switch } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { createKyDanhGia, updateKyDanhGia } from "@/actions/ky-danh-gia";
import type { KyDanhGia } from "@/types/schema";

interface KyDanhGiaFormModalProps {
  opened: boolean;
  onClose: () => void;
  kyDanhGia: KyDanhGia | null;
  onSuccess: () => void;
}

export function KyDanhGiaFormModal({
  opened,
  onClose,
  kyDanhGia,
  onSuccess,
}: KyDanhGiaFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!kyDanhGia;

  const form = useForm({
    initialValues: {
      tenKy: "",
      moTa: "",
      ngayBatDau: new Date(),
      ngayKetThuc: new Date(),
      dangMo: true,
    },
    validate: {
      tenKy: (value) => {
        if (!value) return "Vui lòng nhập tên kỳ đánh giá";
        if (value.length < 3) return "Tên kỳ phải có ít nhất 3 ký tự";
        return null;
      },
      ngayBatDau: (value) => (!value ? "Vui lòng chọn ngày bắt đầu" : null),
      ngayKetThuc: (value, values) => {
        if (!value) return "Vui lòng chọn ngày kết thúc";
        if (value <= values.ngayBatDau) return "Ngày kết thúc phải sau ngày bắt đầu";
        return null;
      },
    },
  });

  useEffect(() => {
    if (opened) {
      if (kyDanhGia) {
        form.setValues({
          tenKy: kyDanhGia.tenKy,
          moTa: kyDanhGia.moTa || "",
          ngayBatDau: new Date(kyDanhGia.ngayBatDau),
          ngayKetThuc: new Date(kyDanhGia.ngayKetThuc),
          dangMo: kyDanhGia.dangMo,
        });
      } else {
        form.reset();
      }
    }
  }, [opened, kyDanhGia]);

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);
    try {
      let result;
      
      if (isEditing && kyDanhGia) {
        result = await updateKyDanhGia(kyDanhGia.id, {
          tenKy: values.tenKy,
          moTa: values.moTa || undefined,
          ngayBatDau: values.ngayBatDau,
          ngayKetThuc: values.ngayKetThuc,
          dangMo: values.dangMo,
        });

        if (!result.success) {
          notifications.show({
            title: "Lỗi",
            message: result.error || "Không thể cập nhật kỳ đánh giá",
            color: "red",
          });
          return;
        }

        notifications.show({
          title: "Thành công",
          message: "Cập nhật kỳ đánh giá thành công",
          color: "green",
        });
      } else {
        result = await createKyDanhGia({
          tenKy: values.tenKy,
          moTa: values.moTa || undefined,
          ngayBatDau: values.ngayBatDau,
          ngayKetThuc: values.ngayKetThuc,
          dangMo: values.dangMo,
        });

        if (!result.success) {
          notifications.show({
            title: "Lỗi",
            message: result.error || "Không thể tạo kỳ đánh giá",
            color: "red",
          });
          return;
        }

        notifications.show({
          title: "Thành công",
          message: "Thêm kỳ đánh giá thành công",
          color: "green",
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to save ky danh gia:", error);
      notifications.show({
        title: "Lỗi",
        message: "Không thể lưu kỳ đánh giá",
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
      title={isEditing ? "Chỉnh sửa kỳ đánh giá" : "Thêm kỳ đánh giá mới"}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Tên kỳ đánh giá"
            placeholder="VD: Đánh giá Quý 1/2024"
            required
            {...form.getInputProps("tenKy")}
          />

          <Textarea
            label="Mô tả"
            placeholder="Nhập mô tả về kỳ đánh giá"
            rows={3}
            {...form.getInputProps("moTa")}
          />

          <DatePickerInput
            label="Ngày bắt đầu"
            placeholder="Chọn ngày bắt đầu"
            required
            valueFormat="DD/MM/YYYY"
            {...form.getInputProps("ngayBatDau")}
          />

          <DatePickerInput
            label="Ngày kết thúc"
            placeholder="Chọn ngày kết thúc"
            required
            valueFormat="DD/MM/YYYY"
            {...form.getInputProps("ngayKetThuc")}
          />

          <Switch
            label="Mở kỳ đánh giá"
            description="Bật để cho phép nhân viên thực hiện đánh giá"
            {...form.getInputProps("dangMo", { type: "checkbox" })}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" loading={isLoading}>
              {isEditing ? "Cập nhật" : "Thêm mới"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}


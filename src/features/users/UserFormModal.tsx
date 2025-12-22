"use client";

import { useEffect, useState } from "react";
import { Modal, Stack, TextInput, Select, Button, Group, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { createUser, updateUser, getAllPhongBans } from "@/actions";
import { Role } from "@/types/schema";

interface UserFormModalProps {
  opened: boolean;
  onClose: () => void;
  user: any;
  onSuccess: () => void;
}

export function UserFormModal({ opened, onClose, user, onSuccess }: UserFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [phongBans, setPhongBans] = useState<any[]>([]);
  const isEditing = !!user;

  useEffect(() => {
    loadPhongBans();
  }, []);

  const loadPhongBans = async () => {
    const result = await getAllPhongBans();
    if (result.success && result.data) {
      setPhongBans(result.data);
    }
  };

  const form = useForm({
    initialValues: {
      maNhanVien: "",
      hoTen: "",
      email: "",
      phongBanId: "",
      role: Role.nhan_vien,
      trangThaiKH: true,
    },
    validate: {
      maNhanVien: (value) => {
        if (!value) return "Vui lòng nhập mã nhân viên";
        if (value.length < 3) return "Mã nhân viên phải có ít nhất 3 ký tự";
        return null;
      },
      hoTen: (value) => {
        if (!value) return "Vui lòng nhập họ tên";
        if (value.length < 3) return "Họ tên phải có ít nhất 3 ký tự";
        return null;
      },
      email: (value) => {
        if (!value) return "Vui lòng nhập email";
        if (!/^\S+@\S+$/.test(value)) return "Email không hợp lệ";
        return null;
      },
      phongBanId: (value) => (!value ? "Vui lòng chọn phòng ban" : null),
      role: (value) => (!value ? "Vui lòng chọn vai trò" : null),
    },
  });

  useEffect(() => {
    if (opened) {
      if (user) {
        form.setValues({
          maNhanVien: user.maNhanVien,
          hoTen: user.hoTen || "",
          email: user.email || "",
          phongBanId: user.phongBanId,
          role: user.role,
          trangThaiKH: user.trangThaiKH,
        });
      } else {
        form.reset();
      }
    }
  }, [opened, user]);

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);
    try {
      if (isEditing && user) {
        const result = await updateUser(user.id, {
          hoTen: values.hoTen,
          email: values.email,
          phongBanId: values.phongBanId,
          role: values.role,
          trangThaiKH: values.trangThaiKH,
        });

        if (!result.success) {
          notifications.show({
            title: "Lỗi",
            message: result.error || "Không thể cập nhật người dùng",
            color: "red",
          });
          setIsLoading(false);
          return;
        }

        notifications.show({
          title: "Thành công",
          message: "Cập nhật người dùng thành công",
          color: "green",
        });
      } else {
        const result = await createUser({
          maNhanVien: values.maNhanVien,
          hoTen: values.hoTen,
          email: values.email,
          matKhau: "123456",
          phongBanId: values.phongBanId,
          role: values.role,
        });

        if (!result.success) {
          if (result.error?.includes("đã tồn tại")) {
            form.setFieldError("maNhanVien", result.error);
          } else {
            notifications.show({
              title: "Lỗi",
              message: result.error || "Không thể tạo người dùng",
              color: "red",
            });
          }
          setIsLoading(false);
          return;
        }

        notifications.show({
          title: "Thành công",
          message: "Tạo người dùng mới thành công",
          color: "green",
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to save user:", error);
      notifications.show({
        title: "Lỗi",
        message: "Không thể lưu thông tin người dùng",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const phongBanOptions = phongBans.map((pb: any) => ({
    value: pb.id,
    label: pb.tenPhongBan,
  }));

  const roleOptions = [
    { value: Role.admin, label: "Quản trị viên" },
    { value: Role.truong_phong, label: "Trưởng phòng" },
    { value: Role.nhan_vien, label: "Nhân viên" },
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Mã nhân viên"
            placeholder="Nhập mã nhân viên"
            required
            disabled={isEditing}
            {...form.getInputProps("maNhanVien")}
          />

          <TextInput
            label="Họ và tên"
            placeholder="Nhập họ và tên đầy đủ"
            required
            {...form.getInputProps("hoTen")}
          />

          <TextInput
            label="Email"
            placeholder="example@company.com"
            type="email"
            required
            {...form.getInputProps("email")}
          />

          <Select
            label="Phòng ban"
            placeholder="Chọn phòng ban"
            data={phongBanOptions}
            required
            searchable
            {...form.getInputProps("phongBanId")}
          />

          <Select
            label="Vai trò"
            placeholder="Chọn vai trò"
            data={roleOptions}
            required
            {...form.getInputProps("role")}
          />

          <Switch
            label="Trạng thái hoạt động"
            description="Bật để cho phép người dùng đăng nhập"
            {...form.getInputProps("trangThaiKH", { type: "checkbox" })}
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


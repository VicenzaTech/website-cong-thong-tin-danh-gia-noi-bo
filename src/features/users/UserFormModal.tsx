"use client";

import { useEffect, useState } from "react";
import { Modal, Stack, TextInput, Select, Button, Group, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { mockService } from "@/services/mockService";
import { phongBans } from "@/_mock/db";
import { Role, type User } from "@/types/schema";

interface UserFormModalProps {
  opened: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

export function UserFormModal({ opened, onClose, user, onSuccess }: UserFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!user;

  const form = useForm({
    initialValues: {
      maNhanVien: "",
      hoTen: "",
      email: "",
      phongBanId: "",
      role: Role.nhan_vien,
      trangThaiKH: true,
      boPhan: "",
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
      boPhan: (value) => (!value ? "Vui lòng chọn bộ phận" : null),
    },
  });

  const defaultBoPhanList: string[] = [
    "Bộ phận lãnh đạo",
    "Bộ phận nghiệp vụ",
    "Tổ xe con",
  ];
  const [boPhanOptions, setBoPhanOptions] = useState<{ value: string; label: string }[]>(
    defaultBoPhanList.map((v) => ({ value: v, label: v }))
  );

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
          boPhan: user.boPhan || "",
        });
        // ensure current boPhan is present in options
        if (user.boPhan) {
          setBoPhanOptions((prev) => {
            if (prev.some((p) => p.value === user.boPhan)) return prev;
            return [{ value: user.boPhan, label: user.boPhan }, ...prev];
          });
        }
      } else {
        form.reset();
      }
    }
  }, [opened, user]);

  // load boPhan options when phongBanId changes
  useEffect(() => {
    const pbId = form.values.phongBanId;
    if (!pbId) {
      setBoPhanOptions(defaultBoPhanList.map((v) => ({ value: v, label: v })));
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/users?phongBanId=${encodeURIComponent(pbId)}&perPage=200`);
        if (!res.ok) throw new Error("Failed to fetch departments");
        const body = await res.json();
        const items = body.items || [];
        const distinct = Array.from(
          new Set(items.map((it: any) => it.boPhan).filter(Boolean))
        ) as string[];
        const options = distinct.length
          ? distinct.map((v: string) => ({ value: v, label: v }))
          : defaultBoPhanList.map((v) => ({ value: v, label: v }));
        if (mounted) setBoPhanOptions(options);
      } catch (err) {
        if (mounted) setBoPhanOptions(defaultBoPhanList.map((v) => ({ value: v, label: v })));
      }
    })();

    return () => {
      mounted = false;
    };
  }, [form.values.phongBanId]);

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);
    try {
      if (isEditing && user) {
        await mockService.users.update(user.id, {
          hoTen: values.hoTen,
          email: values.email,
          phongBanId: values.phongBanId,
          role: values.role,
          trangThaiKH: values.trangThaiKH,
          boPhan: values.boPhan
        });

        notifications.show({
          title: "Thành công",
          message: "Cập nhật người dùng thành công",
          color: "green",
        });
      } else {
        const existingUser = await mockService.users.getByMaNhanVien(values.maNhanVien);
        if (existingUser) {
          form.setFieldError("maNhanVien", "Mã nhân viên đã tồn tại");
          setIsLoading(false);
          return;
        }

        // persist to server-side sqlite via API
        const res = await fetch(`/api/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            maNhanVien: values.maNhanVien,
            hoTen: values.hoTen,
            email: values.email,
            phongBanId: values.phongBanId,
            role: values.role,
            trangThaiKH: values.trangThaiKH,
            boPhan: values.boPhan,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || "Failed to create user");
        }

        notifications.show({
          title: "Thành công",
          message: "Thêm người dùng thành công",
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

  const phongBanOptions = phongBans
    .filter((pb) => !pb.deletedAt)
    .map((pb) => ({
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

          <Select
            label="Bộ phận"
            placeholder="Chọn bộ phận"
            data={boPhanOptions}
            required
            searchable
            {...form.getInputProps("boPhan")}
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


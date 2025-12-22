"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Stack,
  Title,
  Paper,
  Group,
  Button,
  TextInput,
  Textarea,
  Select,
  Switch,
  Text,
  Loader,
  Center,
  Divider,
  ActionIcon,
  Card,
  Checkbox,
  NumberInput,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { IconPlus, IconTrash, IconGripVertical, IconEye } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { getBieuMauById, createBieuMau, updateBieuMau, getAllPhongBans } from "@/actions";
import {
  LoaiDanhGia,
  PhamViApDung,
  TrangThaiBieuMau,
} from "@/types/schema";
import { useAuth } from "@/features/auth/AuthContext";

interface BieuMauFormBuilderProps {
  bieuMauId?: string;
}

interface CauHoiForm {
  id: string;
  noiDung: string;
  diemToiDa: number;
  batBuoc: boolean;
}

export function BieuMauFormBuilder({ bieuMauId }: BieuMauFormBuilderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { colorScheme } = useMantineColorScheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [cauHois, setCauHois] = useState<CauHoiForm[]>([]);
  const [phongBans, setPhongBans] = useState<any[]>([]);
  const isEditing = !!bieuMauId;

  const form = useForm({
    initialValues: {
      tenBieuMau: "",
      moTa: "",
      loaiDanhGia: LoaiDanhGia.NHAN_VIEN,
      phamViApDung: PhamViApDung.TOAN_CONG_TY,
      phongBanId: "",
      trangThai: TrangThaiBieuMau.NHAP,
    },
    validate: {
      tenBieuMau: (value) => {
        if (!value) return "Vui lòng nhập tên biểu mẫu";
        if (value.length < 3) return "Tên biểu mẫu phải có ít nhất 3 ký tự";
        return null;
      },
      phongBanId: (value, values) => {
        if (values.phamViApDung === PhamViApDung.PHONG_BAN && !value) {
          return "Vui lòng chọn phòng ban";
        }
        return null;
      },
    },
  });

  useEffect(() => {
    loadPhongBans();
    if (isEditing && bieuMauId) {
      loadBieuMau();
    }
  }, [bieuMauId, isEditing]);

  const loadPhongBans = async () => {
    try {
      const result = await getAllPhongBans();
      if (result.success && result.data) {
        setPhongBans(result.data);
      }
    } catch (error) {
      console.error("Failed to load phong bans:", error);
    }
  };

  const loadBieuMau = async () => {
    setIsLoading(true);
    try {
      const result = await getBieuMauById(bieuMauId!);
      if (result.success && result.data) {
        const bieuMau = result.data;
        form.setValues({
          tenBieuMau: bieuMau.tenBieuMau,
          moTa: bieuMau.moTa || "",
          loaiDanhGia: bieuMau.loaiDanhGia as any,
          phamViApDung: bieuMau.phamViApDung as any,
          phongBanId: bieuMau.phongBanId || "",
          trangThai: bieuMau.trangThai as any,
        });

        setCauHois(
          bieuMau.cauHois?.map((ch: any) => ({
            id: ch.id,
            noiDung: ch.noiDung,
            diemToiDa: ch.diemToiDa,
            batBuoc: ch.batBuoc,
          })) || []
        );
      }
    } catch (error) {
      console.error("Failed to load bieu mau:", error);
      notifications.show({
        title: "Lỗi",
        message: "Không thể tải biểu mẫu",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCauHoi = () => {
    setCauHois([
      ...cauHois,
      {
        id: `temp_${Date.now()}`,
        noiDung: "",
        diemToiDa: 5,
        batBuoc: true,
      },
    ]);
  };

  const handleRemoveCauHoi = (index: number) => {
    setCauHois(cauHois.filter((_, i) => i !== index));
  };

  const handleCauHoiChange = (index: number, field: keyof CauHoiForm, value: unknown) => {
    const updated = [...cauHois];
    updated[index] = { ...updated[index], [field]: value };
    setCauHois(updated);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(cauHois);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCauHois(items);
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (cauHois.length === 0) {
      notifications.show({
        title: "Lỗi",
        message: "Vui lòng thêm ít nhất một câu hỏi",
        color: "red",
      });
      return;
    }

    const emptyCauHoi = cauHois.find((ch) => !ch.noiDung.trim());
    if (emptyCauHoi) {
      notifications.show({
        title: "Lỗi",
        message: "Vui lòng nhập nội dung cho tất cả câu hỏi",
        color: "red",
      });
      return;
    }

    setIsSaving(true);
    try {
      const cauHoiData = cauHois.map((ch, index) => ({
        noiDung: ch.noiDung,
        thuTu: index + 1,
        diemToiDa: ch.diemToiDa,
        batBuoc: ch.batBuoc,
      }));

      if (isEditing && bieuMauId) {
        const result = await updateBieuMau(bieuMauId, {
          tenBieuMau: values.tenBieuMau,
          moTa: values.moTa,
          trangThai: values.trangThai,
          phongBanId: values.phamViApDung === PhamViApDung.PHONG_BAN ? values.phongBanId : undefined,
        });

        if (!result.success) {
          throw new Error(result.error);
        }
      } else {
        const result = await createBieuMau({
          tenBieuMau: values.tenBieuMau,
          moTa: values.moTa,
          loaiDanhGia: values.loaiDanhGia,
          phamViApDung: values.phamViApDung,
          phongBanId: values.phamViApDung === PhamViApDung.PHONG_BAN ? values.phongBanId : undefined,
          nguoiTaoId: user?.id || "",
          cauHois: cauHoiData,
        });

        if (!result.success) {
          throw new Error(result.error);
        }
      }

      notifications.show({
        title: "Thành công",
        message: isEditing ? "Cập nhật biểu mẫu thành công" : "Tạo biểu mẫu thành công",
        color: "green",
      });

      router.push("/bieu-mau");
    } catch (error) {
      console.error("Failed to save bieu mau:", error);
      notifications.show({
        title: "Lỗi",
        message: error instanceof Error ? error.message : "Không thể lưu biểu mẫu",
        color: "red",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const phongBanOptions = phongBans
    .filter((pb) => !pb.deletedAt)
    .map((pb) => ({
      value: pb.id,
      label: pb.tenPhongBan,
    }));

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2}>{isEditing ? "Chỉnh sửa biểu mẫu" : "Tạo biểu mẫu mới"}</Title>
          <Group>
            <Button variant="subtle" onClick={() => router.push("/bieu-mau")}>
              Hủy
            </Button>
            <Button
              leftSection={<IconEye size={16} />}
              variant="light"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? "Ẩn xem trước" : "Xem trước"}
            </Button>
            <Button type="submit" loading={isSaving}>
              {isEditing ? "Cập nhật" : "Tạo mới"}
            </Button>
          </Group>
        </Group>

        <Paper withBorder shadow="sm" p="lg" radius="md">
          <Stack gap="md">
            <Title order={4}>Thông tin chung</Title>

            <TextInput
              label="Tên biểu mẫu"
              placeholder="VD: Đánh giá năng lực lãnh đạo"
              required
              {...form.getInputProps("tenBieuMau")}
            />

            <Textarea
              label="Mô tả"
              placeholder="Nhập mô tả về biểu mẫu"
              rows={3}
              {...form.getInputProps("moTa")}
            />

            <Select
              label="Loại đánh giá"
              required
              data={[
                { value: LoaiDanhGia.LANH_DAO, label: "Đánh giá lãnh đạo" },
                { value: LoaiDanhGia.NHAN_VIEN, label: "Đánh giá nhân viên" },
              ]}
              {...form.getInputProps("loaiDanhGia")}
            />

            <Select
              label="Phạm vi áp dụng"
              required
              data={[
                { value: PhamViApDung.TOAN_CONG_TY, label: "Toàn công ty" },
                { value: PhamViApDung.PHONG_BAN, label: "Phòng ban cụ thể" },
              ]}
              {...form.getInputProps("phamViApDung")}
            />

            {form.values.phamViApDung === PhamViApDung.PHONG_BAN && (
              <Select
                label="Chọn phòng ban"
                placeholder="Chọn phòng ban áp dụng"
                data={phongBanOptions}
                required
                searchable
                {...form.getInputProps("phongBanId")}
              />
            )}

            <Select
              label="Trạng thái"
              required
              data={[
                { value: TrangThaiBieuMau.NHAP, label: "Nháp" },
                { value: TrangThaiBieuMau.KICH_HOAT, label: "Kích hoạt" },
                { value: TrangThaiBieuMau.VO_HIEU, label: "Vô hiệu" },
              ]}
              {...form.getInputProps("trangThai")}
            />
          </Stack>
        </Paper>

        <Paper withBorder shadow="sm" p="lg" radius="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={4}>Danh sách câu hỏi ({cauHois.length})</Title>
              <Button leftSection={<IconPlus size={16} />} onClick={handleAddCauHoi} size="sm">
                Thêm câu hỏi
              </Button>
            </Group>

            {cauHois.length === 0 ? (
              <Center h={100}>
                <Text c="dimmed">Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.</Text>
              </Center>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="cau-hois">
                  {(provided) => (
                    <Stack gap="sm" {...provided.droppableProps} ref={provided.innerRef}>
                      {cauHois.map((cauHoi, index) => (
                        <Draggable key={cauHoi.id} draggableId={cauHoi.id} index={index}>
                          {(provided) => (
                            <Card
                              withBorder
                              padding="md"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              <Group align="flex-start" wrap="nowrap">
                                <div {...provided.dragHandleProps}>
                                  <IconGripVertical size={20} style={{ cursor: "grab" }} />
                                </div>

                                <Stack gap="sm" style={{ flex: 1 }}>
                                  <Group align="flex-start">
                                    <Text fw={500} size="sm">
                                      Câu {index + 1}
                                    </Text>
                                  </Group>

                                  <TextInput
                                    placeholder="Nhập nội dung câu hỏi"
                                    value={cauHoi.noiDung}
                                    onChange={(e) =>
                                      handleCauHoiChange(index, "noiDung", e.currentTarget.value)
                                    }
                                    required
                                  />

                                  <Group>
                                    <NumberInput
                                      label="Điểm tối đa"
                                      value={cauHoi.diemToiDa}
                                      onChange={(value) =>
                                        handleCauHoiChange(index, "diemToiDa", value)
                                      }
                                      min={1}
                                      max={10}
                                      style={{ width: 120 }}
                                    />

                                    <Checkbox
                                      label="Bắt buộc"
                                      checked={cauHoi.batBuoc}
                                      onChange={(e) =>
                                        handleCauHoiChange(index, "batBuoc", e.currentTarget.checked)
                                      }
                                      mt="xl"
                                    />
                                  </Group>
                                </Stack>

                                <ActionIcon
                                  color="red"
                                  variant="subtle"
                                  onClick={() => handleRemoveCauHoi(index)}
                                >
                                  <IconTrash size={18} />
                                </ActionIcon>
                              </Group>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Stack>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </Stack>
        </Paper>

        {showPreview && (
          <Paper 
            withBorder 
            shadow="sm" 
            p="lg" 
            radius="md" 
            bg={colorScheme === "dark" ? "dark.7" : "gray.0"}
          >
            <Stack gap="md">
              <Title order={4}>Xem trước biểu mẫu</Title>
              <Divider />

              <div>
                <Text size="xl" fw={600} mb="xs">
                  {form.values.tenBieuMau || "Tên biểu mẫu"}
                </Text>
                {form.values.moTa && (
                  <Text size="sm" c="dimmed">
                    {form.values.moTa}
                  </Text>
                )}
              </div>

              <Stack gap="lg">
                {cauHois.map((cauHoi, index) => (
                  <div key={cauHoi.id}>
                    <Text fw={500} mb="xs">
                      {index + 1}. {cauHoi.noiDung || "Nội dung câu hỏi"}
                      {cauHoi.batBuoc && (
                        <Text component="span" c="red">
                          {" "}
                          *
                        </Text>
                      )}
                    </Text>
                    <Group>
                      {Array.from({ length: cauHoi.diemToiDa }, (_, i) => (
                        <Button key={i} variant="outline" size="sm" disabled>
                          {i + 1}
                        </Button>
                      ))}
                    </Group>
                  </div>
                ))}
              </Stack>

              <Divider />
              <Textarea label="Nhận xét chung" placeholder="Nhập nhận xét..." rows={3} disabled />
            </Stack>
          </Paper>
        )}
      </Stack>
    </form>
  );
}


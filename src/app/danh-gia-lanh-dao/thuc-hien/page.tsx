"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Stack,
  Title,
  Paper,
  Group,
  Button,
  Text,
  Loader,
  Center,
  Avatar,
  Divider,
  Textarea,
  Radio,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle, IconUserStar } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useAuth } from "@/features/auth/AuthContext";
import { getBieuMauById, getUserById, createDanhGia } from "@/actions";

function ThucHienDanhGiaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuth();

  const nguoiDuocDanhGiaId = searchParams.get("nguoiDuocDanhGiaId");
  const bieuMauId = searchParams.get("bieuMauId");
  const kyDanhGiaId = searchParams.get("kyDanhGiaId");

  const [nguoiDuocDanhGia, setNguoiDuocDanhGia] = useState<any>(null);
  const [bieuMau, setBieuMau] = useState<any>(null);
  const [cauHois, setCauHois] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<{
    answers: Record<string, number>;
    nhanXetChung: string;
  }>({
    initialValues: {
      answers: {},
      nhanXetChung: "",
    },
    validate: {
      nhanXetChung: (value) => {
        if (!value || value.trim().length === 0) {
          return "Vui lòng nhập nhận xét chung";
        }
        if (value.trim().length < 10) {
          return "Nhận xét phải có ít nhất 10 ký tự";
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (!nguoiDuocDanhGiaId || !bieuMauId || !kyDanhGiaId) {
      router.push("/danh-gia-lanh-dao");
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const userResult = await getUserById(nguoiDuocDanhGiaId!);
        if (!cancelled && userResult.success && userResult.data) {
          setNguoiDuocDanhGia(userResult.data);
        }

        const bmResult = await getBieuMauById(bieuMauId!);
        if (!cancelled && bmResult.success && bmResult.data) {
          setBieuMau(bmResult.data);
          setCauHois(bmResult.data.cauHois || []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load data:", error);
          notifications.show({
            title: "Lỗi",
            message: "Không thể tải dữ liệu đánh giá",
            color: "red",
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [nguoiDuocDanhGiaId, bieuMauId, kyDanhGiaId, router]);

  const handleSubmit = async (values: typeof form.values) => {
    if (!currentUser) {
      notifications.show({
        title: "Lỗi",
        message: "Vui lòng đăng nhập lại",
        color: "red",
      });
      router.push("/login");
      return;
    }

    const requiredCauHois = cauHois.filter((ch) => ch.batBuoc);
    const missingAnswers = requiredCauHois.filter((ch) => !values.answers[ch.id]);

    if (missingAnswers.length > 0) {
      notifications.show({
        title: "Thiếu câu trả lời",
        message: "Vui lòng trả lời tất cả câu hỏi bắt buộc",
        color: "orange",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const cauTraLois = Object.entries(values.answers).map(([cauHoiId, diem]) => ({
        cauHoiId,
        diem,
      }));

      const result = await createDanhGia({
        nguoiDanhGiaId: currentUser.id,
        nguoiDuocDanhGiaId: nguoiDuocDanhGiaId!,
        bieuMauId: bieuMauId!,
        kyDanhGiaId: kyDanhGiaId!,
        nhanXetChung: values.nhanXetChung,
        cauTraLois,
      });

      if (result.success) {
        notifications.show({
          title: "Thành công",
          message: "Đánh giá của bạn đã được gửi thành công",
          color: "green",
        });
        router.push("/danh-gia-lanh-dao");
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Failed to submit evaluation:", error);
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể gửi đánh giá",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getPhongBanName = (phongBan: any) => {
    return phongBan?.tenPhongBan || "N/A";
  };

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  if (!nguoiDuocDanhGia || !bieuMau) {
    return (
      <Center h={400}>
        <Text c="dimmed">Không tìm thấy thông tin đánh giá</Text>
      </Center>
    );
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2}>Thực hiện Đánh giá</Title>
          <Button variant="subtle" onClick={() => router.push("/danh-gia-lanh-dao")}>
            Hủy
          </Button>
        </Group>

        <Paper withBorder shadow="sm" p="lg" radius="md">
          <Stack gap="md">
            <Group>
              <IconUserStar size={24} color="var(--mantine-color-blue-6)" />
              <Text fw={600} size="lg">
                Thông tin người được đánh giá
              </Text>
            </Group>

            <Divider />

            <Group>
              <Avatar color="blue" radius="xl" size="lg">
                {getInitials(nguoiDuocDanhGia.hoTen)}
              </Avatar>
              <div>
                <Text fw={600} size="lg">
                  {nguoiDuocDanhGia.hoTen}
                </Text>
                <Text size="sm" c="dimmed">
                  {nguoiDuocDanhGia.maNhanVien} •{" "}
                  {getPhongBanName(nguoiDuocDanhGia.phongBan)}
                </Text>
              </div>
            </Group>

            <Alert color="blue" icon={<IconAlertCircle size={16} />}>
              Biểu mẫu: <strong>{bieuMau.tenBieuMau}</strong>
            </Alert>
          </Stack>
        </Paper>

        <Paper withBorder shadow="sm" p="lg" radius="md">
          <Stack gap="xl">
            <Title order={4}>Câu hỏi đánh giá</Title>

            {cauHois.map((cauHoi, index) => (
              <div key={cauHoi.id}>
                <Text fw={500} mb="sm">
                  {index + 1}. {cauHoi.noiDung}
                  {cauHoi.batBuoc && (
                    <Text component="span" c="red">
                      {" "}
                      *
                    </Text>
                  )}
                </Text>

                <Radio.Group
                  value={form.values.answers[cauHoi.id]?.toString() || ""}
                  onChange={(value) =>
                    form.setFieldValue("answers", {
                      ...form.values.answers,
                      [cauHoi.id]: parseInt(value),
                    })
                  }
                >
                  <Group>
                    {Array.from({ length: cauHoi.diemToiDa }, (_, i) => (
                      <Radio key={i + 1} value={(i + 1).toString()} label={`${i + 1}`} />
                    ))}
                  </Group>
                </Radio.Group>

                {index < cauHois.length - 1 && <Divider mt="md" />}
              </div>
            ))}
          </Stack>
        </Paper>

        <Paper withBorder shadow="sm" p="lg" radius="md">
          <Stack gap="md">
            <Title order={4}>Nhận xét chung</Title>

            <Textarea
              placeholder="Nhập nhận xét tổng quan về người được đánh giá..."
              rows={6}
              required
              {...form.getInputProps("nhanXetChung")}
            />

            <Text size="xs" c="dimmed">
              * Nhận xét chung là bắt buộc và phải có ít nhất 10 ký tự
            </Text>
          </Stack>
        </Paper>

        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => router.push("/danh-gia-lanh-dao")}>
            Hủy
          </Button>
          <Button type="submit" loading={isSubmitting} size="md">
            Gửi đánh giá
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export default function ThucHienDanhGiaPage() {
  return (
    <Suspense
      fallback={
        <Center h={400}>
          <Loader />
        </Center>
      }
    >
      <ThucHienDanhGiaContent />
    </Suspense>
  );
}


"use client";

import { useEffect, useState, Suspense } from "react";
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
  Divider,
  Textarea,
  Radio,
  Avatar,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useAuth } from "@/features/auth/AuthContext";
import { getUserById } from "@/actions/users";
import { getBieuMauById, getCauHoisByBieuMau } from "@/actions/bieu-mau";
import { checkExistingDanhGia, createDanhGia } from "@/actions/danh-gia";
import type { User, BieuMau, CauHoi, DanhGia, CauTraLoi } from "@/types/schema";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

interface EvaluationFormValues {
  answers: Record<string, number>;
  nhanXetChung: string;
}

function EvaluationFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser, isLoading: authLoading } = useAuth();

  const nguoiDuocDanhGiaId = searchParams.get("nguoiDuocDanhGiaId");
  const bieuMauId = searchParams.get("bieuMauId");
  const kyDanhGiaId = searchParams.get("kyDanhGiaId");

  const [nguoiDuocDanhGia, setNguoiDuocDanhGia] = useState<User | null>(null);
  const [bieuMau, setBieuMau] = useState<BieuMau | null>(null);
  const [cauHois, setCauHois] = useState<CauHoi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EvaluationFormValues>({
    initialValues: {
      answers: {},
      nhanXetChung: "",
    },
    validate: (values) => {
      const errors: Record<string, string> = {};

      cauHois.forEach((cauHoi) => {
        if (cauHoi.batBuoc && !values.answers[cauHoi.id]) {
          errors[`answers.${cauHoi.id}`] = "Vui lòng chọn điểm";
        }
      });

      if (!values.nhanXetChung || values.nhanXetChung.trim().length < 10) {
        errors.nhanXetChung =
          "Nhận xét chung là bắt buộc và phải có ít nhất 10 ký tự";
      }

      return errors;
    },
  });

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
      return;
    }

    if (!nguoiDuocDanhGiaId || !bieuMauId || !kyDanhGiaId) {
      notifications.show({
        title: "Lỗi",
        message: "Thiếu thông tin để thực hiện đánh giá.",
        color: "red",
      });
      router.push("/danh-gia-nhan-vien");
      return;
    }

    if (!currentUser) return;

    let cancelled = false;

    const loadEvaluationData = async () => {
      setIsLoading(true);
      try {
        const [nguoiDuocDanhGiaResult, bieuMauResult, cauHoiResult] = await Promise.all([
          getUserById(nguoiDuocDanhGiaId),
          getBieuMauById(bieuMauId),
          getCauHoisByBieuMau(bieuMauId),
        ]);

        if (cancelled) return;

        const nguoiDuocDanhGiaData = nguoiDuocDanhGiaResult.success ? nguoiDuocDanhGiaResult.data : null;
        const bieuMauData = bieuMauResult.success ? bieuMauResult.data : null;
        const cauHoiData = cauHoiResult.success ? cauHoiResult.data : null;

        if (!nguoiDuocDanhGiaData || !bieuMauData || !cauHoiData) {
          if (!cancelled) {
            notifications.show({
              title: "Lỗi",
              message: "Không tìm thấy thông tin người được đánh giá hoặc biểu mẫu.",
              color: "red",
            });
            router.push("/danh-gia-nhan-vien");
          }
          return;
        }

        // Check if evaluating self
        if (currentUser && nguoiDuocDanhGiaId === currentUser.id) {
          if (!cancelled) {
            notifications.show({
              title: "Lỗi",
              message: "Bạn không thể tự đánh giá bản thân.",
              color: "red",
            });
            router.push("/danh-gia-nhan-vien");
          }
          return;
        }

        // Check if same department
        if (
          currentUser &&
          nguoiDuocDanhGiaData.phongBanId !== currentUser.phongBanId
        ) {
          if (!cancelled) {
            notifications.show({
              title: "Lỗi",
              message: "Bạn chỉ có thể đánh giá đồng nghiệp cùng phòng ban.",
              color: "red",
            });
            router.push("/danh-gia-nhan-vien");
          }
          return;
        }

        if (!cancelled) {
          setNguoiDuocDanhGia(nguoiDuocDanhGiaData as any);
          setBieuMau(bieuMauData as any);
          setCauHois(cauHoiData.sort((a, b) => a.thuTu - b.thuTu) as any);
        }

        // Check if already evaluated
        if (currentUser && !cancelled) {
          const hasEvaluatedResult = await checkExistingDanhGia(
            currentUser.id,
            nguoiDuocDanhGiaId,
            bieuMauId,
            kyDanhGiaId
          );
          if (!cancelled && hasEvaluatedResult.success && hasEvaluatedResult.data?.daHoanThanh) {
            notifications.show({
              title: "Thông báo",
              message: "Bạn đã hoàn thành đánh giá người này rồi.",
              color: "blue",
            });
            router.push("/danh-gia-nhan-vien");
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load evaluation form:", error);
          notifications.show({
            title: "Lỗi",
            message: "Không thể tải biểu mẫu đánh giá. Vui lòng thử lại.",
            color: "red",
          });
          router.push("/danh-gia-nhan-vien");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadEvaluationData();

    return () => {
      cancelled = true;
    };
  }, [currentUser, authLoading, router, nguoiDuocDanhGiaId, bieuMauId, kyDanhGiaId]);

  const handleSubmit = async (values: EvaluationFormValues) => {
    if (!currentUser || !nguoiDuocDanhGia || !bieuMau || !kyDanhGiaId) {
      notifications.show({
        title: "Lỗi",
        message: "Thông tin đánh giá không đầy đủ.",
        color: "red",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const cauTraLois = cauHois.map((cauHoi) => ({
        cauHoiId: cauHoi.id,
        diem: values.answers[cauHoi.id],
        nhanXet: "",
      }));

      const result = await createDanhGia({
        nguoiDanhGiaId: currentUser.id,
        nguoiDuocDanhGiaId: nguoiDuocDanhGia.id,
        bieuMauId: bieuMau.id,
        kyDanhGiaId: kyDanhGiaId,
        nhanXetChung: values.nhanXetChung,
        cauTraLois,
      });

      if (!result.success) {
        notifications.show({
          title: "Lỗi",
          message: result.error || "Không thể gửi đánh giá",
          color: "red",
        });
        return;
      }

      notifications.show({
        title: "Thành công",
        message: "Đánh giá đã được gửi thành công!",
        color: "green",
      });
      router.push("/danh-gia-nhan-vien");
    } catch (error) {
      console.error("Failed to submit evaluation:", error);
      notifications.show({
        title: "Lỗi",
        message: `Không thể gửi đánh giá: ${
          error instanceof Error ? error.message : "Lỗi không xác định"
        }`,
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

  if (authLoading || isLoading) {
    return (
      <Center style={{ height: "calc(100vh - 60px)" }}>
        <Loader />
      </Center>
    );
  }

  if (!currentUser || !nguoiDuocDanhGia || !bieuMau || !kyDanhGiaId) {
    return null;
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Title order={2}>Đánh giá Đồng nghiệp</Title>

        <Paper withBorder shadow="sm" p="lg" radius="md">
          <Group mb="md">
            <Avatar color="blue" radius="xl" size="lg">
              {getInitials(nguoiDuocDanhGia.hoTen)}
            </Avatar>
            <div style={{ flex: 1 }}>
              <Title order={4}>Thông tin người được đánh giá</Title>
              <Text fw={600} size="lg">
                {nguoiDuocDanhGia.hoTen}
              </Text>
              <Text c="dimmed" size="sm">
                Mã NV: {nguoiDuocDanhGia.maNhanVien}
              </Text>
              <Text c="dimmed" size="sm">
                Email: {nguoiDuocDanhGia.email}
              </Text>
            </div>
          </Group>
          <Divider />
          <Stack gap="xs" mt="md">
            <Text c="dimmed" size="sm">
              Biểu mẫu: <Text span fw={500}>{bieuMau.tenBieuMau}</Text>
            </Text>
            <Text c="dimmed" size="sm">
              Kỳ đánh giá: <Text span fw={500}>{kyDanhGiaId}</Text>
            </Text>
          </Stack>
        </Paper>

        <Paper withBorder shadow="sm" p="lg" radius="md">
          <Title order={4} mb="md">
            Nội dung đánh giá
          </Title>
          <Stack gap="xl">
            {cauHois.map((cauHoi, index) => (
              <div key={cauHoi.id}>
                <Text fw={500} mb="xs">
                  {index + 1}. {cauHoi.noiDung}{" "}
                  {cauHoi.batBuoc && (
                    <Text span c="red">
                      *
                    </Text>
                  )}
                </Text>
                <Radio.Group
                  value={
                    form.values.answers[cauHoi.id]
                      ? String(form.values.answers[cauHoi.id])
                      : ""
                  }
                  onChange={(value) =>
                    form.setFieldValue(`answers.${cauHoi.id}`, Number(value))
                  }
                  name={`question-${cauHoi.id}`}
                  error={form.errors[`answers.${cauHoi.id}`]}
                >
                  <Group mt="xs" gap="md">
                    {Array.from({ length: cauHoi.diemToiDa }, (_, i) => (
                      <Radio
                        key={i + 1}
                        value={String(i + 1)}
                        label={String(i + 1)}
                      />
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
              placeholder="Nhập nhận xét tổng quan về đồng nghiệp..."
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
          <Button
            variant="subtle"
            onClick={() => router.push("/danh-gia-nhan-vien")}
          >
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

export default function EvaluatePeerPage() {
  return (
    <Suspense
      fallback={
        <Center style={{ height: "calc(100vh - 60px)" }}>
          <Loader />
        </Center>
      }
    >
      <EvaluationFormContent />
    </Suspense>
  );
}


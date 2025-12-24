"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
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
  Badge,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useAuth } from "@/features/auth/AuthContext";
import { mockService } from "@/services/mockService";
import type { User, BieuMau, CauHoi, DanhGia, CauTraLoi } from "@/types/schema";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

interface EvaluationFormValues {
  answers: Record<string, number>;
  nhanXetChung: string;
}

function EditPeerEvaluationFormContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user: currentUser, isLoading: authLoading } = useAuth();

  const danhGiaId = params.id as string;
  const nguoiDuocDanhGiaId = searchParams.get("nguoiDuocDanhGiaId");
  const bieuMauId = searchParams.get("bieuMauId");
  const kyDanhGiaId = searchParams.get("kyDanhGiaId");

  const [danhGia, setDanhGia] = useState<DanhGia | null>(null);
  const [nguoiDuocDanhGia, setNguoiDuocDanhGia] = useState<User | null>(null);
  const [bieuMau, setBieuMau] = useState<BieuMau | null>(null);
  const [cauHois, setCauHois] = useState<CauHoi[]>([]);
  const [cauTraLois, setCauTraLois] = useState<CauTraLoi[]>([]);
  const [canEdit, setCanEdit] = useState(false);
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
  if (cauHoi.batBuoc && values.answers[cauHoi.id] === undefined) {
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

    if (!danhGiaId || !nguoiDuocDanhGiaId || !bieuMauId || !kyDanhGiaId) {
      notifications.show({
        title: "Lỗi",
        message: "Thiếu thông tin để chỉnh sửa đánh giá.",
        color: "red",
      });
      router.push("/lich-su-danh-gia");
      return;
    }

    const loadEvaluationData = async () => {
      setIsLoading(true);
      try {
        const [danhGiaData, nguoiDuocDanhGiaData, bieuMauData, cauHoiData, canEditData] =
          await Promise.all([
            mockService.danhGias.getById(danhGiaId),
            mockService.users.getById(nguoiDuocDanhGiaId),
            mockService.bieuMaus.getById(bieuMauId),
            mockService.cauHois.getByBieuMau(bieuMauId),
            mockService.danhGias.canEdit(danhGiaId),
          ]);

        if (!danhGiaData || !nguoiDuocDanhGiaData || !bieuMauData || !cauHoiData) {
          notifications.show({
            title: "Lỗi",
            message: "Không tìm thấy thông tin đánh giá.",
            color: "red",
          });
          router.push("/lich-su-danh-gia");
          return;
        }

        // Check if current user is the evaluator
        if (currentUser && danhGiaData.nguoiDanhGiaId !== currentUser.id) {
          notifications.show({
            title: "Lỗi",
            message: "Bạn không có quyền chỉnh sửa đánh giá này.",
            color: "red",
          });
          router.push("/lich-su-danh-gia");
          return;
        }

        // Check if can edit
        if (!canEditData) {
          notifications.show({
            title: "Thông báo",
            message: "Đánh giá này đã hết hạn chỉnh sửa.",
            color: "orange",
          });
          router.push("/lich-su-danh-gia");
          return;
        }

        setDanhGia(danhGiaData);
        setNguoiDuocDanhGia(nguoiDuocDanhGiaData);
        setBieuMau(bieuMauData);
        setCauHois(cauHoiData.sort((a, b) => a.thuTu - b.thuTu));
        setCanEdit(canEditData);

        // Load existing answers
        const existingAnswers = await mockService.cauTraLois.getByDanhGia(danhGiaId);
        setCauTraLois(existingAnswers);

        // Populate form with existing data
        const answersMap: Record<string, number> = {};
        existingAnswers.forEach((ctl) => {
          answersMap[ctl.cauHoiId] = ctl.diem;
        });

        form.setValues({
          answers: answersMap,
          nhanXetChung: danhGiaData.nhanXetChung || "",
        });
      } catch (error) {
        console.error("Failed to load evaluation data:", error);
        notifications.show({
          title: "Lỗi",
          message: "Không thể tải dữ liệu đánh giá. Vui lòng thử lại.",
          color: "red",
        });
        router.push("/lich-su-danh-gia");
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      loadEvaluationData();
    }
  }, [currentUser, authLoading, router, danhGiaId, nguoiDuocDanhGiaId, bieuMauId, kyDanhGiaId]);

  const handleSubmit = async (values: EvaluationFormValues) => {
    if (!currentUser || !nguoiDuocDanhGia || !bieuMau || !kyDanhGiaId || !danhGia) {
      notifications.show({
        title: "Lỗi",
        message: "Thông tin đánh giá không đầy đủ.",
        color: "red",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const answers = cauHois.map((cauHoi) => ({
        cauHoiId: cauHoi.id,
        diem: values.answers[cauHoi.id],
        nhanXet: "",
      }));

      // Use submitEvaluation which handles both create and update
      await mockService.danhGias.submitEvaluation(
        currentUser.id,
        nguoiDuocDanhGia.id,
        bieuMau.id,
        kyDanhGiaId,
        values.nhanXetChung,
        answers
      );

      notifications.show({
        title: "Thành công",
        message: "Đánh giá đã được cập nhật thành công!",
        color: "green",
      });
      router.push("/lich-su-danh-gia");
    } catch (error) {
      console.error("Failed to update evaluation:", error);
      notifications.show({
        title: "Lỗi",
        message: `Không thể cập nhật đánh giá: ${
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

  if (!currentUser || !nguoiDuocDanhGia || !bieuMau || !kyDanhGiaId || !danhGia || !canEdit) {
    return null;
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Group justify="space-between">
          <Title order={2}>Chỉnh sửa Đánh giá Đồng nghiệp</Title>
          <Badge color="orange" size="lg">
            Đang chỉnh sửa
          </Badge>
        </Group>

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
              Ngày gửi ban đầu:{" "}
              <Text span fw={500}>
                {danhGia.submittedAt
                  ? dayjs(danhGia.submittedAt).format("DD/MM/YYYY HH:mm")
                  : "N/A"}
              </Text>
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
          <Button variant="subtle" onClick={() => router.push("/lich-su-danh-gia")}>
            Hủy
          </Button>
          <Button type="submit" loading={isSubmitting} size="md" color="orange">
            Cập nhật đánh giá
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export default function EditPeerEvaluationPage() {
  return (
    <Suspense
      fallback={
        <Center style={{ height: "calc(100vh - 60px)" }}>
          <Loader />
        </Center>
      }
    >
      <EditPeerEvaluationFormContent />
    </Suspense>
  );
}


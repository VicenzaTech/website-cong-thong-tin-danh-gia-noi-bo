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
import { mockService } from "@/services/mockService";
import { Role, type User, type BieuMau, type CauHoi, type DanhGia, type CauTraLoi } from "@/types/schema";
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
        if (cauHoi.diemToiDa === 0) {
          // 0-point (Có/Không) luôn bắt buộc
          if (values.answers[cauHoi.id] === undefined) {
            errors[`answers.${cauHoi.id}`] = "Vui lòng chọn Có hoặc Không";
          }
        } else {
          // câu có điểm (>0) chỉ bắt buộc khi không bị khóa bởi 'khongXetThiDua'
          if (!khongXetThiDua && values.answers[cauHoi.id] === undefined) {
            errors[`answers.${cauHoi.id}`] = "Vui lòng chọn điểm";
          }
        }
      });

      if (!values.nhanXetChung || values.nhanXetChung.trim().length < 10) {
        errors.nhanXetChung =
          "Nhận xét chung là bắt buộc và phải có ít nhất 10 ký tự";
      }

      return errors;
    },
  });

  const [khongXetThiDua, setKhongXetThiDua] = useState(false);

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

    const loadEvaluationData = async () => {
      setIsLoading(true);
      try {
        const [nguoiDuocDanhGiaData, bieuMauData, cauHoiData] = await Promise.all([
          mockService.users.getById(nguoiDuocDanhGiaId),
          mockService.bieuMaus.getById(bieuMauId),
          mockService.cauHois.getByBieuMau(bieuMauId),
        ]);

        if (!nguoiDuocDanhGiaData || !bieuMauData || !cauHoiData) {
          notifications.show({
            title: "Lỗi",
            message: "Không tìm thấy thông tin người được đánh giá hoặc biểu mẫu.",
            color: "red",
          });
          router.push("/danh-gia-nhan-vien");
          return;
        }

        // Check if evaluating self
        if (currentUser && nguoiDuocDanhGiaId === currentUser.id) {
          notifications.show({
            title: "Lỗi",
            message: "Bạn không thể tự đánh giá bản thân.",
            color: "red",
          });
          router.push("/danh-gia-nhan-vien");
          return;
        }

        // Check if same department
        if (
          currentUser &&
          nguoiDuocDanhGiaData.phongBanId !== currentUser.phongBanId
        ) {
          notifications.show({
            title: "Lỗi",
            message: "Bạn chỉ có thể đánh giá đồng nghiệp cùng phòng ban.",
            color: "red",
          });
          router.push("/danh-gia-nhan-vien");
          return;
        }

        // Additional check for nhan_vien role
        if (currentUser && currentUser.role === Role.nhan_vien) {
          const isTruongPhong = nguoiDuocDanhGiaData.role === Role.truong_phong;
          const isSameBoPhan = 
            currentUser.boPhan && 
            nguoiDuocDanhGiaData.boPhan && 
            nguoiDuocDanhGiaData.boPhan === currentUser.boPhan;

          if (!isSameBoPhan && !isTruongPhong) {
            notifications.show({
              title: "Lỗi",
              message: "Bạn chỉ có thể đánh giá đồng nghiệp cùng bộ phận hoặc trưởng phòng.",
              color: "red",
            });
            router.push("/danh-gia-nhan-vien");
            return;
          }
        }

        setNguoiDuocDanhGia(nguoiDuocDanhGiaData);
        setBieuMau(bieuMauData);
        const existing = cauHoiData.slice(); // original from DB

        // Define the mandatory question names here
        const mandatoryNames = [
          "Vi phạm Nội quy lao động, kỷ luật",
          "Vi phạm quy định về an toàn lao động – PCCN",
        ];

        // If a mandatory item is missing, prepend it as a 0-point required question
        for (let i = mandatoryNames.length - 1; i >= 0; i--) {
          const name = mandatoryNames[i];
          if (!existing.some((ch) => ch.noiDung === name)) {
            existing.unshift({
              id: `m_${i}_${Date.now()}`,
              bieuMauId: bieuMauId || "",
              noiDung: name,
              thuTu: 0,
              diemToiDa: 0,
              batBuoc: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as CauHoi);
          }
        }

        // Keep order by thuTu (0 mandatory items will appear first)
        setCauHois(existing.sort((a, b) => a.thuTu - b.thuTu));

        // Check if already evaluated
        if (currentUser) {
          const hasEvaluated = await mockService.danhGias.checkExisting(
            currentUser.id,
            nguoiDuocDanhGiaId,
            bieuMauId,
            kyDanhGiaId
          );
          if (hasEvaluated && hasEvaluated.daHoanThanh) {
            notifications.show({
              title: "Thông báo",
              message: "Bạn đã hoàn thành đánh giá người này rồi.",
              color: "blue",
            });
            router.push("/danh-gia-nhan-vien");
          }
        }
      } catch (error) {
        console.error("Failed to load evaluation form:", error);
        notifications.show({
          title: "Lỗi",
          message: "Không thể tải biểu mẫu đánh giá. Vui lòng thử lại.",
          color: "red",
        });
        router.push("/danh-gia-nhan-vien");
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      loadEvaluationData();
    }
  }, [currentUser, authLoading, router, nguoiDuocDanhGiaId, bieuMauId, kyDanhGiaId]);

  useEffect(() => {
    const hasViolation = cauHois.some(
      (ch) => ch.diemToiDa === 0 && form.values.answers[ch.id] === 1
    );

    if (hasViolation !== khongXetThiDua) {
      setKhongXetThiDua(hasViolation);
    }

    if (hasViolation) {
      const newAnswers = { ...form.values.answers };
      let changed = false;
      for (const ch of cauHois) {
        if (ch.diemToiDa > 0 && Object.prototype.hasOwnProperty.call(newAnswers, ch.id)) {
          delete newAnswers[ch.id];
          changed = true;
        }
      }
      if (changed) {
        form.setValues({ ...form.values, answers: newAnswers });
      }
    }
  }, [JSON.stringify(form.values.answers), cauHois, khongXetThiDua]);


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
      const answers = cauHois.map((cauHoi) => {
        // mandatory 0-point questions: keep 1 (Có) / 0 (Không) as-is (or default 0)
        if (cauHoi.diemToiDa === 0) {
          return {
            cauHoiId: cauHoi.id,
            diem: 0,
            nhanXet: "",
          };
        }

        // scoring questions: if any mandatory violation -> set score = 0
        if (khongXetThiDua) {
          return { cauHoiId: cauHoi.id, diem: 0, nhanXet: "" };
        }

        // normal behavior
        return {
          cauHoiId: cauHoi.id,
          diem: values.answers[cauHoi.id] !== undefined ? values.answers[cauHoi.id] : 0,
          nhanXet: "",
        };
      });

      await mockService.danhGias.submitEvaluation(
        currentUser.id,
        nguoiDuocDanhGia.id,
        bieuMau.id,
        kyDanhGiaId,
        values.nhanXetChung,
        answers
      );

      // Sync to server-side mock DB so server APIs see the new evaluation
      try {
        await fetch(`/api/danh-gias/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nguoiDanhGiaId: currentUser.id,
            nguoiDuocDanhGiaId: nguoiDuocDanhGia.id,
            bieuMauId: bieuMau.id,
            kyDanhGiaId,
            nhanXetChung: values.nhanXetChung,
            answers,
          }),
        });
      } catch (e) {
        // ignore sync errors in dev mock environment
      }

      notifications.show({
        title: "Thành công",
        message: "Đánh giá đã được gửi thành công!",
        color: "green",
      });
      try {
        const bc = new BroadcastChannel("evaluations");
        bc.postMessage({
          nguoiDuocDanhGiaId: nguoiDuocDanhGia.id,
          bieuMauId: bieuMau.id,
          kyDanhGiaId,
          nguoiDanhGiaId: currentUser.id,
        });
        bc.close();
      } catch (e) {
        // BroadcastChannel may not be available in some environments; ignore.
      }
      router.push("/danh-gia-nhan-vien");
    } catch (error) {
      console.error("Failed to submit evaluation:", error);
      notifications.show({
        title: "Lỗi",
        message: `Không thể gửi đánh giá: ${error instanceof Error ? error.message : "Lỗi không xác định"
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
        <Paper withBorder shadow="sm" p="sm" radius="md" mb="md">
          <Title order={5}>Thang chấm điểm</Title>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "6px 8px" }}>Nội dung</th>
                <th style={{ textAlign: "center", padding: "6px 8px" }}>Rất kém</th>
                <th style={{ textAlign: "center", padding: "6px 8px" }}>Kém</th>
                <th style={{ textAlign: "center", padding: "6px 8px" }}>Trung bình</th>
                <th style={{ textAlign: "center", padding: "6px 8px" }}>Tốt</th>
                <th style={{ textAlign: "center", padding: "6px 8px" }}>Rất tốt</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "6px 8px" }}>Số điểm đánh giá</td>
                <td style={{ textAlign: "center", padding: "6px 8px" }}>1</td>
                <td style={{ textAlign: "center", padding: "6px 8px" }}>2</td>
                <td style={{ textAlign: "center", padding: "6px 8px" }}>3</td>
                <td style={{ textAlign: "center", padding: "6px 8px" }}>4</td>
                <td style={{ textAlign: "center", padding: "6px 8px" }}>5</td>
              </tr>
            </tbody>
          </table>
        </Paper>
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

                {cauHoi.diemToiDa && cauHoi.diemToiDa > 0 ? (
                  <Radio.Group
                    value={form.values.answers[cauHoi.id] !== undefined ? String(form.values.answers[cauHoi.id]) : ""}
                    onChange={(value) => form.setFieldValue(`answers.${cauHoi.id}`, Number(value))}
                    name={`question-${cauHoi.id}`}
                    error={form.errors[`answers.${cauHoi.id}`]}
                  >
                    <Group mt="xs" gap="md">
                      {Array.from({ length: cauHoi.diemToiDa }, (_, i) => (
                        <Radio key={i + 1} value={String(i + 1)} label={String(i + 1)} disabled={khongXetThiDua} />
                      ))}
                    </Group>
                  </Radio.Group>
                ) : (
                  // Câu hỏi điều kiện bắt buộc -> hiển thị lựa chọn Có / Không (1 = Có (vi phạm), 0 = Không)
                  <Radio.Group
                    value={form.values.answers[cauHoi.id] !== undefined ? String(form.values.answers[cauHoi.id]) : ""}
                    onChange={(value) => form.setFieldValue(`answers.${cauHoi.id}`, Number(value))}
                    name={`question-${cauHoi.id}`}
                    error={form.errors[`answers.${cauHoi.id}`]}
                  >
                    <Group mt="xs" gap="md">
                      <Radio value="1" label="Có" />
                      <Radio value="0" label="Không" />
                    </Group>
                  </Radio.Group>
                )}

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


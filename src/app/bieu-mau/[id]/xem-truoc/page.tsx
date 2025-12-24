"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
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
  Badge,
} from "@mantine/core";
import { mockService } from "@/services/mockService";
import type { BieuMau, CauHoi } from "@/types/schema";

export default function XemTruocBieuMauPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [bieuMau, setBieuMau] = useState<BieuMau | null>(null);
  const [cauHois, setCauHois] = useState<CauHoi[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const bm = await mockService.bieuMaus.getById(id);
      if (bm) {
        setBieuMau(bm);
        const chs = await mockService.cauHois.getByBieuMau(id);
        setCauHois(chs);
      }
    } catch (error) {
      console.error("Failed to load bieu mau:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  if (!bieuMau) {
    return (
      <Center h={400}>
        <Text c="dimmed">Không tìm thấy biểu mẫu</Text>
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Xem trước biểu mẫu</Title>
        <Button variant="subtle" onClick={() => router.push("/bieu-mau")}>
          Quay lại
        </Button>
      </Group>

      <Paper withBorder shadow="sm" p="lg" radius="md">
        <Stack gap="md">
          <div>
            <Group mb="xs">
              <Title order={3}>{bieuMau.tenBieuMau}</Title>
              <Badge color={bieuMau.loaiDanhGia === "LANH_DAO" ? "blue" : "green"}>
                {bieuMau.loaiDanhGia === "LANH_DAO" ? "Lãnh đạo" : "Nhân viên"}
              </Badge>
            </Group>
            {bieuMau.moTa && (
              <Text size="sm" c="dimmed">
                {bieuMau.moTa}
              </Text>
            )}
          </div>

          <Divider />

          <Stack gap="lg">
            {cauHois.length === 0 ? (
              <Center h={100}>
                <Text c="dimmed">Biểu mẫu chưa có câu hỏi</Text>
              </Center>
            ) : (
              cauHois.map((cauHoi, index) => (
                <div key={cauHoi.id}>
                  <Text fw={500} mb="xs">
                    {index + 1}. {cauHoi.noiDung}
                    {cauHoi.batBuoc && (
                      <Text component="span" c="red">
                        {" "}
                        *
                      </Text>
                    )}
                  </Text>
                  {cauHoi.diemToiDa && cauHoi.diemToiDa > 0 ? (
                    <Group>
                      {Array.from({ length: cauHoi.diemToiDa }, (_, i) => (
                        <Button key={i} variant="outline" size="sm" disabled>
                          {i + 1}
                        </Button>
                      ))}
                    </Group>
                  ) : (
                    <Group>
                      <Button variant="outline" size="sm" disabled>
                        Có
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        Không
                      </Button>
                    </Group>
                  )}
                </div>
              ))
            )}
          </Stack>

          <Divider />

          <Textarea
            label="Nhận xét chung"
            placeholder="Nhập nhận xét của bạn..."
            rows={4}
            disabled
          />

          <Group justify="flex-end">
            <Button disabled>Gửi đánh giá</Button>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}


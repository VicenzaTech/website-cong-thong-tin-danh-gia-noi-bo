"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Stack, Title, Paper, Grid, Card, Text, Button, Loader, Center } from "@mantine/core";
import { useAuth } from "@/features/auth/AuthContext";
import { mockService } from "@/services/mockService";
import { Role } from "@/types/schema";
import type { PhongBan } from "@/types/schema";

export default function AdminPhongBanPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [phongBans, setPhongBans] = useState<PhongBan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
      return;
    }

    if (currentUser && currentUser.role !== Role.admin) {
      router.push("/");
      return;
    }

    loadPhongBans();
  }, [currentUser, authLoading, router]);

  const loadPhongBans = async () => {
    setIsLoading(true);
    try {
      const data = await mockService.phongBans.getAll();
      setPhongBans(data);
    } catch (error) {
      console.error("Failed to load phong bans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  if (!currentUser || currentUser.role !== Role.admin) {
    return null;
  }

  return (
    <Stack gap="lg">
      <Title order={2}>Quản lý Phòng Ban</Title>
      <Grid>
        {phongBans.map((pb) => (
          <Grid.Col key={pb.id} span={4}>
            <Card withBorder shadow="sm" p="lg" radius="md">
              <Text fw={500} size="lg">{pb.tenPhongBan}</Text>
              <Text size="sm" c="dimmed">{pb.moTa || "Không có mô tả"}</Text>
              <Button
                mt="md"
                onClick={() => router.push(`/xem-danh-gia?phongBanId=${pb.id}`)}
              >
                Xem Đánh Giá
              </Button>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}
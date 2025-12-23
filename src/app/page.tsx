"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Title, 
  Text, 
  Stack, 
  Paper, 
  Grid, 
  Card, 
  Group, 
  Badge, 
  RingProgress, 
  Center,
  Loader,
  ThemeIcon,
} from "@mantine/core";
import { 
  IconClipboardCheck, 
  IconChartBar, 
  IconTrendingUp,
  IconStar,
} from "@tabler/icons-react";
import { useAuth } from "@/features/auth/AuthContext";
import { getActiveKyDanhGias, getDanhGiasByNguoiDanhGia, getAllDanhGias, getAllUsers, getPhongBanById } from "@/actions";
import type { DanhGia, KyDanhGia } from "@/types/schema";

interface DashboardStats {
  totalEvaluations: number;
  completedEvaluations: number;
  averageScore: number;
  personalProgress: number;
  departmentProgress: number;
}

export default function Home() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEvaluations: 0,
    completedEvaluations: 0,
    averageScore: 0,
    personalProgress: 0,
    departmentProgress: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeKyDanhGia, setActiveKyDanhGia] = useState<KyDanhGia | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadDashboardStats = async () => {
      setIsLoading(true);
      try {
        // Get active evaluation period
        const kyResult = await getActiveKyDanhGias();
        const currentKy = kyResult.success && kyResult.data ? kyResult.data[0] : null;
        if (!cancelled) {
          setActiveKyDanhGia(currentKy as any);
        }

        // Get user's evaluations
        const evalResult = await getDanhGiasByNguoiDanhGia(user.id);
        const myEvaluations = evalResult.success && evalResult.data ? evalResult.data : [];
        
        // Calculate completed evaluations
        const completed = myEvaluations.filter((dg: any) => dg.daHoanThanh).length;
        
        // Calculate average score
        const completedWithScores = myEvaluations.filter(
          (dg: any) => dg.daHoanThanh && dg.diemTrungBinh
        );
        const avgScore = completedWithScores.length > 0
          ? completedWithScores.reduce((sum: number, dg: any) => sum + (dg.diemTrungBinh || 0), 0) / completedWithScores.length
          : 0;

        // Calculate personal progress
        let personalProgress = 0;
        if (currentKy) {
          // Get all users to count colleagues
          const usersResult = await getAllUsers();
          const allUsers = usersResult.success && usersResult.data ? usersResult.data : [];
          
          const colleagues = allUsers.filter(
            (u: any) =>
              u.phongBanId === user.phongBanId &&
              u.id !== user.id &&
              !u.deletedAt &&
              u.trangThaiKH
          );
          
          // Get department manager
          const phongBanResult = await getPhongBanById(user.phongBanId);
          const phongBan = phongBanResult.success ? phongBanResult.data : null;
          const hasManager = phongBan?.truongPhongId && phongBan.truongPhongId !== user.id;
          
          const expectedEvaluations = colleagues.length + (hasManager ? 1 : 0);
          
          // Count completed evaluations for current period
          const completedInPeriod = myEvaluations.filter(
            (dg: any) => dg.kyDanhGiaId === currentKy.id && dg.daHoanThanh
          ).length;
          
          personalProgress = expectedEvaluations > 0
            ? Math.round((completedInPeriod / expectedEvaluations) * 100)
            : 0;
        }

        // Calculate department progress (for truong_phong and admin)
        let departmentProgress = 0;
        if (user.role === "truong_phong" || user.role === "admin") {
          const allDanhGiasResult = await getAllDanhGias();
          const allDanhGias = allDanhGiasResult.success && allDanhGiasResult.data ? allDanhGiasResult.data : [];
          
          const usersResult = await getAllUsers();
          const allUsers = usersResult.success && usersResult.data ? usersResult.data : [];
          
          let departmentUsers: string[] = [];
          if (user.role === "truong_phong") {
            departmentUsers = allUsers
              .filter((u: any) => u.phongBanId === user.phongBanId && !u.deletedAt && u.trangThaiKH)
              .map((u: any) => u.id);
          } else {
            departmentUsers = allUsers
              .filter((u: any) => !u.deletedAt && u.trangThaiKH)
              .map((u: any) => u.id);
          }

          if (currentKy && departmentUsers.length > 0) {
            const departmentEvaluations = allDanhGias.filter(
              (dg: any) =>
                departmentUsers.includes(dg.nguoiDanhGiaId) &&
                dg.kyDanhGiaId === currentKy.id
            );
            
            const departmentCompleted = departmentEvaluations.filter((dg: any) => dg.daHoanThanh).length;
            
            // Estimate expected evaluations (each user evaluates colleagues + manager)
            const avgExpectedPerUser = departmentUsers.length > 1 ? departmentUsers.length : 1;
            const totalExpected = departmentUsers.length * avgExpectedPerUser;
            
            departmentProgress = totalExpected > 0
              ? Math.round((departmentCompleted / totalExpected) * 100)
              : 0;
          }
        }

        if (!cancelled) {
          setStats({
            totalEvaluations: myEvaluations.length,
            completedEvaluations: completed,
            averageScore: avgScore,
            personalProgress,
            departmentProgress,
          });
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load dashboard stats:", error);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadDashboardStats();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (authLoading || isLoading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  if (!user) {
    return null;
  }

  const statCards = [
    {
      title: "Tổng số đánh giá",
      value: stats.totalEvaluations.toString(),
      icon: IconClipboardCheck,
      color: "blue",
      description: "Tổng số đánh giá đã thực hiện",
    },
    {
      title: "Đã hoàn thành",
      value: stats.completedEvaluations.toString(),
      icon: IconChartBar,
      color: "green",
      description: "Số đánh giá đã hoàn tất",
    },
    {
      title: "Điểm trung bình",
      value: stats.averageScore.toFixed(2),
      icon: IconStar,
      color: "yellow",
      description: "Điểm TB các đánh giá",
    },
    {
      title: "Tỉ lệ hoàn thành",
      value: `${stats.personalProgress}%`,
      icon: IconTrendingUp,
      color: "grape",
      description: "Tiến độ cá nhân",
    },
  ];

  return (
    <Stack gap="lg">
      <Paper withBorder shadow="sm" p="lg" radius="md">
        <Group justify="space-between">
          <div>
            <Title order={2}>Chào mừng trở lại, {user.hoTen}!</Title>
            <Text size="sm" c="dimmed" mt="xs">
              Đây là tổng quan về hoạt động đánh giá của bạn
            </Text>
            {activeKyDanhGia && (
              <Badge variant="light" color="green" size="md" mt="xs">
                Kỳ đánh giá: {activeKyDanhGia.tenKy}
              </Badge>
            )}
          </div>
          <Badge size="lg" variant="light" color="blue">
            {user.role === "admin"
              ? "Quản trị viên"
              : user.role === "truong_phong"
                ? "Trưởng phòng"
                : "Nhân viên"}
          </Badge>
        </Group>
      </Paper>

      {/* Stat Cards */}
      <Grid>
        {statCards.map((stat) => (
          <Grid.Col key={stat.title} span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder shadow="sm" padding="lg" radius="md">
              <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  {stat.title}
                </Text>
                <ThemeIcon variant="light" size="lg" color={stat.color} radius="md">
                  <stat.icon size={20} />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>
                {stat.value}
              </Text>
              <Text size="xs" c="dimmed" mt="xs">
                {stat.description}
              </Text>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {/* Progress Rings */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder shadow="sm" padding="lg" radius="md">
            <Group justify="space-between" mb="md">
              <div>
                <Text size="sm" fw={700}>
                  Tiến độ cá nhân
                </Text>
                <Text size="xs" c="dimmed">
                  Hoàn thành đánh giá trong kỳ hiện tại
                </Text>
              </div>
            </Group>
            <Center>
              <RingProgress
                size={180}
                thickness={16}
                sections={[
                  { 
                    value: stats.personalProgress, 
                    color: stats.personalProgress === 100 ? 'green' : stats.personalProgress >= 50 ? 'blue' : 'orange' 
                  }
                ]}
                label={
                  <Center>
                    <Stack gap={0} align="center">
                      <Text size="xl" fw={700}>
                        {stats.personalProgress}%
                      </Text>
                      <Text size="xs" c="dimmed">
                        Hoàn thành
                      </Text>
                    </Stack>
                  </Center>
                }
              />
            </Center>
            <Text size="xs" c="dimmed" ta="center" mt="md">
              {stats.completedEvaluations} / {stats.totalEvaluations} đánh giá đã hoàn thành
            </Text>
          </Card>
        </Grid.Col>

        {(user.role === "truong_phong" || user.role === "admin") && (
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder shadow="sm" padding="lg" radius="md">
              <Group justify="space-between" mb="md">
                <div>
                  <Text size="sm" fw={700}>
                    {user.role === "admin" ? "Tiến độ toàn công ty" : "Tiến độ phòng ban"}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Tổng quan tiến độ đánh giá
                  </Text>
                </div>
              </Group>
              <Center>
                <RingProgress
                  size={180}
                  thickness={16}
                  sections={[
                    { 
                      value: stats.departmentProgress, 
                      color: stats.departmentProgress === 100 ? 'green' : stats.departmentProgress >= 50 ? 'teal' : 'orange' 
                    }
                  ]}
                  label={
                    <Center>
                      <Stack gap={0} align="center">
                        <Text size="xl" fw={700}>
                          {stats.departmentProgress}%
                        </Text>
                        <Text size="xs" c="dimmed">
                          Hoàn thành
                        </Text>
                      </Stack>
                    </Center>
                  }
                />
              </Center>
              <Text size="xs" c="dimmed" ta="center" mt="md">
                {user.role === "admin" 
                  ? "Tiến độ chung của toàn bộ nhân viên"
                  : "Tiến độ chung của phòng ban"}
              </Text>
            </Card>
          </Grid.Col>
        )}
      </Grid>

      {/* Personal Information */}
      <Paper withBorder shadow="sm" p="lg" radius="md">
        <Title order={3} mb="md">
          Thông tin cá nhân
        </Title>
        <Stack gap="sm">
          <Group>
            <Text fw={500} w={150}>
              Mã nhân viên:
            </Text>
            <Text>{user.maNhanVien}</Text>
          </Group>
          <Group>
            <Text fw={500} w={150}>
              Email:
            </Text>
            <Text>{user.email}</Text>
          </Group>
          <Group>
            <Text fw={500} w={150}>
              Vai trò:
            </Text>
            <Text>
              {user.role === "admin"
                ? "Quản trị viên"
                : user.role === "truong_phong"
                  ? "Trưởng phòng"
                  : "Nhân viên"}
            </Text>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}

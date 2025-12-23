"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Stack,
  Title,
  Paper,
  Grid,
  Text,
  Loader,
  Center,
  Table,
  Badge,
  Avatar,
  Group,
  Select,
  Flex,
} from "@mantine/core";
import { BarChart, RadarChart } from "@mantine/charts";
import { IconTrophy, IconMedal, IconAward } from "@tabler/icons-react";
import { useAuth } from "@/features/auth/AuthContext";
import { getAllDanhGias, getDanhGiasByNguoiDanhGia } from "@/actions/danh-gia";
import { getAllKyDanhGias } from "@/actions/ky-danh-gia";
import { getAllPhongBans } from "@/actions/phong-ban";
import { getAllUsers } from "@/actions/users";
import type { DanhGia, User, CauTraLoi, CauHoi, KyDanhGia, PhongBan } from "@/types/schema";

interface ScoreDistribution {
  score: string;
  count: number;
}

interface CriteriaScore {
  criteria: string;
  score: number;
}

interface LeaderboardEntry {
  user: User;
  averageScore: number;
  totalEvaluations: number;
  rank: number;
}

export default function BaoCaoPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [scoreDistribution, setScoreDistribution] = useState<ScoreDistribution[]>([]);
  const [criteriaScores, setCriteriaScores] = useState<CriteriaScore[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [kyDanhGias, setKyDanhGias] = useState<KyDanhGia[]>([]);
  const [selectedKyId, setSelectedKyId] = useState<string | null>(null);
  const [phongBans, setPhongBans] = useState<PhongBan[]>([]);
  const [selectedPhongBanId, setSelectedPhongBanId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    if (currentUser) {
      loadKyDanhGias();
      loadPhongBans();
    }
  }, [currentUser]);

  const loadReportData = useCallback(async (cancelledRef: { current: boolean }) => {
    if (!currentUser || !selectedKyId) return;

    setIsLoading(true);

    try {
      let allDanhGias: any[] = [];

      // Load evaluations based on role and department filter
      if (currentUser.role === "admin") {
        // Admin sees all evaluations or filtered by department
        const result = await getAllDanhGias();
        const allEvals = result.success && result.data ? result.data : [];
        
        if (selectedPhongBanId) {
          // Filter by selected department
          const usersResult = await getAllUsers();
          const allUsers = usersResult.success && usersResult.data ? usersResult.data : [];
          const departmentUserIds = allUsers
            .filter((u) => u.phongBanId === selectedPhongBanId)
            .map((u) => u.id);
          allDanhGias = allEvals.filter((dg) =>
            departmentUserIds.includes(dg.nguoiDuocDanhGiaId)
          );
        } else {
          // Show all departments
          allDanhGias = allEvals;
        }
      } else if (currentUser.role === "truong_phong") {
        // Manager sees only their department evaluations
        const result = await getAllDanhGias();
        const allEvals = result.success && result.data ? result.data : [];
        const usersResult = await getAllUsers();
        const allUsers = usersResult.success && usersResult.data ? usersResult.data : [];
        const departmentUserIds = allUsers
          .filter((u) => u.phongBanId === currentUser.phongBanId)
          .map((u) => u.id);
        allDanhGias = allEvals.filter((dg) =>
          departmentUserIds.includes(dg.nguoiDuocDanhGiaId)
        );
      } else {
        // Regular users see their own evaluations
        const result = await getDanhGiasByNguoiDanhGia(currentUser.id);
        allDanhGias = result.success && result.data ? result.data : [];
      }

      if (cancelledRef.current) return;

      // Filter by selected period
      const periodEvaluations = allDanhGias.filter(
        (dg) => dg.kyDanhGiaId === selectedKyId && dg.daHoanThanh
      );

      // Calculate score distribution
      const allAnswers: CauTraLoi[] = [];
      for (const evaluation of periodEvaluations) {
        if (evaluation.cauTraLois) {
          allAnswers.push(...evaluation.cauTraLois);
        }
      }

      const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      allAnswers.forEach((answer) => {
        if (answer.diem >= 1 && answer.diem <= 5) {
          distribution[answer.diem]++;
        }
      });

      const distributionData: ScoreDistribution[] = Object.entries(distribution)
        .map(([score, count]) => ({
          score: `${score} sao`,
          count,
          order: parseInt(score),
        }))
        .sort((a, b) => a.order - b.order)
        .map(({ order, ...rest }) => rest);

      if (!cancelledRef.current) {
        setScoreDistribution(distributionData);
      }

      // Calculate criteria scores (radar chart)
      if (periodEvaluations.length === 0) {
        if (!cancelledRef.current) {
          setCriteriaScores([]);
        }
      } else {
        const questionScores: Record<string, { total: number; count: number; fullText: string }> = {};

        for (const evaluation of periodEvaluations) {
          const answers = evaluation.cauTraLois || [];
          
          for (const answer of answers) {
            if (!answer || answer.diem === null || answer.diem === undefined || answer.diem < 0) continue;
            
            const question = answer.cauHoi;
            if (!question || !question.noiDung) continue;

            const fullText = question.noiDung.trim();
            if (!fullText) continue;

            if (!questionScores[fullText]) {
              questionScores[fullText] = { total: 0, count: 0, fullText };
            }
            questionScores[fullText].total += Number(answer.diem);
            questionScores[fullText].count++;
          }
        }

        const criteriaData: CriteriaScore[] = Object.values(questionScores)
          .map((data) => {
            let criteriaName = data.fullText.trim();
            if (criteriaName.length > 30) {
              criteriaName = criteriaName.substring(0, 30) + "...";
            }
            return {
              criteria: criteriaName,
              score: data.count > 0 
                ? Math.round((data.total / data.count) * 100) / 100 
                : 0,
            };
          })
          .filter((item) => item.score > 0 && item.criteria)
          .sort((a, b) => b.score - a.score)
          .slice(0, 6);

        if (!cancelledRef.current) {
          setCriteriaScores(criteriaData);
        }
      }

      // Calculate leaderboard (for admin and managers only)
      if (currentUser.role === "admin" || currentUser.role === "truong_phong") {
        const userScores: Record<
          string,
          { totalScore: number; count: number; user: User | null | undefined }
        > = {};

        for (const evaluation of periodEvaluations) {
          const userId = evaluation.nguoiDuocDanhGiaId;
          const user = evaluation.nguoiDuocDanhGia;
          if (!userScores[userId]) {
            userScores[userId] = { totalScore: 0, count: 0, user };
          }
          if (evaluation.diemTrungBinh) {
            userScores[userId].totalScore += evaluation.diemTrungBinh;
            userScores[userId].count++;
          }
        }

        const leaderboardData: LeaderboardEntry[] = Object.values(userScores)
          .filter((data) => data.user && data.count > 0)
          .map((data) => ({
            user: data.user!,
            averageScore: data.totalScore / data.count,
            totalEvaluations: data.count,
            rank: 0,
          }))
          .sort((a, b) => b.averageScore - a.averageScore)
          .map((entry, index) => ({ ...entry, rank: index + 1 }))
          .slice(0, 10);

        if (!cancelledRef.current) {
          setLeaderboard(leaderboardData);
        }
      }
    } catch (error) {
      if (!cancelledRef.current) {
        console.error("Failed to load report data:", error);
      }
    } finally {
      if (!cancelledRef.current) {
        setIsLoading(false);
      }
    }
  }, [currentUser, selectedKyId, selectedPhongBanId]);

  useEffect(() => {
    if (!selectedKyId) return;

    const cancelledRef = { current: false };
    loadReportData(cancelledRef);

    return () => {
      cancelledRef.current = true;
    };
  }, [selectedKyId, selectedPhongBanId, loadReportData]);

  const loadKyDanhGias = async () => {
    try {
      const result = await getAllKyDanhGias();
      const kys = result.success && result.data ? result.data : [];
      setKyDanhGias(kys as any);
      if (kys.length > 0) {
        // Select the most recent active period or the first one
        const activeKy = kys.find((ky) => ky.dangMo);
        setSelectedKyId(activeKy?.id || kys[0].id);
      }
    } catch (error) {
      console.error("Failed to load evaluation periods:", error);
    }
  };

  const loadPhongBans = async () => {
    if (!currentUser) return;

    try {
      const result = await getAllPhongBans();
      const allPhongBans = result.success && result.data ? result.data : [];
      setPhongBans(allPhongBans as any);

      // Set default department based on role
      if (currentUser.role === "truong_phong") {
        // Manager can only see their own department
        setSelectedPhongBanId(currentUser.phongBanId);
      } else if (currentUser.role === "admin") {
        // Admin defaults to "all departments" (null means all)
        setSelectedPhongBanId(null);
      } else {
        // Regular employee sees their department
        setSelectedPhongBanId(currentUser.phongBanId);
      }
    } catch (error) {
      console.error("Failed to load departments:", error);
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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <IconTrophy size={24} color="gold" />;
      case 2:
        return <IconMedal size={24} color="silver" />;
      case 3:
        return <IconAward size={24} color="#CD7F32" />;
      default:
        return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "yellow";
      case 2:
        return "gray";
      case 3:
        return "orange";
      default:
        return "blue";
    }
  };

  if (authLoading || isLoading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <Stack gap="lg">
      <Paper withBorder shadow="sm" p="lg" radius="md">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2}>Báo cáo & Phân tích</Title>
            <Text size="sm" c="dimmed" mt="xs">
              Thống kê và phân tích dữ liệu đánh giá
            </Text>
            {currentUser.role === "truong_phong" && (
              <Badge variant="light" color="blue" mt="xs">
                Phòng ban: {phongBans.find((pb) => pb.id === currentUser.phongBanId)?.tenPhongBan || "N/A"}
              </Badge>
            )}
          </div>
          <Flex gap="md" direction={{ base: "column", sm: "row" }}>
            {currentUser.role === "admin" && (
              <Select
                placeholder="Tất cả phòng ban"
                data={[
                  { value: "all", label: "Tất cả phòng ban" },
                  ...phongBans.map((pb) => ({
                    value: pb.id,
                    label: pb.tenPhongBan,
                  })),
                ]}
                value={selectedPhongBanId || "all"}
                onChange={(value) => setSelectedPhongBanId(value === "all" ? null : value)}
                style={{ width: 200 }}
                clearable={false}
              />
            )}
            <Select
              placeholder="Chọn kỳ đánh giá"
              data={kyDanhGias.map((ky) => ({
                value: ky.id,
                label: ky.tenKy,
              }))}
              value={selectedKyId}
              onChange={(value) => setSelectedKyId(value)}
              style={{ width: 250 }}
              clearable={false}
            />
          </Flex>
        </Group>
      </Paper>

      {/* Bar Chart - Score Distribution */}
      <Paper withBorder shadow="sm" p="lg" radius="md">
        <Title order={3} mb="md">
          Phân bố điểm số
        </Title>
        <Text size="sm" c="dimmed" mb="lg">
          Biểu đồ thể hiện phân bố số lượng đánh giá theo thang điểm từ 1-5 sao
        </Text>
        {scoreDistribution.length > 0 ? (
          <BarChart
            h={300}
            data={scoreDistribution}
            dataKey="score"
            series={[{ name: "count", label: "Số lượng", color: "blue.6" }]}
            tickLine="y"
            gridAxis="y"
            tooltipProps={{
              content: ({ label, payload }) => {
                if (!payload || payload.length === 0) return null;
                return (
                  <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{label}</div>
                    <div style={{ color: '#228be6' }}>
                      Số lượng: <strong>{payload[0].value}</strong>
                    </div>
                  </div>
                );
              }
            }}
          />
        ) : (
          <Center h={300}>
            <Text c="dimmed">Chưa có dữ liệu đánh giá</Text>
          </Center>
        )}
      </Paper>

      {/* Radar Chart - Criteria Comparison */}
      <Paper withBorder shadow="sm" p="lg" radius="md">
        <Title order={3} mb="md">
          So sánh tiêu chí năng lực
        </Title>
        <Text size="sm" c="dimmed" mb="lg">
          Biểu đồ radar thể hiện điểm trung bình của các tiêu chí đánh giá
        </Text>
        {criteriaScores.length > 0 ? (
          <RadarChart
            h={400}
            data={criteriaScores}
            dataKey="criteria"
            series={[{ name: "score", label: "Điểm TB", color: "teal.6", opacity: 0.4 }]}
            withPolarGrid
            withPolarAngleAxis
            withPolarRadiusAxis
            withTooltip
            withDots
            polarRadiusAxisProps={{
              domain: [1, 5],
              tick: true,
              angle: 90,
              orientation: "right",
            }}
          />
        ) : (
          <Center h={300}>
            <Text c="dimmed">Chưa có dữ liệu tiêu chí</Text>
          </Center>
        )}
      </Paper>

      {/* Leaderboard - For Admin and Managers */}
      {(currentUser.role === "admin" || currentUser.role === "truong_phong") && (
        <Paper withBorder shadow="sm" p="lg" radius="md">
          <Title order={3} mb="md">
            Bảng xếp hạng
          </Title>
          <Text size="sm" c="dimmed" mb="lg">
            Top nhân viên có điểm đánh giá cao nhất
          </Text>
          {leaderboard.length > 0 ? (
            <Table.ScrollContainer minWidth={600}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Hạng</Table.Th>
                    <Table.Th>Nhân viên</Table.Th>
                    <Table.Th>Điểm TB</Table.Th>
                    <Table.Th>Số đánh giá</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {leaderboard.map((entry) => (
                    <Table.Tr key={entry.user.id}>
                      <Table.Td>
                        <Group gap="xs">
                          {getRankIcon(entry.rank)}
                          <Badge color={getRankColor(entry.rank)} variant="light">
                            #{entry.rank}
                          </Badge>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="sm">
                          <Avatar color="blue" radius="xl">
                            {getInitials(entry.user.hoTen)}
                          </Avatar>
                          <div>
                            <Text fw={500}>{entry.user.hoTen}</Text>
                            <Text size="xs" c="dimmed">
                              {entry.user.maNhanVien}
                            </Text>
                          </div>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge color="blue" size="lg" variant="light">
                          {entry.averageScore.toFixed(2)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text>{entry.totalEvaluations}</Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          ) : (
            <Center h={200}>
              <Text c="dimmed">Chưa có dữ liệu xếp hạng</Text>
            </Center>
          )}
        </Paper>
      )}
    </Stack>
  );
}


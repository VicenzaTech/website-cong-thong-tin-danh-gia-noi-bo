"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Box, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { BottomNavigationBar } from "./BottomNavigationBar";
import { useAuth } from "@/features/auth/AuthContext";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false });

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const theme = useMantineTheme();
  const isMobile = !useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);

  useEffect(() => {
    NProgress.done();
    return () => {
      NProgress.start();
    };
  }, [pathname]);

  if (!user) {
    return <>{children}</>;
  }

  return (
    <Box>
      <Sidebar />
      <Header />
      <BottomNavigationBar />
      <Box
        style={{
          marginLeft: isMobile ? 0 : 280,
          marginTop: 60,
          minHeight: "calc(100vh - 60px)",
          backgroundColor: "var(--mantine-color-body)",
          display: "flex",
          flexDirection: "column",
          paddingBottom: isMobile ? 65 : 0,
        }}
      >
        <Box p="md" style={{ flex: 1 }}>
          {children}
        </Box>
        <Footer />
      </Box>
    </Box>
  );
}


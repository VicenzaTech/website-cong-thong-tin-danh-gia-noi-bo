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
    <Box style={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
      <Sidebar />
      <Header />
      <BottomNavigationBar />
      <Box
        style={{
          marginLeft: isMobile ? 0 : 280,
          marginTop: isMobile ? 56 : 60,
          minHeight: isMobile ? "calc(100vh - 56px)" : "calc(100vh - 60px)",
          backgroundColor: "var(--mantine-color-body)",
          display: "flex",
          flexDirection: "column",
          paddingBottom: isMobile ? 65 : 0,
          width: isMobile ? "100%" : "calc(100% - 280px)",
          maxWidth: "100%",
          overflowX: "hidden",
        }}
      >
        <Box p="md" style={{ flex: 1, width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
          {children}
        </Box>
        <Footer />
      </Box>
    </Box>
  );
}


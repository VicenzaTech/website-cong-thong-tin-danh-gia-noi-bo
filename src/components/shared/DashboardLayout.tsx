"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Box } from "@mantine/core";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
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
      <Box
        style={{
          marginLeft: 280,
          marginTop: 60,
          minHeight: "calc(100vh - 60px)",
          backgroundColor: "var(--mantine-color-gray-0)",
        }}
      >
        <Box p="md">{children}</Box>
      </Box>
    </Box>
  );
}


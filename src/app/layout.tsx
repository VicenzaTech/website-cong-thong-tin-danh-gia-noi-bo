import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ColorSchemeScript } from "@mantine/core";
import { Providers } from "./providers";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import "./globals.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Hệ thống Đánh giá Nội bộ",
  description: "Hệ thống quản lý và đánh giá năng lực nhân sự nội bộ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <ColorSchemeScript />
      </head>
      <body className={inter.variable}>
        <Providers>
          <DashboardLayout>{children}</DashboardLayout>
        </Providers>
      </body>
    </html>
  );
}

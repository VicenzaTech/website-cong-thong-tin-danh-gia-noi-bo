import type { Metadata, Viewport } from "next";
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
  title: "Hệ thống Đánh giá Nội bộ - Vicenza",
  description: "Hệ thống quản lý và đánh giá năng lực nhân sự nội bộ",
  icons: {
    icon: "/logo-vicenza.ico",
    shortcut: "/logo-vicenza.ico",
    apple: "/logo-vicenza.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning style={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
      <head>
        <ColorSchemeScript />
      </head>
      <body className={inter.variable} style={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
        <Providers>
          <DashboardLayout>{children}</DashboardLayout>
        </Providers>
      </body>
    </html>
  );
}

"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { theme } from "@/styles/theme";
import { NextAuthProvider } from "@/features/auth/NextAuthProvider";
import { AuthProvider } from "@/features/auth/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <NextAuthProvider>
        <AuthProvider>
          <Notifications position="bottom-right" />
          {children}
        </AuthProvider>
      </NextAuthProvider>
    </MantineProvider>
  );
}


"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { theme } from "@/styles/theme";
import { NextAuthProvider } from "@/features/auth/NextAuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme}>
      <NextAuthProvider>
        <Notifications position="bottom-right" />
        {children}
      </NextAuthProvider>
    </MantineProvider>
  );
}


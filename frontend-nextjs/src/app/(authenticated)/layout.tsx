"use client";

import { useEffect, useState } from "react";

import { Box } from "@mui/material";

import AuthGuard from "@/components/auth/AuthGuard";
import AppHeader from "@/components/layout/AppHeader";
import type { AuthUser } from "@/types/auth.types";
import { authStorage } from "@/utils/auth-storage";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const handleUserUpdated = () => {
      setUser(authStorage.getUser());
    };

    handleUserUpdated();

    window.addEventListener("user-updated", handleUserUpdated);

    return () => {
      window.removeEventListener("user-updated", handleUserUpdated);
    };
  }, []);

  return (
    <AuthGuard>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AppHeader userName={user?.name || ""} />

        <Box
          component="main"
          sx={{
            flex: 1,
            p: 3,
          }}
        >
          {children}
        </Box>
      </Box>
    </AuthGuard>
  );
}

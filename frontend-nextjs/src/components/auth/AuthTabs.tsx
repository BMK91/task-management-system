"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Box, Paper, Tab, Tabs, Typography } from "@mui/material";

import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

type AuthTab = "login" | "register";

export default function AuthTabs() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AuthTab>("login");

  const loginFirstFieldRef = useRef<HTMLInputElement>(null);
  const registerFirstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "login") {
        loginFirstFieldRef.current?.focus();
      } else {
        registerFirstFieldRef.current?.focus();
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleSuccess = () => {
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <Paper
      elevation={4}
      sx={{
        width: "100%",
        maxWidth: 450,
        p: 3,
        borderRadius: 3,
      }}
    >
      <Typography
        variant="h5"
        component="h1"
        sx={{
          fontWeight: 600,
          textAlign: "center",
          mb: 2,
        }}
      >
        Task Management System
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, value: AuthTab) => setActiveTab(value)}
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        <Tab label="Login" value="login" />

        <Tab label="Register" value="register" />
      </Tabs>

      <Box>
        {activeTab === "login" && (
          <LoginForm
            onSuccess={handleSuccess}
            firstFieldRef={loginFirstFieldRef}
          />
        )}

        {activeTab === "register" && (
          <RegisterForm
            onSuccess={() => setActiveTab("login")}
            firstFieldRef={registerFirstFieldRef}
          />
        )}
      </Box>
    </Paper>
  );
}

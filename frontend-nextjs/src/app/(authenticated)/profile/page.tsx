"use client";

import { useEffect, useRef, useState } from "react";

import {
  Box,
  CircularProgress,
  Divider,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import ProfileDetailsForm from "@/components/profile/ProfileDetailsForm";
import { useProfile } from "@/hooks/profile/useProfile";
import { useNotification } from "@/providers/NotificationProvider";
import { Profile } from "@/types/profile.types";
import { authStorage } from "@/utils/auth-storage";

type ProfileTab = "profile" | "password";

export default function ProfilePage() {
  const profileNameRef = useRef<HTMLInputElement>(null);
  const currentPasswordRef = useRef<HTMLInputElement>(null);

  const { showSuccess } = useNotification();
  const profileQuery = useProfile();

  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "profile") {
        profileNameRef.current?.focus();
      } else {
        currentPasswordRef.current?.focus();
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleProfileSuccess = (profile: Profile) => {
    profileQuery.refetch();

    const currentUser = authStorage.getUser();
    if (currentUser) {
      authStorage.setUser({
        ...currentUser,
        name: profile.name,
      });
    }

    setTimeout(() => {
      profileNameRef.current?.focus();
    }, 0);

    showSuccess("Profile updated successfully");
  };

  const handlePasswordSuccess = () => {
    setActiveTab("profile");
    showSuccess("Password changed successfully");
  };

  if (profileQuery.isLoading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <Box
        sx={{
          maxWidth: 700,
          mx: "auto",
          mt: 4,
          px: 2,
        }}
      >
        <Typography color="error">
          {profileQuery.error instanceof Error
            ? profileQuery.error.message
            : "Unable to load profile."}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 700,
        mx: "auto",
        mt: 4,
        px: 2,
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 600,
          mb: 3,
        }}
      >
        Profile
      </Typography>

      <Paper
        elevation={2}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, value: ProfileTab) => setActiveTab(value)}
          variant="fullWidth"
        >
          <Tab label="Profile Details" value="profile" />

          <Tab label="Change Password" value="password" />
        </Tabs>

        <Divider />

        <Box sx={{ p: { xs: 2, sm: 4 } }}>
          {activeTab === "profile" && (
            <ProfileDetailsForm
              profile={profileQuery.data}
              onSuccess={handleProfileSuccess}
              firstFieldRef={profileNameRef}
            />
          )}

          {activeTab === "password" && (
            <ChangePasswordForm
              onSuccess={handlePasswordSuccess}
              firstFieldRef={currentPasswordRef}
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
}

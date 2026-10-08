"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { ExpandMore, Logout } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";

import { useProfile } from "@/hooks/profile/useProfile";
import { useNotification } from "@/providers/NotificationProvider";
import { authStorage } from "@/utils/auth-storage";
import { getProfilePhotoUrl } from "@/utils/profile-photo";

import ThemeModeSelector from "./ThemeModeSelector";

interface AppHeaderProps {
  userName: string;
}

export default function AppHeader({ userName }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { showSuccess } = useNotification();
  const { data: profile } = useProfile();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    router.push("/profile");
  };

  const handleLogout = () => {
    handleMenuClose();

    authStorage.clear();

    showSuccess("Logged out successfully");

    router.replace("/auth");
  };

  const isActive = (path: string): boolean => {
    return pathname === path;
  };

  return (
    <AppBar position="static" elevation={1} color="default">
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            minHeight: 64,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {/* Left side */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Typography
              component={Link}
              href="/dashboard"
              variant="h6"
              sx={{
                textDecoration: "none",
                color: "primary.main",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              Task Management
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Button
                component={Link}
                href="/dashboard"
                variant={isActive("/dashboard") ? "contained" : "text"}
              >
                Dashboard
              </Button>

              <Button
                component={Link}
                href="/tasks"
                variant={isActive("/tasks") ? "contained" : "text"}
              >
                Tasks
              </Button>
            </Box>
          </Box>

          {/* User menu */}
          <Box>
            <Button
              color="inherit"
              onClick={handleMenuOpen}
              endIcon={<ExpandMore />}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                minWidth: "auto",
                px: 1,
                gap: 1,
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <Avatar
                src={getProfilePhotoUrl(profile?.profilePhoto)}
                alt={profile?.name ?? "User"}
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: "0.875rem",
                }}
              >
                {!profile?.profilePhoto &&
                  profile?.name?.charAt(0).toUpperCase()}
              </Avatar>

              <Box
                component="span"
                sx={{
                  maxWidth: 140,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userName}
              </Box>
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              slotProps={{
                paper: {
                  sx: {
                    minWidth: 260,
                    mt: 1,
                  },
                },
              }}
            >
              {/* Profile */}
              <MenuItem onClick={handleProfile}>
                <Avatar
                  src={getProfilePhotoUrl(profile?.profilePhoto)}
                  alt={profile?.name ?? "User"}
                  sx={{
                    width: 28,
                    height: 28,
                    mr: 1.5,
                    fontSize: "0.8rem",
                  }}
                >
                  {!profile?.profilePhoto &&
                    profile?.name?.charAt(0).toUpperCase()}
                </Avatar>

                <Typography>Profile</Typography>
              </MenuItem>

              <Divider />

              {/* Theme */}
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 1,
                    fontWeight: 500,
                  }}
                >
                  Theme
                </Typography>

                <ThemeModeSelector />
              </Box>

              <Divider />

              {/* Logout */}
              <MenuItem onClick={handleLogout}>
                <Logout
                  fontSize="small"
                  sx={{
                    mr: 1.5,
                    color: "error.main",
                  }}
                />

                <Typography color="error">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

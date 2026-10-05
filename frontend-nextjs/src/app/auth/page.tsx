import { Box } from "@mui/material";

import AuthTabs from "@/components/auth/AuthTabs";
import GuestGuard from "@/components/auth/GuestGuard";

export default function AuthPage() {
  return (
    <GuestGuard>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          pt: {
            xs: 4,
            sm: 8,
          },
          px: 2,
          backgroundColor: "background.default",
        }}
      >
        <AuthTabs />
      </Box>
    </GuestGuard>
  );
}

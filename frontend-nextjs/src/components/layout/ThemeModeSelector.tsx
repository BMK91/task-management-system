"use client";

import { DarkMode, LightMode, SettingsBrightness } from "@mui/icons-material";
import { Box, Button } from "@mui/material";

import { useThemeMode } from "@/providers/MuiProvider";

type ThemeMode = "system" | "light" | "dark";

const themeOptions: {
  value: ThemeMode;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "system",
    label: "System",
    icon: <SettingsBrightness fontSize="small" />,
  },
  {
    value: "light",
    label: "Light",
    icon: <LightMode fontSize="small" />,
  },
  {
    value: "dark",
    label: "Dark",
    icon: <DarkMode fontSize="small" />,
  },
];

export default function ThemeModeSelector() {
  const { mode, setMode } = useThemeMode();

  const handleChange = (value: ThemeMode) => {
    setMode(value);
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 0.5,
        width: "100%",
      }}
    >
      {themeOptions.map((option) => {
        const selected = mode === option.value;

        return (
          <Button
            key={option.value}
            onClick={() => handleChange(option.value)}
            variant={selected ? "contained" : "outlined"}
            color={selected ? "primary" : "inherit"}
            startIcon={option.icon}
            size="small"
            sx={{
              flex: 1,
              minWidth: 0,
              px: 1,
              textTransform: "none",
              fontSize: "0.8rem",
            }}
          >
            {option.label}
          </Button>
        );
      })}
    </Box>
  );
}

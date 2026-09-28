"use client";

import { Alert, Snackbar, type AlertColor } from "@mui/material";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface NotificationOptions {
  message: string;
  severity?: AlertColor;
  duration?: number;
}

interface NotificationContextValue {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  showNotification: (options: NotificationOptions) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

interface NotificationState {
  open: boolean;
  message: string;
  severity: AlertColor;
  duration: number;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export default function NotificationProvider({
  children,
}: NotificationProviderProps) {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: "",
    severity: "info",
    duration: 4000,
  });

  const showNotification = useCallback(
    ({ message, severity = "info", duration = 4000 }: NotificationOptions) => {
      setNotification({
        open: true,
        message,
        severity,
        duration,
      });
    },
    [],
  );

  const showSuccess = useCallback(
    (message: string) => {
      showNotification({
        message,
        severity: "success",
      });
    },
    [showNotification],
  );

  const showError = useCallback(
    (message: string) => {
      showNotification({
        message,
        severity: "error",
      });
    },
    [showNotification],
  );

  const showWarning = useCallback(
    (message: string) => {
      showNotification({
        message,
        severity: "warning",
      });
    },
    [showNotification],
  );

  const showInfo = useCallback(
    (message: string) => {
      showNotification({
        message,
        severity: "info",
      });
    },
    [showNotification],
  );

  const handleClose = useCallback(() => {
    setNotification((current) => ({
      ...current,
      open: false,
    }));
  }, []);

  const value = useMemo(
    () => ({
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showNotification,
    }),
    [showSuccess, showError, showWarning, showInfo, showNotification],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}

      <Snackbar
        open={notification.open}
        autoHideDuration={notification.duration}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert
          onClose={handleClose}
          severity={notification.severity}
          variant="filled"
          elevation={6}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export function useNotification(): NotificationContextValue {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotification must be used inside NotificationProvider");
  }

  return context;
}

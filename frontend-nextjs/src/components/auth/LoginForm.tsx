"use client";

import { RefObject } from "react";

import { Box, Button, CircularProgress, Stack, TextField } from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";

import { useNotification } from "@/providers/NotificationProvider";
import { loginSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { getApiErrorMessage } from "@/utils/api-error";
import { authStorage } from "@/utils/auth-storage";

interface LoginFormProps {
  onSuccess: () => void;
  firstFieldRef: RefObject<HTMLInputElement | null>;
}

export default function LoginForm({
  onSuccess,
  firstFieldRef,
}: LoginFormProps) {
  const { showSuccess, showError } = useNotification();

  const loginMutation = useMutation({
    mutationFn: authService.login,

    onSuccess: (response) => {
      const { data } = response;

      authStorage.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      authStorage.setUser(data.user);

      showSuccess("Logged-in successfully");
      onSuccess();
    },

    onError: (error: any) => {
      showError(
        getApiErrorMessage(
          error,
          "Unable to login. Please check your credentials.",
        ),
      );
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },

    validators: {
      onSubmit: loginSchema,
    },

    onSubmit: async ({ value }) => {
      await loginMutation.mutateAsync(value);
    },
  });

  return (
    <Box
      component="form"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <Stack spacing={2.5}>
        <form.Field
          name="email"
          children={(field) => (
            <TextField
              fullWidth
              inputRef={firstFieldRef}
              label="Email"
              type="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              error={
                field.state.meta.isTouched && field.state.meta.errors.length > 0
              }
              helperText={
                field.state.meta.isTouched
                  ? field.state.meta.errors[0]?.message
                  : ""
              }
            />
          )}
        />

        <form.Field
          name="password"
          children={(field) => (
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              error={
                field.state.meta.isTouched && field.state.meta.errors.length > 0
              }
              helperText={
                field.state.meta.isTouched
                  ? field.state.meta.errors[0]?.message
                  : ""
              }
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Login"
          )}
        </Button>
      </Stack>
    </Box>
  );
}

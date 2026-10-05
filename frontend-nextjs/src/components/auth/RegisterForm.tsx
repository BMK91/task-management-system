"use client";

import { RefObject } from "react";

import { Box, Button, CircularProgress, Stack, TextField } from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";

import { useNotification } from "@/providers/NotificationProvider";
import { registerSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { getApiErrorMessage } from "@/utils/api-error";

interface RegisterFormProps {
  onSuccess: () => void;
  firstFieldRef: RefObject<HTMLInputElement | null>;
}

export default function RegisterForm({
  onSuccess,
  firstFieldRef,
}: RegisterFormProps) {
  const { showSuccess, showError } = useNotification();

  const registerMutation = useMutation({
    mutationFn: authService.register,

    onSuccess: (response) => {
      showSuccess("Account created successfully");
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
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },

    validators: {
      onSubmit: registerSchema,
    },

    onSubmit: async ({ value }) => {
      await registerMutation.mutateAsync({
        name: value.name,
        email: value.email,
        password: value.password,
      });
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
          name="name"
          children={(field) => (
            <TextField
              fullWidth
              inputRef={firstFieldRef}
              label="Name"
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
          name="email"
          children={(field) => (
            <TextField
              fullWidth
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

        <form.Field
          name="confirmPassword"
          children={(field) => (
            <TextField
              fullWidth
              label="Confirm Password"
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
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Create Account"
          )}
        </Button>
      </Stack>
    </Box>
  );
}

"use client";

import { Box, Button, TextField } from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";

import { useNotification } from "@/providers/NotificationProvider";
import { changePassword } from "@/services/profile.service";
import { getApiErrorMessage } from "@/utils/api-error";

interface ChangePasswordFormProps {
  onSuccess: () => void;
  firstFieldRef: React.RefObject<HTMLInputElement | null>;
}

export default function ChangePasswordForm({
  onSuccess,
  firstFieldRef,
}: ChangePasswordFormProps) {
  const { showSuccess, showError } = useNotification();

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,

    onSuccess: () => {
      form.reset();

      showSuccess("Password changed successfully");

      onSuccess();
    },

    onError: (error: any) => {
      showError(
        getApiErrorMessage(
          error,
          "Unable to change password. Please try again.",
        ),
      );
    },
  });

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },

    onSubmit: async ({ value }) => {
      await changePasswordMutation.mutateAsync({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
        confirmPassword: value.confirmPassword,
      });

      form.reset();

      onSuccess();
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
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
      }}
    >
      <form.Field
        name="currentPassword"
        validators={{
          onChange: ({ value }) =>
            !value ? "Current password is required" : undefined,
        }}
      >
        {(field) => (
          <TextField
            label="Current Password"
            inputRef={firstFieldRef}
            type="password"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
            error={
              field.state.meta.isTouched && field.state.meta.errors.length > 0
            }
            helperText={
              field.state.meta.isTouched ? field.state.meta.errors[0] : ""
            }
            fullWidth
            autoComplete="current-password"
          />
        )}
      </form.Field>

      <form.Field
        name="newPassword"
        validators={{
          onChange: ({ value }) => {
            if (!value) {
              return "New password is required";
            }

            if (value.length < 8) {
              return "Password must be at least 8 characters";
            }

            return undefined;
          },
        }}
      >
        {(field) => (
          <TextField
            label="New Password"
            type="password"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
            error={
              field.state.meta.isTouched && field.state.meta.errors.length > 0
            }
            helperText={
              field.state.meta.isTouched ? field.state.meta.errors[0] : ""
            }
            fullWidth
            autoComplete="new-password"
          />
        )}
      </form.Field>

      <form.Field
        name="confirmPassword"
        validators={{
          onChangeListenTo: ["newPassword"],
          onChange: ({ value, fieldApi }) => {
            if (!value) {
              return "Confirm password is required";
            }

            if (value !== fieldApi.form.getFieldValue("newPassword")) {
              return "Passwords do not match";
            }

            return undefined;
          },
        }}
      >
        {(field) => (
          <TextField
            label="Confirm Password"
            type="password"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
            error={
              field.state.meta.isTouched && field.state.meta.errors.length > 0
            }
            helperText={
              field.state.meta.isTouched ? field.state.meta.errors[0] : ""
            }
            fullWidth
            autoComplete="new-password"
          />
        )}
      </form.Field>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mt: 1,
        }}
      >
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              variant="contained"
              disabled={
                !canSubmit || isSubmitting || changePasswordMutation.isPending
              }
            >
              {isSubmitting || changePasswordMutation.isPending
                ? "Changing..."
                : "Change Password"}
            </Button>
          )}
        </form.Subscribe>
      </Box>
    </Box>
  );
}

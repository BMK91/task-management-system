"use client";

import { useEffect } from "react";

import { Box, Button, TextField, Typography } from "@mui/material";
import { useForm } from "@tanstack/react-form";

import { useUpdateProfile } from "@/hooks/profile/useProfile";
import { Profile } from "@/types/profile.types";
import axios from "axios";

interface ProfileDetailsFormProps {
  profile: Profile;
  firstFieldRef: React.RefObject<HTMLInputElement | null>;
  onSuccess: (profile: Profile) => void;
}

export default function ProfileDetailsForm({
  profile,
  firstFieldRef,
  onSuccess,
}: ProfileDetailsFormProps) {
  const updateProfile = useUpdateProfile();

  const form = useForm({
    defaultValues: {
      name: profile.name,
    },

    onSubmit: async ({ value }) => {
      const updatedProfile = await updateProfile.mutateAsync({
        name: value.name.trim(),
      });

      onSuccess(updatedProfile);
      window.dispatchEvent(new Event("user-updated"));
    },
  });

  useEffect(() => {
    form.setFieldValue("name", profile.name);
  }, [profile.name, form]);

  const getChangePasswordError = () => {
    if (!updateProfile.error) {
      return null;
    }

    if (axios.isAxiosError(updateProfile.error)) {
      return (
        updateProfile.error.response?.data?.message ??
        "Unable to update profile"
      );
    }

    return "Unable to update profile";
  };

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
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 3,
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            Account created on:
          </Typography>

          <Typography variant="body1">
            {formatDate(profile.createdAt)}
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary">
            Last updated:
          </Typography>

          <Typography variant="body1">
            {formatDate(profile.updatedAt)}
          </Typography>
        </Box>
      </Box>

      <form.Field
        name="name"
        validators={{
          onChange: ({ value }) => {
            if (!value.trim()) {
              return "Name is required";
            }

            return undefined;
          },
        }}
      >
        {(field) => (
          <TextField
            label="Name"
            inputRef={firstFieldRef}
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
            autoComplete="name"
          />
        )}
      </form.Field>

      <TextField
        label="Email"
        value={profile.email}
        fullWidth
        slotProps={{
          input: {
            readOnly: true,
          },
        }}
        helperText="Email address cannot be changed"
      />

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
              disabled={!canSubmit || isSubmitting || updateProfile.isPending}
            >
              {isSubmitting || updateProfile.isPending
                ? "Saving..."
                : "Save Changes"}
            </Button>
          )}
        </form.Subscribe>
      </Box>
    </Box>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

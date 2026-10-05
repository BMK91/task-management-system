import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  changePassword,
  getProfile,
  updateProfile,
} from "@/services/profile.service";
import { ChangePasswordPayload, UpdateProfilePayload } from "@/types/profile.types";

export const PROFILE_QUERY_KEY = ["profile"];

export const useProfile = () => {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getProfile,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),

    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, data);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
  });
};

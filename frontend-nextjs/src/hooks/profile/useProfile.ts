import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import profileService from "@/services/profile.service";
import {
  ChangePasswordPayload,
  Profile,
  UpdateProfilePayload,
} from "@/types/profile.types";

export const PROFILE_QUERY_KEY = ["profile"];

export const useProfile = () => {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: profileService.getProfile,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      profileService.updateProfile(payload),

    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, data);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      profileService.changePassword(payload),
  });
};

export const useUploadProfilePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation<Profile, Error, File>({
    mutationFn: profileService.uploadProfilePhoto,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: PROFILE_QUERY_KEY,
      });
    },
  });
};

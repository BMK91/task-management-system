import api from "@/lib/axios";
import {
  ChangePasswordPayload,
  Profile,
  UpdateProfilePayload,
} from "@/types/profile.types";

const base_path = "/user";

export const getProfile = async (): Promise<Profile> => {
  const response = await api.get(`${base_path}/profile`);

  return response.data.data;
};

export const updateProfile = async (
  payload: UpdateProfilePayload,
): Promise<Profile> => {
  const response = await api.put(`${base_path}/profile`, payload);

  return response.data.data;
};

export const changePassword = async (
  payload: ChangePasswordPayload,
): Promise<void> => {
  await api.put(`${base_path}/change-password`, payload);
};

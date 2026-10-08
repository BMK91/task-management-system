import api from "@/lib/axios";
import {
  ChangePasswordPayload,
  Profile,
  UpdateProfilePayload,
} from "@/types/profile.types";

const base_path = "/user";

const getProfile = async (): Promise<Profile> => {
  const response = await api.get(`${base_path}/profile`);

  return response.data.data;
};

const updateProfile = async (
  payload: UpdateProfilePayload,
): Promise<Profile> => {
  const response = await api.put(`${base_path}/profile`, payload);

  return response.data.data;
};

const changePassword = async (
  payload: ChangePasswordPayload,
): Promise<void> => {
  await api.put(`${base_path}/change-password`, payload);
};

const uploadProfilePhoto = async (file: File): Promise<Profile> => {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await api.post(`${base_path}/profile/photo`, formData, {
    headers: {
      "Content-Type": undefined,
    },
  });

  return response.data.data;
};

export default {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfilePhoto,
};

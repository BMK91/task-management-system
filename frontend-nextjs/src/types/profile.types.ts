export interface Profile {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  name: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

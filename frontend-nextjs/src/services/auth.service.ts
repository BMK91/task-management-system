import apiClient from "@/lib/axios";

import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "@/types/auth.types";

const base_path = "/auth";

export const authService = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      `${base_path}/login`,
      payload,
    );

    return response.data;
  },

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      `${base_path}/register`,
      payload,
    );

    return response.data;
  },
};

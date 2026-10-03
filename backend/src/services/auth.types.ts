import type { Role } from "@constants/user.roles.js";

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterUserResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: Date;
}

export interface CurrentUserResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: Date;
  updatedAt?: Date;
}

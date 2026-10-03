export const USER_ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ALL_ROLES: UserRole[] = [USER_ROLES.ADMIN, USER_ROLES.USER];

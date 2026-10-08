const API_ORIGIN = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(
  /\/api\/v1\/?$/,
  "",
);

export function getProfilePhotoUrl(
  profilePhoto?: string | null,
): string | undefined {
  if (!profilePhoto) {
    return undefined;
  }

  const normalizedPath = profilePhoto.replaceAll("\\", "/");

  if (
    normalizedPath.startsWith("http://") ||
    normalizedPath.startsWith("https://")
  ) {
    return normalizedPath;
  }

  return `${API_ORIGIN}/${normalizedPath.replace(/^\//, "")}`;
}

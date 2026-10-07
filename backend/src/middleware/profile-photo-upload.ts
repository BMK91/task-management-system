import fs from "fs";
import multer from "multer";
import path from "path";

import { HTTP_STATUS } from "@constants/http-status.js";
import { ApiError } from "@utils/api-error.js";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
];

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const userId = req.user?.id;

    if (!userId) {
      return cb(
        new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          "UNAUTHORIZED",
          "Authentication required.",
        ),
        "",
      );
    }

    const uploadDirectory = path.join(
      process.cwd(),
      "uploads",
      "profile-photos",
      String(userId),
    );

    fs.mkdirSync(uploadDirectory, {
      recursive: true,
    });

    cb(null, uploadDirectory);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const originalName = path.basename(
      file.originalname,
      path.extname(file.originalname),
    );

    const sanitizedName = originalName
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .replace(/_+/g, "_");

    const timestamp = Date.now();

    cb(
      null,
      `${sanitizedName}_${timestamp}${extension}`,
    );
  },
});

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb,
) => {
  const extension = path.extname(file.originalname).toLowerCase();

  const isValidMimeType =
    ALLOWED_MIME_TYPES.includes(file.mimetype);

  const isValidExtension =
    ALLOWED_EXTENSIONS.includes(extension);

  if (!isValidMimeType || !isValidExtension) {
    return cb(
      new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "INVALID_FILE_TYPE",
        "Only JPG, JPEG, PNG and WEBP image files are allowed.",
      ),
    );
  }

  cb(null, true);
};

export const profilePhotoUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});
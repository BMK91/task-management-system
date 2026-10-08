"use client";

import { useEffect, useRef, useState } from "react";

import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CloseIcon from "@mui/icons-material/Close";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import type { Area, Point } from "react-easy-crop";
import Cropper from "react-easy-crop";

import { useUploadProfilePhoto } from "@/hooks/profile/useProfile";
import { getProfilePhotoUrl } from "@/utils/profile-photo";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

interface ProfilePhotoCropperProps {
  profilePhoto?: string | null;
  name: string;
  onPhotoUpdated?: () => void;
}

export default function ProfilePhotoCropper({
  profilePhoto,
  name,
  onPhotoUpdated,
}: ProfilePhotoCropperProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const uploadProfilePhoto = useUploadProfilePhoto();

  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    getProfilePhotoUrl(profilePhoto),
  );

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(() => {
    setPreviewUrl(getProfilePhotoUrl(profilePhoto));
  }, [profilePhoto]);

  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return "Image size must not exceed 2 MB.";
    }

    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;

    if (
      !ALLOWED_TYPES.includes(file.type) &&
      !ALLOWED_EXTENSIONS.includes(extension)
    ) {
      return "Only JPG, JPEG, PNG and WEBP image files are allowed.";
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPhotoError(null);

    const validationError = validateFile(file);

    if (validationError) {
      setPhotoError(validationError);
      event.target.value = "";
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setSelectedImage(imageUrl);

    event.target.value = "";
  };

  const handleCropComplete = (_: Area, croppedPixels: Area): void => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleCloseCropper = () => {
    setSelectedImage(null);
    setPhotoError(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleUpload = async () => {
    if (!selectedImage || !croppedAreaPixels) {
      return;
    }

    try {
      setPhotoError(null);

      const croppedFile = await createCroppedImage(
        selectedImage,
        croppedAreaPixels,
      );

      const validationError = validateFile(croppedFile);

      if (validationError) {
        setPhotoError(validationError);
        return;
      }

      await uploadProfilePhoto.mutateAsync(croppedFile);

      setPreviewUrl(URL.createObjectURL(croppedFile));
      handleCloseCropper();

      onPhotoUpdated?.();
    } catch {
      setPhotoError("Unable to upload profile photo.");
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box sx={{ position: "relative" }}>
          <Avatar
            src={previewUrl}
            alt={name}
            sx={{
              width: 96,
              height: 96,
              fontSize: "2rem",
            }}
          >
            {!previewUrl && name.charAt(0).toUpperCase()}
          </Avatar>

          <IconButton
            size="small"
            color="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadProfilePhoto.isPending}
            sx={{
              position: "absolute",
              right: -4,
              bottom: -4,
              backgroundColor: "background.paper",
              boxShadow: 2,
              "&:hover": {
                backgroundColor: "background.paper",
              },
            }}
          >
            <CameraAltIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: "600" }}>
            Profile Photo
          </Typography>

          <Typography variant="body2" color="text.secondary">
            JPG, JPEG, PNG or WEBP. Maximum 2 MB.
          </Typography>

          {photoError && (
            <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
              {photoError}
            </Typography>
          )}

          <Button
            type="button"
            variant="outlined"
            size="small"
            startIcon={<CameraAltIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadProfilePhoto.isPending}
            sx={{ mt: 1 }}
          >
            {uploadProfilePhoto.isPending ? "Uploading..." : "Change Photo"}
          </Button>
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
        />
      </Box>

      <Dialog
        open={Boolean(selectedImage)}
        onClose={handleCloseCropper}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          Crop Profile Photo
          <IconButton type="button" onClick={handleCloseCropper}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {selectedImage && (
            <Stack spacing={3}>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: 360,
                  backgroundColor: "black",
                  overflow: "hidden",
                }}
              >
                <Cropper
                  image={selectedImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                />
              </Box>

              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Zoom
                </Typography>

                <Slider
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(_, value) => {
                    if (typeof value === "number") {
                      setZoom(value);
                    }
                  }}
                />
              </Box>

              {photoError && (
                <Typography variant="body2" color="error">
                  {photoError}
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            type="button"
            onClick={handleCloseCropper}
            disabled={uploadProfilePhoto.isPending}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="contained"
            onClick={() => void handleUpload()}
            disabled={!croppedAreaPixels || uploadProfilePhoto.isPending}
          >
            {uploadProfilePhoto.isPending ? "Uploading..." : "Save Photo"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

async function createCroppedImage(imageSrc: string, crop: Area): Promise<File> {
  const image = await loadImage(imageSrc);

  const canvas = document.createElement("canvas");

  const outputSize = 512;

  canvas.width = outputSize;
  canvas.height = outputSize;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to create image canvas.");
  }

  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.9);
  });

  if (!blob) {
    throw new Error("Unable to create cropped image.");
  }

  return new File([blob], "profile-photo.jpg", {
    type: "image/jpeg",
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image."));

    image.src = src;
  });
}

import { apiClient } from "./base";
import { API_ENDPOINTS } from "@/shared/constants";

/**
 * Avatar API responses
 */
export interface AvatarUrlResponse {
  avatarUrl: string;
}

export interface AvatarUploadResponse {
  storageKey: string;
  avatarUrl: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
}

export interface ErrorResponse {
  errorCode: string;
  message: string;
}

/**
 * Avatar API for user avatar management
 */
export const avatarApi = {
  /**
   * Get current user's avatar URL
   * Returns presigned URL for secure access
   */
  async getAvatarUrl(): Promise<AvatarUrlResponse> {
    const response = await apiClient.get<AvatarUrlResponse>(API_ENDPOINTS.USERS.AVATAR);
    return response.data;
  },

  /**
   * Upload new avatar for current user
   * @param file - Avatar image file (JPEG, PNG, WebP, GIF - max 5MB)
   */
  async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<AvatarUploadResponse>(
      API_ENDPOINTS.USERS.AVATAR,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  /**
   * Delete current user's avatar
   */
  async deleteAvatar(): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.USERS.AVATAR);
  },

  /**
   * Validate avatar file before upload
   * @param file - File to validate
   */
  validateAvatarFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Invalid file type. Please use JPEG, PNG, WebP, or GIF.",
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: "File size exceeds 5MB limit.",
      };
    }

    return { valid: true };
  },
};

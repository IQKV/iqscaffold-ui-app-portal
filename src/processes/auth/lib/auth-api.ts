import { apiClient } from "@/shared/api";
import { getAuthConfig } from "@/app/config";
import type { User, UserRegistration } from "@/entities/user";

/**
 * Authentication API responses for authenticated users
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ValidateTokenRequest {
  token: string;
}

export interface ValidateTokenResponse {
  active: boolean;
  tokenId: string | null;
  tokenType: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  user: User | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface EmailStatusResponse {
  email: string;
  emailVerified: boolean;
  registrationDate: string;
  message: string;
}

/**
 * Authentication API for authenticated users
 * Unauthenticated flows (login, signup, forgot password, etc.) are handled by the auth portal
 */
export const authApi = {
  /**
   * Refresh access token
   */
  async refresh(data: RefreshTokenRequest): Promise<TokenResponse> {
    const config = getAuthConfig();
    const response = await apiClient.post<TokenResponse>(
      config.endpoints.refresh,
      data
    );
    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    const config = getAuthConfig();
    await apiClient.post(config.endpoints.logout);
  },

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<ValidateTokenResponse> {
    const config = getAuthConfig();
    const response = await apiClient.post<ValidateTokenResponse>(
      config.endpoints.validateToken,
      { token }
    );
    return response.data;
  },

  /**
   * Change password for authenticated user
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const config = getAuthConfig();
    await apiClient.patch(config.endpoints.changePassword, {
      currentPassword,
      newPassword,
    });
  },

  /**
   * Logout from all devices
   */
  async logoutAll(): Promise<void> {
    const config = getAuthConfig();
    await apiClient.post(config.endpoints.logoutAll);
  },

  /**
   * Get email verification status for authenticated user
   */
  async getEmailStatus(email: string): Promise<EmailStatusResponse> {
    const config = getAuthConfig();
    const response = await apiClient.get<EmailStatusResponse>(
      config.endpoints.emailStatus,
      {
        params: { email },
      }
    );
    return response.data;
  },
};

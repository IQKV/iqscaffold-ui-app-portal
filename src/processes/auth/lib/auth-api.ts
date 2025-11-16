import { apiClient } from "@/shared/api";
import { getAuthConfig } from "@/app/config";
import type { User, UserRegistration } from "@/entities/user";

/**
 * Authentication API responses
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface UserRegistrationResponse {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  createdAt: string;
  message: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe: boolean;
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
 * Authentication API
 */
export const authApi = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const config = getAuthConfig();
    const response = await apiClient.post<TokenResponse>(
      config.endpoints.login,
      credentials
    );
    return response.data;
  },

  /**
   * Register new user
   */
  async signup(data: UserRegistration): Promise<UserRegistrationResponse> {
    const config = getAuthConfig();
    const response = await apiClient.post<UserRegistrationResponse>(
      config.endpoints.signup,
      data
    );
    return response.data;
  },

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
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    const config = getAuthConfig();
    await apiClient.post(config.endpoints.forgotPassword, { email });
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const config = getAuthConfig();
    await apiClient.post(config.endpoints.resetPassword, {
      token,
      newPassword,
    });
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    const config = getAuthConfig();
    await apiClient.post(config.endpoints.verifyEmail, { token });
  },

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<void> {
    const config = getAuthConfig();
    await apiClient.post(config.endpoints.resendVerification, { email });
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
   * Get email verification status
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

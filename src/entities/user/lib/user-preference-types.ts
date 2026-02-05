/**
 * User Preference types
 * Matches backend UserPreferenceDto and UpdateUserPreferenceRequest
 */

export interface UserPreference {
  id: number;
  userId: number;
  username: string;
  locale: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  theme: "light" | "dark" | "auto";
  profilePhotoUrl: string | null;
  phoneNumber: string | null;
  bio: string | null;
  notificationEmail: boolean;
  notificationSms: boolean;
  notificationPush: boolean;
  twoFactorEnabled: boolean;
  twoFactorMethod: "sms" | "email" | "app" | null;
  customSettings: string | null;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserPreferenceRequest {
  locale?: string;
  timezone?: string;
  currency?: string;
  dateFormat?: string;
  timeFormat?: string;
  theme?: "light" | "dark" | "auto";
  profilePhotoUrl?: string;
  phoneNumber?: string;
  bio?: string;
  notificationEmail?: boolean;
  notificationSms?: boolean;
  notificationPush?: boolean;
  twoFactorEnabled?: boolean;
  twoFactorMethod?: "sms" | "email" | "app";
  customSettings?: string;
}

export type ThemeOption = "light" | "dark" | "auto";
export type TwoFactorMethod = "sms" | "email" | "app";

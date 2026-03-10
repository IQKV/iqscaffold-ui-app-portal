/**
 * User Preference API Client
 * Handles all user preference-related API calls
 */

import { apiRequest } from "./base";
import type { UserPreference, UpdateUserPreferenceRequest } from "@/entities/user";

const BASE_PATH = "/v1/users/me/preferences";

export const userPreferenceApi = {
  /**
   * Get current user's preferences
   * Auto-creates default preferences if they don't exist
   */
  getMyPreferences: async (): Promise<UserPreference> => {
    return apiRequest<UserPreference>({
      method: "GET",
      url: BASE_PATH,
    });
  },

  /**
   * Update current user's preferences
   * All fields are optional - only provided fields will be updated
   */
  updateMyPreferences: async (data: UpdateUserPreferenceRequest): Promise<UserPreference> => {
    return apiRequest<UserPreference>({
      method: "PATCH",
      url: BASE_PATH,
      data,
    });
  },

  /**
   * Delete current user's preferences
   * Resets to defaults on next GET request
   */
  deleteMyPreferences: async (): Promise<void> => {
    return apiRequest<void>({
      method: "DELETE",
      url: BASE_PATH,
    });
  },
};

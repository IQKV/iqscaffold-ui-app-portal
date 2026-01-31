/**
 * User Preference API Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { userPreferenceApi } from "./user-preference-api";
import * as base from "./base";

vi.mock("./base", () => ({
  apiRequest: vi.fn(),
}));

describe("userPreferenceApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getMyPreferences", () => {
    it("should call GET /v1/users/me/preferences", async () => {
      const mockPreferences = {
        id: 1,
        userId: 123,
        username: "testuser",
        locale: "en",
        timezone: "UTC",
        currency: "USD",
        dateFormat: "yyyy-MM-dd",
        timeFormat: "HH:mm:ss",
        theme: "light" as const,
        profilePhotoUrl: null,
        phoneNumber: null,
        bio: null,
        notificationEmail: true,
        notificationSms: false,
        notificationPush: true,
        twoFactorEnabled: false,
        twoFactorMethod: null,
        customSettings: null,
        tenantId: "tenant-123",
        createdAt: "2025-11-22T10:00:00",
        updatedAt: "2025-11-22T10:00:00",
      };

      vi.mocked(base.apiRequest).mockResolvedValue(mockPreferences);

      const result = await userPreferenceApi.getMyPreferences();

      expect(base.apiRequest).toHaveBeenCalledWith({
        method: "GET",
        url: "/v1/users/me/preferences",
      });
      expect(result).toEqual(mockPreferences);
    });
  });

  describe("updateMyPreferences", () => {
    it("should call PATCH /v1/users/me/preferences with data", async () => {
      const updateData = {
        theme: "dark" as const,
        locale: "fr",
        notificationEmail: false,
      };

      const mockResponse = {
        id: 1,
        userId: 123,
        username: "testuser",
        locale: "fr",
        timezone: "UTC",
        currency: "USD",
        dateFormat: "yyyy-MM-dd",
        timeFormat: "HH:mm:ss",
        theme: "dark" as const,
        profilePhotoUrl: null,
        phoneNumber: null,
        bio: null,
        notificationEmail: false,
        notificationSms: false,
        notificationPush: true,
        twoFactorEnabled: false,
        twoFactorMethod: null,
        customSettings: null,
        tenantId: "tenant-123",
        createdAt: "2025-11-22T10:00:00",
        updatedAt: "2025-11-22T10:30:00",
      };

      vi.mocked(base.apiRequest).mockResolvedValue(mockResponse);

      const result = await userPreferenceApi.updateMyPreferences(updateData);

      expect(base.apiRequest).toHaveBeenCalledWith({
        method: "PATCH",
        url: "/v1/users/me/preferences",
        data: updateData,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteMyPreferences", () => {
    it("should call DELETE /v1/users/me/preferences", async () => {
      vi.mocked(base.apiRequest).mockResolvedValue(undefined);

      await userPreferenceApi.deleteMyPreferences();

      expect(base.apiRequest).toHaveBeenCalledWith({
        method: "DELETE",
        url: "/v1/users/me/preferences",
      });
    });
  });
});

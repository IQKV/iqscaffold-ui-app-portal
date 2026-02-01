import { describe, it, expect } from "vitest";
import { getAvatarUrlWithCacheBusting } from "./use-avatar";

describe("getAvatarUrlWithCacheBusting", () => {
  it("should return undefined when no avatar URL", () => {
    const result = getAvatarUrlWithCacheBusting();
    expect(result).toBeUndefined();
  });

  it("should return original URL when no timestamp", () => {
    const avatarUrl = "https://example.com/avatar.jpg";
    const result = getAvatarUrlWithCacheBusting(avatarUrl);
    expect(result).toBe(avatarUrl);
  });

  it("should add timestamp query parameter", () => {
    const avatarUrl = "https://example.com/avatar.jpg";
    const timestamp = "2024-01-01T00:00:00Z";
    const result = getAvatarUrlWithCacheBusting(avatarUrl, timestamp);

    expect(result).toBe(`${avatarUrl}?t=${new Date(timestamp).getTime()}`);
  });

  it("should append timestamp to existing query parameters", () => {
    const avatarUrl = "https://example.com/avatar.jpg?size=150";
    const timestamp = "2024-01-01T00:00:00Z";
    const result = getAvatarUrlWithCacheBusting(avatarUrl, timestamp);

    expect(result).toBe(`${avatarUrl}&t=${new Date(timestamp).getTime()}`);
  });
});

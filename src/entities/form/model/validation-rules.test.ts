import { describe, it, expect } from "vitest";
import {
  required,
  email,
  minLength,
  maxLength,
  passwordStrength,
  confirmPassword,
  phoneNumber,
  url,
  numeric,
  alphanumeric,
} from "./validation-rules";

describe("Form Validation Rules", () => {
  describe("required", () => {
    it("returns error for empty string", () => {
      expect(required("")).toBeTruthy();
    });

    it("returns error for whitespace only", () => {
      expect(required("   ")).toBeTruthy();
    });

    it("returns null for valid value", () => {
      expect(required("value")).toBeNull();
    });
  });

  describe("email", () => {
    it("returns null for empty value", () => {
      expect(email("")).toBeNull();
    });

    it("returns null for valid email", () => {
      expect(email("test@example.com")).toBeNull();
      expect(email("user.name@domain.co.uk")).toBeNull();
    });

    it("returns error for invalid email", () => {
      expect(email("invalid")).toBeTruthy();
      expect(email("@example.com")).toBeTruthy();
      expect(email("test@")).toBeTruthy();
      expect(email("test@domain")).toBeTruthy();
    });
  });

  describe("minLength", () => {
    it("returns null for empty value", () => {
      const validator = minLength(5);
      expect(validator("")).toBeNull();
    });

    it("returns null when length meets minimum", () => {
      const validator = minLength(5);
      expect(validator("12345")).toBeNull();
      expect(validator("123456")).toBeNull();
    });

    it("returns error when length is below minimum", () => {
      const validator = minLength(5);
      expect(validator("1234")).toBeTruthy();
    });
  });

  describe("maxLength", () => {
    it("returns null for empty value", () => {
      const validator = maxLength(5);
      expect(validator("")).toBeNull();
    });

    it("returns null when length is within maximum", () => {
      const validator = maxLength(5);
      expect(validator("12345")).toBeNull();
      expect(validator("123")).toBeNull();
    });

    it("returns error when length exceeds maximum", () => {
      const validator = maxLength(5);
      expect(validator("123456")).toBeTruthy();
    });
  });

  describe("passwordStrength", () => {
    it("returns null for empty value", () => {
      expect(passwordStrength("")).toBeNull();
    });

    it("returns error for password less than 8 characters", () => {
      expect(passwordStrength("Pass1")).toBeTruthy();
    });

    it("returns error for password without lowercase", () => {
      expect(passwordStrength("PASSWORD123")).toBeTruthy();
    });

    it("returns error for password without uppercase", () => {
      expect(passwordStrength("password123")).toBeTruthy();
    });

    it("returns error for password without number", () => {
      expect(passwordStrength("Password")).toBeTruthy();
    });

    it("returns null for strong password", () => {
      expect(passwordStrength("Password123")).toBeNull();
      expect(passwordStrength("MyP@ssw0rd")).toBeNull();
    });
  });

  describe("confirmPassword", () => {
    it("returns null for empty value", () => {
      expect(confirmPassword("", { password: "test" })).toBeNull();
    });

    it("returns null when passwords match", () => {
      expect(confirmPassword("Password123", { password: "Password123" })).toBeNull();
    });

    it("returns error when passwords do not match", () => {
      expect(confirmPassword("Password123", { password: "Different123" })).toBeTruthy();
    });

    it("handles missing values object", () => {
      expect(confirmPassword("Password123")).toBeTruthy();
    });
  });

  describe("phoneNumber", () => {
    it("returns null for empty value", () => {
      expect(phoneNumber("")).toBeNull();
    });

    it("returns null for valid phone numbers", () => {
      expect(phoneNumber("+1234567890")).toBeNull();
      expect(phoneNumber("1234567890")).toBeNull();
      expect(phoneNumber("+44 20 1234 5678")).toBeNull();
    });

    it("returns error for invalid phone numbers", () => {
      expect(phoneNumber("abc")).toBeTruthy();
      expect(phoneNumber("123-abc-4567")).toBeTruthy();
      expect(phoneNumber("+")).toBeTruthy();
    });
  });

  describe("url", () => {
    it("returns null for empty value", () => {
      expect(url("")).toBeNull();
    });

    it("returns null for valid URLs", () => {
      expect(url("https://example.com")).toBeNull();
      expect(url("http://localhost:3000")).toBeNull();
      expect(url("https://sub.domain.com/path?query=value")).toBeNull();
    });

    it("returns error for invalid URLs", () => {
      expect(url("not a url")).toBeTruthy();
      expect(url("example.com")).toBeTruthy();
      expect(url("//example.com")).toBeTruthy();
    });
  });

  describe("numeric", () => {
    it("returns null for empty value", () => {
      expect(numeric("")).toBeNull();
    });

    it("returns null for numeric strings", () => {
      expect(numeric("123")).toBeNull();
      expect(numeric("0")).toBeNull();
      expect(numeric("999999")).toBeNull();
    });

    it("returns error for non-numeric strings", () => {
      expect(numeric("abc")).toBeTruthy();
      expect(numeric("12.34")).toBeTruthy();
      expect(numeric("12a")).toBeTruthy();
    });
  });

  describe("alphanumeric", () => {
    it("returns null for empty value", () => {
      expect(alphanumeric("")).toBeNull();
    });

    it("returns null for alphanumeric strings", () => {
      expect(alphanumeric("abc123")).toBeNull();
      expect(alphanumeric("ABC")).toBeNull();
      expect(alphanumeric("123")).toBeNull();
    });

    it("returns error for strings with special characters", () => {
      expect(alphanumeric("abc-123")).toBeTruthy();
      expect(alphanumeric("test@123")).toBeTruthy();
      expect(alphanumeric("hello world")).toBeTruthy();
    });
  });
});

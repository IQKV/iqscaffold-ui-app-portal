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
      expect(required("")).toBe("This field is required");
    });

    it("returns error for whitespace only", () => {
      expect(required("   ")).toBe("This field is required");
    });

    it("returns error for null/undefined", () => {
      expect(required(null as any)).toBe("This field is required");
      expect(required(undefined as any)).toBe("This field is required");
    });

    it("returns null for valid value", () => {
      expect(required("valid")).toBeNull();
    });
  });

  describe("email", () => {
    it("returns null for empty value", () => {
      expect(email("")).toBeNull();
    });

    it("returns error for invalid email", () => {
      expect(email("invalid")).toBe("Invalid email address");
      expect(email("invalid@")).toBe("Invalid email address");
      expect(email("@invalid.com")).toBe("Invalid email address");
      expect(email("invalid.com")).toBe("Invalid email address");
    });

    it("returns null for valid email", () => {
      expect(email("test@example.com")).toBeNull();
      expect(email("user.name+tag@domain.co.uk")).toBeNull();
    });
  });

  describe("minLength", () => {
    const minLength5 = minLength(5);

    it("returns null for empty value", () => {
      expect(minLength5("")).toBeNull();
    });

    it("returns error for short value", () => {
      expect(minLength5("abc")).toBe("Must be at least 5 characters");
    });

    it("returns null for valid length", () => {
      expect(minLength5("abcde")).toBeNull();
      expect(minLength5("abcdef")).toBeNull();
    });
  });

  describe("maxLength", () => {
    const maxLength10 = maxLength(10);

    it("returns null for empty value", () => {
      expect(maxLength10("")).toBeNull();
    });

    it("returns error for long value", () => {
      expect(maxLength10("this is too long")).toBe(
        "Must be no more than 10 characters"
      );
    });

    it("returns null for valid length", () => {
      expect(maxLength10("short")).toBeNull();
      expect(maxLength10("exactly10c")).toBeNull();
    });
  });

  describe("passwordStrength", () => {
    it("returns null for empty value", () => {
      expect(passwordStrength("")).toBeNull();
    });

    it("returns error for short password", () => {
      expect(passwordStrength("Abc1")).toBe(
        "Password must be at least 8 characters"
      );
    });

    it("returns error for password without lowercase", () => {
      expect(passwordStrength("ABCDEFGH1")).toBe(
        "Password must contain at least one lowercase letter"
      );
    });

    it("returns error for password without uppercase", () => {
      expect(passwordStrength("abcdefgh1")).toBe(
        "Password must contain at least one uppercase letter"
      );
    });

    it("returns error for password without number", () => {
      expect(passwordStrength("Abcdefgh")).toBe(
        "Password must contain at least one number"
      );
    });

    it("returns null for strong password", () => {
      expect(passwordStrength("Abcdefgh1")).toBeNull();
      expect(passwordStrength("MyPassword123")).toBeNull();
    });
  });

  describe("confirmPassword", () => {
    it("returns null for empty value", () => {
      expect(confirmPassword("")).toBeNull();
    });

    it("returns error for mismatched passwords", () => {
      expect(confirmPassword("password1", { password: "password2" })).toBe(
        "Passwords do not match"
      );
    });

    it("returns null for matching passwords", () => {
      expect(
        confirmPassword("password123", { password: "password123" })
      ).toBeNull();
    });

    it("handles missing values object", () => {
      expect(confirmPassword("password")).toBe("Passwords do not match");
    });
  });

  describe("phoneNumber", () => {
    it("returns null for empty value", () => {
      expect(phoneNumber("")).toBeNull();
    });

    it("returns error for invalid phone numbers", () => {
      expect(phoneNumber("abc")).toBe("Invalid phone number");
      expect(phoneNumber("123-abc-456")).toBe("Invalid phone number");
      expect(phoneNumber("++123456789")).toBe("Invalid phone number");
    });

    it("returns null for valid phone numbers", () => {
      expect(phoneNumber("1234567890")).toBeNull();
      expect(phoneNumber("+1234567890")).toBeNull();
      expect(phoneNumber("123 456 7890")).toBeNull();
      expect(phoneNumber("+1 234 567 8900")).toBeNull();
    });
  });

  describe("url", () => {
    it("returns null for empty value", () => {
      expect(url("")).toBeNull();
    });

    it("returns error for invalid URLs", () => {
      expect(url("invalid")).toBe("Invalid URL");
      expect(url("http://")).toBe("Invalid URL");
      expect(url("ftp://")).toBe("Invalid URL");
    });

    it("returns null for valid URLs", () => {
      expect(url("https://example.com")).toBeNull();
      expect(url("http://localhost:3000")).toBeNull();
      expect(url("https://subdomain.example.com/path?query=1")).toBeNull();
    });
  });

  describe("numeric", () => {
    it("returns null for empty value", () => {
      expect(numeric("")).toBeNull();
    });

    it("returns error for non-numeric values", () => {
      expect(numeric("abc")).toBe("Must be a number");
      expect(numeric("123abc")).toBe("Must be a number");
      expect(numeric("12.34")).toBe("Must be a number");
    });

    it("returns null for numeric values", () => {
      expect(numeric("123")).toBeNull();
      expect(numeric("0")).toBeNull();
      expect(numeric("999999")).toBeNull();
    });
  });

  describe("alphanumeric", () => {
    it("returns null for empty value", () => {
      expect(alphanumeric("")).toBeNull();
    });

    it("returns error for non-alphanumeric values", () => {
      expect(alphanumeric("abc-123")).toBe(
        "Must contain only letters and numbers"
      );
      expect(alphanumeric("hello world")).toBe(
        "Must contain only letters and numbers"
      );
      expect(alphanumeric("test@123")).toBe(
        "Must contain only letters and numbers"
      );
    });

    it("returns null for alphanumeric values", () => {
      expect(alphanumeric("abc123")).toBeNull();
      expect(alphanumeric("ABC")).toBeNull();
      expect(alphanumeric("123")).toBeNull();
      expect(alphanumeric("Test123")).toBeNull();
    });
  });
});

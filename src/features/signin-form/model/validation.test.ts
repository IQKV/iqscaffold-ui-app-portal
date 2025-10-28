import { describe, it, expect } from "vitest";
import { validateSignInForm, initialSignInValues } from "./validation";

describe("signin-form validation", () => {
  describe("validateSignInForm", () => {
    describe("username validation", () => {
      it("should return error for empty username", () => {
        const result = validateSignInForm.username("");
        expect(result).toBe("Username or email must be at least 3 characters");
      });

      it("should return error for username with less than 3 characters", () => {
        const result = validateSignInForm.username("ab");
        expect(result).toBe("Username or email must be at least 3 characters");
      });

      it("should return null for valid username", () => {
        const result = validateSignInForm.username("user");
        expect(result).toBeNull();
      });

      it("should return null for valid email", () => {
        const result = validateSignInForm.username("test@example.com");
        expect(result).toBeNull();
      });
    });

    describe("password validation", () => {
      it("should return error for empty password", () => {
        const result = validateSignInForm.password("");
        expect(result).toBe("Password is required");
      });

      it("should return null for any non-empty password", () => {
        const result = validateSignInForm.password("p");
        expect(result).toBeNull();
      });

      it("should return null for valid password", () => {
        const result = validateSignInForm.password("password123");
        expect(result).toBeNull();
      });
    });
  });

  describe("initialSignInValues", () => {
    it("should have correct initial values", () => {
      expect(initialSignInValues).toEqual({
        username: "",
        password: "",
        rememberMe: false,
      });
    });

    it("should have rememberMe as false by default", () => {
      expect(initialSignInValues.rememberMe).toBe(false);
    });
  });
});

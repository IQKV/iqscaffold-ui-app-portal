import { describe, it, expect } from "vitest";
import { validateSignUpForm, initialSignUpValues } from "./validation";
import type { SignUpFormValues } from "./types";

describe("signup-form validation", () => {
  describe("validateSignUpForm", () => {
    describe("username validation", () => {
      it("should return error for username shorter than 3 characters", () => {
        const result = validateSignUpForm.username("ab");
        expect(result).toBe("Username must be between 3 and 50 characters");
      });

      it("should return error for username longer than 50 characters", () => {
        const longUsername = "a".repeat(51);
        const result = validateSignUpForm.username(longUsername);
        expect(result).toBe("Username must be between 3 and 50 characters");
      });

      it("should return error for username with special characters", () => {
        const result = validateSignUpForm.username("user@name");
        expect(result).toBe(
          "Username can only contain letters, numbers, and underscores"
        );
      });

      it("should return error for username with spaces", () => {
        const result = validateSignUpForm.username("user name");
        expect(result).toBe(
          "Username can only contain letters, numbers, and underscores"
        );
      });

      it("should return null for valid username with letters", () => {
        const result = validateSignUpForm.username("username");
        expect(result).toBeNull();
      });

      it("should return null for valid username with numbers", () => {
        const result = validateSignUpForm.username("user123");
        expect(result).toBeNull();
      });

      it("should return null for valid username with underscores", () => {
        const result = validateSignUpForm.username("user_name");
        expect(result).toBeNull();
      });
    });

    describe("email validation", () => {
      it("should return error for invalid email without @", () => {
        const result = validateSignUpForm.email("invalidemail");
        expect(result).toBe("Please enter a valid email");
      });

      it("should return error for invalid email without domain", () => {
        const result = validateSignUpForm.email("invalid@");
        expect(result).toBe("Please enter a valid email");
      });

      it("should return null for valid email", () => {
        const result = validateSignUpForm.email("test@example.com");
        expect(result).toBeNull();
      });

      it("should return null for email with subdomain", () => {
        const result = validateSignUpForm.email("test@mail.example.com");
        expect(result).toBeNull();
      });
    });

    describe("password validation", () => {
      it("should return error for password shorter than 8 characters", () => {
        const result = validateSignUpForm.password("Pass1!");
        expect(result).toBe("Password must be between 8 and 100 characters");
      });

      it("should return error for password longer than 100 characters", () => {
        const longPassword = "P1!" + "a".repeat(98);
        const result = validateSignUpForm.password(longPassword);
        expect(result).toBe("Password must be between 8 and 100 characters");
      });

      it("should return error for password without lowercase letter", () => {
        const result = validateSignUpForm.password("PASSWORD123!");
        expect(result).toBe(
          "Password must include at least one lowercase letter"
        );
      });

      it("should return error for password without uppercase letter", () => {
        const result = validateSignUpForm.password("password123!");
        expect(result).toBe(
          "Password must include at least one uppercase letter"
        );
      });

      it("should return error for password without number", () => {
        const result = validateSignUpForm.password("Password!");
        expect(result).toBe("Password must include at least one number");
      });

      it("should return error for password without special character", () => {
        const result = validateSignUpForm.password("Password123");
        expect(result).toBe(
          "Password must include at least one special character (@$!%*?&)"
        );
      });

      it("should return null for valid password", () => {
        const result = validateSignUpForm.password("Password123!");
        expect(result).toBeNull();
      });

      it("should accept all valid special characters", () => {
        expect(validateSignUpForm.password("Password1@")).toBeNull();
        expect(validateSignUpForm.password("Password1$")).toBeNull();
        expect(validateSignUpForm.password("Password1!")).toBeNull();
        expect(validateSignUpForm.password("Password1%")).toBeNull();
        expect(validateSignUpForm.password("Password1*")).toBeNull();
        expect(validateSignUpForm.password("Password1?")).toBeNull();
        expect(validateSignUpForm.password("Password1&")).toBeNull();
      });
    });

    describe("confirmPassword validation", () => {
      it("should return error when passwords do not match", () => {
        const values: SignUpFormValues = {
          username: "testuser",
          email: "test@example.com",
          password: "Password123!",
          confirmPassword: "DifferentPassword123!",
          firstName: "Test",
          lastName: "User",
        };
        const result = validateSignUpForm.confirmPassword(
          values.confirmPassword,
          values
        );
        expect(result).toBe("Passwords do not match");
      });

      it("should return null when passwords match", () => {
        const values: SignUpFormValues = {
          username: "testuser",
          email: "test@example.com",
          password: "Password123!",
          confirmPassword: "Password123!",
          firstName: "Test",
          lastName: "User",
        };
        const result = validateSignUpForm.confirmPassword(
          values.confirmPassword,
          values
        );
        expect(result).toBeNull();
      });
    });

    describe("firstName validation", () => {
      it("should return error for empty first name", () => {
        const result = validateSignUpForm.firstName("");
        expect(result).toBe("First name must be between 1 and 100 characters");
      });

      it("should return error for first name longer than 100 characters", () => {
        const longName = "a".repeat(101);
        const result = validateSignUpForm.firstName(longName);
        expect(result).toBe("First name must be between 1 and 100 characters");
      });

      it("should return null for valid first name", () => {
        const result = validateSignUpForm.firstName("John");
        expect(result).toBeNull();
      });
    });

    describe("lastName validation", () => {
      it("should return error for empty last name", () => {
        const result = validateSignUpForm.lastName("");
        expect(result).toBe("Last name must be between 1 and 100 characters");
      });

      it("should return error for last name longer than 100 characters", () => {
        const longName = "a".repeat(101);
        const result = validateSignUpForm.lastName(longName);
        expect(result).toBe("Last name must be between 1 and 100 characters");
      });

      it("should return null for valid last name", () => {
        const result = validateSignUpForm.lastName("Doe");
        expect(result).toBeNull();
      });
    });
  });

  describe("initialSignUpValues", () => {
    it("should have correct initial values", () => {
      expect(initialSignUpValues).toEqual({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
      });
    });

    it("should have all fields as empty strings", () => {
      expect(initialSignUpValues.username).toBe("");
      expect(initialSignUpValues.email).toBe("");
      expect(initialSignUpValues.password).toBe("");
      expect(initialSignUpValues.confirmPassword).toBe("");
      expect(initialSignUpValues.firstName).toBe("");
      expect(initialSignUpValues.lastName).toBe("");
    });
  });
});

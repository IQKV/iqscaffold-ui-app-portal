import { describe, it, expect } from "vitest";
import { validateSampleForm, initialFormValues } from "./validation";

describe("Sample Form Validation", () => {
  describe("validateSampleForm", () => {
    it("validates name field with minLength rule", () => {
      const result = validateSampleForm.name("A");
      expect(result).toBe("Must be at least 2 characters");
    });

    it("passes validation for valid name", () => {
      const result = validateSampleForm.name("John Doe");
      expect(result).toBeNull();
    });

    it("validates email field with email rule", () => {
      const result = validateSampleForm.email("invalid-email");
      expect(result).toBe("Invalid email address");
    });

    it("passes validation for valid email", () => {
      const result = validateSampleForm.email("john@example.com");
      expect(result).toBeNull();
    });

    it("allows empty email (not required)", () => {
      const result = validateSampleForm.email("");
      expect(result).toBeNull();
    });

    it("allows empty name (not required)", () => {
      const result = validateSampleForm.name("");
      expect(result).toBeNull();
    });
  });

  describe("initialFormValues", () => {
    it("has correct initial values", () => {
      expect(initialFormValues).toEqual({
        name: "",
        email: "",
      });
    });

    it("has all required fields", () => {
      expect(initialFormValues).toHaveProperty("name");
      expect(initialFormValues).toHaveProperty("email");
    });
  });
});

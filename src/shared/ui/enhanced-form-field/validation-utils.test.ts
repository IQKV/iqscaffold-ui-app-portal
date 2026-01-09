import { describe, it, expect } from "vitest";
import { useEnhancedFormValidation } from "./validation-utils";
import { renderHook } from "@testing-library/react";

describe("Enhanced Form Validation Utils", () => {
  describe("useEnhancedFormValidation", () => {
    it("provides validation functions", () => {
      const { result } = renderHook(() => useEnhancedFormValidation());

      expect(result.current.validateEmail).toBeDefined();
      expect(result.current.validatePassword).toBeDefined();
      expect(result.current.validateRequired).toBeDefined();
      expect(result.current.validateMinLength).toBeDefined();
      expect(result.current.validateMaxLength).toBeDefined();
      expect(result.current.validateNumber).toBeDefined();
    });

    describe("validateEmail", () => {
      it("returns null for valid email", () => {
        const { result } = renderHook(() => useEnhancedFormValidation());
        expect(result.current.validateEmail("test@example.com")).toBeNull();
      });

      it("returns error for invalid email", () => {
        const { result } = renderHook(() => useEnhancedFormValidation());
        expect(result.current.validateEmail("invalid")).toBeTruthy();
        expect(result.current.validateEmail("@example.com")).toBeTruthy();
      });
    });

    describe("validatePassword", () => {
      it("returns null for strong password", () => {
        const { result } = renderHook(() => useEnhancedFormValidation());
        expect(result.current.validatePassword("Password123")).toBeNull();
      });

      it("returns error for short password", () => {
        const { result } = renderHook(() => useEnhancedFormValidation());
        expect(result.current.validatePassword("Pass1")).toBeTruthy();
      });

      it("returns error for password without uppercase", () => {
        const { result } = renderHook(() => useEnhancedFormValidation());
        expect(result.current.validatePassword("password123")).toBeTruthy();
      });

      it("returns error for password without lowercase", () => {
        const { result } = renderHook(() => useEnhancedFormValidation());
        expect(result.current.validatePassword("PASSWORD123")).toBeTruthy();
      });

      it("returns error for password without number", () => {
        const { result } = renderHook(() => useEnhancedFormValidation());
        expect(result.current.validatePassword("Password")).toBeTruthy();
      });

      it("respects custom minimum length", () => {
        const { result } = renderHook(() => useEnhancedFormValidation());
        expect(result.current.validatePassword("Pass1", 10)).toBeTruthy();
        expect(result.current.validatePassword("Password123", 10)).toBeNull();
      });
    });

    describe("validateRequired", () => {
      it("returns null for non-empty value", () => {
        const { result } = renderHook(() => useEnhancedFormValidation());
        expect(result.current.validateRequired("value")).toBeNull();
      });

      it("returns error for empty string", () => {
        const { result } = renderHook(() => useEnhancedFormValidation());
        expect(result.current.validateRequired("")).toBeTruthy();
      });

      it("returns error for null", () => {
        const { result } = renderHook(() => useEnhancedFormValidation());
        expect(result.current.validateRequired(null)).toBeTruthy();
      });

      it("returns error for undefined", () => {
        const { result } = renderHook(() => useEnhancedFormValidation());
        expect(result.current.validateRequired(undefined)).toBeTruthy();
      });

      it("returns error for empty array", () => {
        const { result } = renderHook(() => useEnhancedFormValidation());
        expect(result.current.validateRequired([])).toBeTruthy();
      });

      it("uses custom field name in error message", () => {
        const { result } = renderHook(() => useEnhancedFormValidation());
        const error = result.current.validateRequired("", "Email");
        expect(error).toContain("Email");
      });
    });

    describe("validateMinLength", () => {
      it("returns null when length meets minimum", () => {
        const { result } = renderHook(() => useEnhancedFormValidation());
        expect(result.current.validateMinLength("12345", 5)).toBeNull();
      });

      it("returns error when length is below minimum", () => {
        const { result } = renderHook(() => useEnhancedFormValidation());
        expect(result.current.validateMinLength("123", 5)).toBeTruthy();
      });

      it("returns null for empty value", () => {
        const { result } = renderHook(() => useEnhancedFormValidation());
        expect(result.current.validateMinLength("", 5)).toBeNull();
      });
    });

    describe("validateMaxLength", () => {
      it("returns null when length is within maximum", () => {
        const { result } = renderHook(() => useEnhancedFormValidation());
        expect(result.current.validateMaxLength("123", 5)).toBeNull();
      });

      it("returns error when length exceeds maximum", () => {
        const { result } = renderHook(() => useEnhancedFormValidation());
        expect(result.current.validateMaxLength("123456", 5)).toBeTruthy();
      });

      it("returns null for empty value", () => {
        const { result } = renderHook(() => useEnhancedFormValidation());
        expect(result.current.validateMaxLength("", 5)).toBeNull();
      });
    });

    describe("validateNumber", () => {
      it("returns null when number is within range", () => {
        const { result } = renderHook(() => useEnhancedFormValidation());
        expect(result.current.validateNumber(5, 1, 10)).toBeNull();
      });

      it("returns error when number is below minimum", () => {
        const { result } = renderHook(() => useEnhancedFormValidation());
        expect(result.current.validateNumber(0, 1, 10)).toBeTruthy();
      });

      it("returns error when number exceeds maximum", () => {
        const { result } = renderHook(() => useEnhancedFormValidation());
        expect(result.current.validateNumber(11, 1, 10)).toBeTruthy();
      });

      it("works without min/max constraints", () => {
        const { result } = renderHook(() => useEnhancedFormValidation());
        expect(result.current.validateNumber(100)).toBeNull();
      });
    });
  });
});

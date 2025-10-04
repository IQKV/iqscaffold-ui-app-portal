import { describe, it, expect } from "vitest";
import { capitalize } from "./string-helper";

describe("String Helper", () => {
  describe("capitalize", () => {
    it("capitalizes first letter and lowercases the rest", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("WORLD")).toBe("World");
      expect(capitalize("javaScript")).toBe("Javascript");
    });

    it("handles single character strings", () => {
      expect(capitalize("a")).toBe("A");
      expect(capitalize("Z")).toBe("Z");
    });

    it("handles empty string", () => {
      expect(capitalize("")).toBe("");
    });

    it("handles strings with spaces", () => {
      expect(capitalize("hello world")).toBe("Hello world");
      expect(capitalize("HELLO WORLD")).toBe("Hello world");
    });

    it("handles strings with special characters", () => {
      expect(capitalize("hello-world")).toBe("Hello-world");
      expect(capitalize("test@example.com")).toBe("Test@example.com");
    });

    it("handles strings starting with numbers", () => {
      expect(capitalize("123abc")).toBe("123abc");
    });

    it("handles strings with mixed case", () => {
      expect(capitalize("hELLo WoRLD")).toBe("Hello world");
      expect(capitalize("tEST")).toBe("Test");
    });
  });
});

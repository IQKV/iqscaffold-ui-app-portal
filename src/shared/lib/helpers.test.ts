import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  isNumber,
  isObjectEmpty,
  pluck,
  addQueryStringToUrl,
  removeQueryStringFromUrl,
  getUrlParam,
  formatNumber,
  isEmptyHtml,
} from "./helpers";

// Mock window and history
const mockPushState = vi.fn();
const mockLocation = {
  href: "https://example.com",
  search: "?existing=param",
};

Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

Object.defineProperty(window, "history", {
  value: {
    pushState: mockPushState,
  },
  writable: true,
});

describe("Helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = "https://example.com";
    mockLocation.search = "?existing=param";
  });

  describe("isNumber", () => {
    it("returns true for numbers", () => {
      expect(isNumber(42)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(-1)).toBe(true);
      expect(isNumber(3.14)).toBe(true);
      expect(isNumber(NaN)).toBe(true); // NaN is still of type number
    });

    it("returns false for non-numbers", () => {
      expect(isNumber("42")).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
      expect(isNumber({})).toBe(false);
      expect(isNumber([])).toBe(false);
      expect(isNumber(true)).toBe(false);
    });
  });

  describe("isObjectEmpty", () => {
    it("returns true for empty objects", () => {
      expect(isObjectEmpty({})).toBe(true);
    });

    it("returns false for non-empty objects", () => {
      expect(isObjectEmpty({ key: "value" })).toBe(false);
      expect(isObjectEmpty({ a: 1, b: 2 })).toBe(false);
    });

    it("handles arrays", () => {
      expect(isObjectEmpty([])).toBe(true);
      expect(isObjectEmpty([1, 2, 3])).toBe(false);
    });
  });

  describe("pluck", () => {
    const testObject = {
      name: "John",
      age: 30,
      email: "john@example.com",
      city: "New York",
    };

    it("extracts specified keys from object", () => {
      const result = pluck(testObject, ["name", "email"]);
      expect(result).toEqual({
        name: "John",
        email: "john@example.com",
      });
    });

    it("handles empty keys array", () => {
      const result = pluck(testObject, []);
      expect(result).toEqual({});
    });

    it("handles non-existent keys", () => {
      const result = pluck(testObject, ["name", "nonexistent" as any]);
      expect(result).toEqual({
        name: "John",
        nonexistent: undefined,
      });
    });
  });

  describe("addQueryStringToUrl", () => {
    it("adds new query parameter", () => {
      mockLocation.href = "https://example.com";
      addQueryStringToUrl("newParam", "newValue");

      expect(mockPushState).toHaveBeenCalledWith(
        {},
        "",
        "https://example.com/?newParam=newValue"
      );
    });

    it("does not add duplicate parameter", () => {
      mockLocation.href = "https://example.com?existing=param";
      mockPushState.mockClear(); // Clear any previous calls
      addQueryStringToUrl("existing", "newValue");

      // The function still calls pushState but URL should remain the same
      expect(mockPushState).toHaveBeenCalledWith(
        {},
        "",
        "https://example.com/?existing=param"
      );
    });
  });

  describe("removeQueryStringFromUrl", () => {
    it("removes existing query parameter", () => {
      mockLocation.href = "https://example.com?param1=value1&param2=value2";
      removeQueryStringFromUrl("param1");

      expect(mockPushState).toHaveBeenCalledWith(
        {},
        "",
        "https://example.com/?param2=value2"
      );
    });

    it("does nothing if parameter does not exist", () => {
      mockLocation.href = "https://example.com?existing=param";
      mockPushState.mockClear(); // Clear any previous calls
      removeQueryStringFromUrl("nonexistent");

      // The function still calls pushState but URL should remain the same
      expect(mockPushState).toHaveBeenCalledWith(
        {},
        "",
        "https://example.com/?existing=param"
      );
    });
  });

  describe("getUrlParam", () => {
    it("returns parameter value when it exists", () => {
      mockLocation.search = "?param1=value1&param2=value2";
      expect(getUrlParam("param1")).toBe("value1");
      expect(getUrlParam("param2")).toBe("value2");
    });

    it("returns null when parameter does not exist", () => {
      mockLocation.search = "?existing=param";
      expect(getUrlParam("nonexistent")).toBeNull();
    });

    it("handles empty search string", () => {
      mockLocation.search = "";
      expect(getUrlParam("any")).toBeNull();
    });
  });

  describe("formatNumber", () => {
    it("formats valid numbers", () => {
      expect(formatNumber(1234)).toBe("1,234");
      expect(formatNumber(1234567)).toBe("1,234,567");
      expect(formatNumber(0)).toBe("0");
    });

    it("returns 0 for non-numbers", () => {
      expect(formatNumber("123" as any)).toBe(0);
      expect(formatNumber(null as any)).toBe(0);
      expect(formatNumber(undefined as any)).toBe(0);
      expect(formatNumber({} as any)).toBe(0);
    });
  });

  describe("isEmptyHtml", () => {
    it("returns true for empty HTML content", () => {
      expect(isEmptyHtml("")).toBe(true);
      expect(isEmptyHtml("<p></p>")).toBe(true);
      expect(isEmptyHtml("<div><span></span></div>")).toBe(true);
      expect(isEmptyHtml("   ")).toBe(true);
      expect(isEmptyHtml("<br>")).toBe(true);
    });

    it("returns false for non-empty HTML content", () => {
      expect(isEmptyHtml("<p>Hello</p>")).toBe(false);
      expect(isEmptyHtml("Plain text")).toBe(false);
      expect(isEmptyHtml("<div>Content</div>")).toBe(false);
      expect(isEmptyHtml("  Text  ")).toBe(false);
    });

    it("handles HTML with only whitespace", () => {
      expect(isEmptyHtml("<p>   </p>")).toBe(true);
      expect(isEmptyHtml("<div>\n\t</div>")).toBe(true);
    });
  });
});

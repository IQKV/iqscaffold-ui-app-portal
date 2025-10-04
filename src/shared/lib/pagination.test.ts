import { describe, it, expect } from "vitest";
import {
  createPaginationParams,
  parsePaginationParams,
  calculatePaginationInfo,
  type PaginationData,
  type PaginationParams,
} from "./pagination";

describe("Pagination Utilities", () => {
  describe("createPaginationParams", () => {
    it("creates URLSearchParams with all parameters", () => {
      const params: PaginationParams = {
        page: 2,
        per_page: 20,
        sort: "name",
        direction: "desc",
        search: "test query",
      };

      const result = createPaginationParams(params);

      expect(result.get("page")).toBe("2");
      expect(result.get("per_page")).toBe("20");
      expect(result.get("sort")).toBe("name");
      expect(result.get("direction")).toBe("desc");
      expect(result.get("search")).toBe("test query");
    });

    it("omits default values", () => {
      const params: PaginationParams = {
        page: 1, // default, should be omitted
        per_page: 10, // default, should be omitted
        direction: "asc", // default, should be omitted
      };

      const result = createPaginationParams(params);

      expect(result.get("page")).toBeNull();
      expect(result.get("per_page")).toBeNull();
      expect(result.get("direction")).toBeNull();
    });

    it("includes non-default values", () => {
      const params: PaginationParams = {
        page: 3,
        per_page: 25,
        direction: "desc",
      };

      const result = createPaginationParams(params);

      expect(result.get("page")).toBe("3");
      expect(result.get("per_page")).toBe("25");
      expect(result.get("direction")).toBe("desc");
    });

    it("handles empty parameters", () => {
      const result = createPaginationParams({});
      expect(result.toString()).toBe("");
    });

    it("handles undefined values", () => {
      const params: PaginationParams = {
        page: undefined,
        per_page: undefined,
        sort: undefined,
        direction: undefined,
        search: undefined,
      };

      const result = createPaginationParams(params);
      expect(result.toString()).toBe("");
    });
  });

  describe("parsePaginationParams", () => {
    it("parses all parameters from URLSearchParams", () => {
      const searchParams = new URLSearchParams({
        page: "3",
        per_page: "25",
        sort: "email",
        direction: "desc",
        search: "john",
      });

      const result = parsePaginationParams(searchParams);

      expect(result).toEqual({
        page: 3,
        per_page: 25,
        sort: "email",
        direction: "desc",
        search: "john",
      });
    });

    it("returns defaults for missing parameters", () => {
      const searchParams = new URLSearchParams();
      const result = parsePaginationParams(searchParams);

      expect(result).toEqual({
        page: 1,
        per_page: 10,
        sort: undefined,
        direction: "asc",
        search: undefined,
      });
    });

    it("handles partial parameters", () => {
      const searchParams = new URLSearchParams({
        page: "2",
        sort: "name",
      });

      const result = parsePaginationParams(searchParams);

      expect(result).toEqual({
        page: 2,
        per_page: 10, // default
        sort: "name",
        direction: "asc", // default
        search: undefined, // default
      });
    });

    it("handles invalid numeric values", () => {
      const searchParams = new URLSearchParams({
        page: "invalid",
        per_page: "not-a-number",
      });

      const result = parsePaginationParams(searchParams);

      expect(result.page).toBeNaN();
      expect(result.per_page).toBeNaN();
    });

    it("handles empty string values", () => {
      const searchParams = new URLSearchParams({
        page: "",
        per_page: "",
        sort: "",
        search: "",
      });

      const result = parsePaginationParams(searchParams);

      expect(result.page).toBe(1); // Falls back to default
      expect(result.per_page).toBe(10); // Falls back to default
      expect(result.sort).toBeUndefined();
      expect(result.search).toBeUndefined();
    });
  });

  describe("calculatePaginationInfo", () => {
    it("calculates pagination info correctly", () => {
      const paginationData: PaginationData = {
        total: 100,
        per_page: 10,
        current_page: 3,
        links: [],
        last_page: 10,
        from: 21,
        to: 30,
        path: 0,
        allowed_sorts: {},
        default_sort: "id",
        default_sort_direction: "asc",
      };

      const result = calculatePaginationInfo(paginationData);

      expect(result).toEqual({
        currentPage: 3,
        pageSize: 10,
        total: 100,
        totalPages: 10,
        hasNextPage: true,
        hasPreviousPage: true,
        startIndex: 21,
        endIndex: 30,
      });
    });

    it("handles first page", () => {
      const paginationData: PaginationData = {
        total: 50,
        per_page: 10,
        current_page: 1,
        links: [],
        last_page: 5,
        from: 1,
        to: 10,
        path: 0,
        allowed_sorts: {},
        default_sort: "id",
        default_sort_direction: "asc",
      };

      const result = calculatePaginationInfo(paginationData);

      expect(result.hasPreviousPage).toBe(false);
      expect(result.hasNextPage).toBe(true);
      expect(result.startIndex).toBe(1);
      expect(result.endIndex).toBe(10);
    });

    it("handles last page", () => {
      const paginationData: PaginationData = {
        total: 45,
        per_page: 10,
        current_page: 5,
        links: [],
        last_page: 5,
        from: 41,
        to: 45,
        path: 0,
        allowed_sorts: {},
        default_sort: "id",
        default_sort_direction: "asc",
      };

      const result = calculatePaginationInfo(paginationData);

      expect(result.hasNextPage).toBe(false);
      expect(result.hasPreviousPage).toBe(true);
      expect(result.startIndex).toBe(41);
      expect(result.endIndex).toBe(45);
    });

    it("handles single page", () => {
      const paginationData: PaginationData = {
        total: 5,
        per_page: 10,
        current_page: 1,
        links: [],
        last_page: 1,
        from: 1,
        to: 5,
        path: 0,
        allowed_sorts: {},
        default_sort: "id",
        default_sort_direction: "asc",
      };

      const result = calculatePaginationInfo(paginationData);

      expect(result.hasNextPage).toBe(false);
      expect(result.hasPreviousPage).toBe(false);
      expect(result.totalPages).toBe(1);
      expect(result.endIndex).toBe(5);
    });

    it("handles empty results", () => {
      const paginationData: PaginationData = {
        total: 0,
        per_page: 10,
        current_page: 1,
        links: [],
        last_page: 1,
        from: 0,
        to: 0,
        path: 0,
        allowed_sorts: {},
        default_sort: "id",
        default_sort_direction: "asc",
      };

      const result = calculatePaginationInfo(paginationData);

      expect(result.total).toBe(0);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPreviousPage).toBe(false);
      expect(result.startIndex).toBe(1);
      expect(result.endIndex).toBe(0);
    });
  });
});

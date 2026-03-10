import { describe, it, expect } from "vitest";
import { queryClient } from "./query-client";

describe("Query Client Configuration", () => {
  it("is properly configured", () => {
    expect(queryClient).toBeDefined();
  });

  it("has correct default query options", () => {
    const defaultOptions = queryClient.getDefaultOptions();

    expect(defaultOptions.queries?.staleTime).toBe(60000); // 1 minute
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false);
    expect(defaultOptions.queries?.networkMode).toBe("always");
  });

  it("has correct default mutation options", () => {
    const defaultOptions = queryClient.getDefaultOptions();

    expect(defaultOptions.mutations?.networkMode).toBe("always");
    expect(defaultOptions.mutations?.retry).toBe(false);
  });

  it("has custom retry logic for queries", () => {
    const defaultOptions = queryClient.getDefaultOptions();
    const retryFn = defaultOptions.queries?.retry as (failureCount: number, error: any) => boolean;

    expect(typeof retryFn).toBe("function");

    // Should retry on 5xx errors
    expect(retryFn(1, { response: { status: 500 } })).toBe(true);
    expect(retryFn(2, { response: { status: 503 } })).toBe(true);

    // Should not retry on most 4xx errors
    expect(retryFn(1, { response: { status: 400 } })).toBe(false);
    expect(retryFn(1, { response: { status: 404 } })).toBe(false);

    // Should retry on 408 (timeout) and 429 (rate limit)
    expect(retryFn(1, { response: { status: 408 } })).toBe(true);
    expect(retryFn(1, { response: { status: 429 } })).toBe(true);

    // Should stop retrying after 3 attempts
    expect(retryFn(3, { response: { status: 500 } })).toBe(false);
  });
});

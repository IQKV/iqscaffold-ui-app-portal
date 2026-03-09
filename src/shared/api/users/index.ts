// Users API Client

import { apiRequest } from "../base";
import * as Types from "./types";

/**
 * Users API client
 */
export const usersApi = {
  /**
   * Get users with optional filtering
   */
  getUsers: (params?: Types.UserListParams) =>
    apiRequest<Types.User[]>({
      url: "/v1/users",
      method: "GET",
      params,
    }),

  /**
   * Get user by ID
   */
  getUser: (id: string) =>
    apiRequest<Types.User>({
      url: `/v1/users/${id}`,
      method: "GET",
    }),
};

export * from "./types";

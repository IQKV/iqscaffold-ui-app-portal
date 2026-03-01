// User entity exports
export * from "./lib/types";
export * from "./lib/use-avatar";
export * from "./lib/use-user-preferences";
export * from "./lib/use-user-management";
export * from "./lib/use-preference-value";
export * from "./lib/user-preference-types";
export * from "./ui/avatar-upload";
export * from "./ui/UserFormField";

// API exports
export * from "./api/queries";
export * from "./api/mutations";
export type {
  UserDto,
  CreateUserRequest,
  UpdateUserRequest,
  UserPageResponse,
  PageParams,
} from "@/shared/api";

// Re-export commonly used utilities
export { getUserRoles } from "./ui/UserFormField";

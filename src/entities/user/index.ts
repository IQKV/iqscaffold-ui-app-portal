export type {
  User,
  UserContext,
  UserRegistration,
  UserProfile,
} from "./model/types";

export type {
  UserPreference,
  UpdateUserPreferenceRequest,
  ThemeOption,
  TwoFactorMethod,
} from "./model/user-preference-types";

export {
  useUserPreferences,
  useUpdateUserPreferences,
  useDeleteUserPreferences,
  USER_PREFERENCES_QUERY_KEY,
} from "./model/use-user-preferences";

export {
  usePreferenceValue,
  useTheme,
  useLocale,
  useTimezone,
  useCurrency,
  useNotificationSettings,
  useTwoFactorStatus,
} from "./model/use-preference-value";

// User Management (Admin operations)
export type {
  UserDto,
  CreateUserRequest,
  UpdateUserRequest,
  UserPageResponse,
} from "@/shared/api/user-management-api";

export {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  USER_MANAGEMENT_QUERY_KEY,
} from "./model/use-user-management";

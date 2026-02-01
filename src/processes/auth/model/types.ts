import type { User, UserContext } from "@/entities/user";

export type Role = string;
export type Permission = string;

export interface Tokens {
  accessToken: string | null;
  refreshToken: string | null;
}

export type AuthStatus =
  | "idle"
  | "initializing"
  | "authenticated"
  | "unauthenticated";

export interface AuthState {
  status: AuthStatus;
  user: UserContext | null;
  tokens: Tokens;
  expiresAt: number | null; // ms epoch of access token
  lastRefreshAt: number | null;
  error?: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthActions {
  initialize: () => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithTokens: (tokens: {
    accessToken: string;
    refreshToken: string;
  }) => void;
  refresh: () => Promise<void>;
  logout: (options?: { silent?: boolean }) => Promise<void>;
  updateUser: (updates: Partial<UserContext>) => void;
}

export type AuthStore = AuthState & AuthActions;

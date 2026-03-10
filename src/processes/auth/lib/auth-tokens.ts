import { getAuthConfig } from "@/app/config";

export interface TokenPair {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt?: number | null; // ms epoch for access token expiry
}

type Listener = (tokens: TokenPair) => void;

const listeners = new Set<Listener>();
let inMemory: TokenPair = readFromStorage();
let bc: BroadcastChannel | null = null;

try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    bc = new BroadcastChannel("auth-tokens");
    bc.onmessage = (ev) => {
      if (ev?.data?.type === "tokens:update") {
        inMemory = ev.data.tokens;
        notify();
      }
      if (ev?.data?.type === "tokens:clear") {
        inMemory = { accessToken: null, refreshToken: null, expiresAt: null };
        notify();
      }
    };
  }
} catch {
  void 0;
}

function readFromStorage(): TokenPair {
  const cfg = getAuthConfig();
  const accessToken = localStorage.getItem(cfg.tokenStorage.accessTokenKey);
  const refreshToken = localStorage.getItem(cfg.tokenStorage.refreshTokenKey);
  const expiresAtStr = localStorage.getItem(`${cfg.tokenStorage.accessTokenKey}:exp`);
  return {
    accessToken,
    refreshToken,
    expiresAt: expiresAtStr ? Number(expiresAtStr) : null,
  };
}

function writeToStorage(tokens: TokenPair) {
  const cfg = getAuthConfig();
  if (tokens.accessToken) {
    localStorage.setItem(cfg.tokenStorage.accessTokenKey, tokens.accessToken);
  } else {
    localStorage.removeItem(cfg.tokenStorage.accessTokenKey);
  }
  if (tokens.refreshToken) {
    localStorage.setItem(cfg.tokenStorage.refreshTokenKey, tokens.refreshToken);
  } else {
    localStorage.removeItem(cfg.tokenStorage.refreshTokenKey);
  }
  if (tokens.expiresAt != null) {
    localStorage.setItem(`${cfg.tokenStorage.accessTokenKey}:exp`, String(tokens.expiresAt));
  } else {
    localStorage.removeItem(`${cfg.tokenStorage.accessTokenKey}:exp`);
  }
}

function notify() {
  for (const l of listeners) {
    l(inMemory);
  }
}

export function getTokens(): TokenPair {
  return inMemory;
}

export function getAccessToken(): string | null {
  return inMemory.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return inMemory.refreshToken ?? null;
}

export function setTokens(tokens: TokenPair) {
  inMemory = { ...tokens };
  writeToStorage(inMemory);
  try {
    bc?.postMessage({ type: "tokens:update", tokens: inMemory });
  } catch {
    void 0;
  }
  notify();
}

export function clearTokens() {
  inMemory = { accessToken: null, refreshToken: null, expiresAt: null };
  writeToStorage(inMemory);
  try {
    bc?.postMessage({ type: "tokens:clear" });
  } catch {
    void 0;
  }
  notify();
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

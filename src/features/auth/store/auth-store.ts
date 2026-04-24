import { create } from "zustand";
import { introspect, login } from "@/services/auth-api";
import type { AuthUserRes, LoginReq, AuthRes } from "@/features/auth/types/auth.types";



type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUserRes | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingAuth: boolean;
  login: (payload: LoginReq) => Promise<void>;
  logout: () => void;
  setAuth: (payload: AuthRes) => void;
  hydrate: () => void;
  verifyToken: () => Promise<boolean>;
};

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "auth_user";

function getStoredUser(): AuthUserRes | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUserRes;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function persistAuth(payload: AuthRes) {
  const accessToken = payload.accessToken;
  const refreshToken = payload.refreshToken ?? null;
  const user: AuthUserRes | null = payload.user
    ? {
        id: payload.user.id,
        username: payload.user.username,
        fullName: payload.user.fullName,
        roles: payload.user.roles,
      }
    : null;

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken??"");

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }

  return { accessToken, refreshToken, user };
}

function clearAuthStorage() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("qlbh_token");
  localStorage.removeItem("qlbh_user");
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: getStoredAccessToken(),
  refreshToken: getStoredRefreshToken(),
  user: getStoredUser(),
  isAuthenticated: !!getStoredAccessToken(),
  isLoading: false,
  isCheckingAuth: false,

  async login(payload) {
    try {
      set({ isLoading: true });

      const response = await login(payload);
      const { accessToken, refreshToken, user } = persistAuth(response);

      set({
        accessToken,
        refreshToken,
        user,
        isAuthenticated: !!accessToken,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout() {
    clearAuthStorage();

    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isCheckingAuth: false,
    });
  },

  setAuth(payload) {
    const { accessToken, refreshToken, user } = persistAuth(payload);

    set({
      accessToken,
      refreshToken,
      user,
      isAuthenticated: !!accessToken,
    });
  },

  hydrate() {
    const accessToken = getStoredAccessToken();
    const refreshToken = getStoredRefreshToken();
    const user = getStoredUser();

    set({
      accessToken,
      refreshToken,
      user,
      isAuthenticated: !!accessToken,
    });
  },

  async verifyToken() {
    const token = get().accessToken || getStoredAccessToken();

    if (!token) {
      get().logout();
      return false;
    }

    try {
      set({ isCheckingAuth: true });

      const result = await introspect(token);

      const {user} = persistAuth(result);

      if (!result.active) {
        get().logout();
        return false;
      }

      set({
        accessToken: token,
        isAuthenticated: true,
        isCheckingAuth: false,
        user
      });

      return true;
    } catch {
      get().logout();
      return false;
    } finally {
      set({ isCheckingAuth: false });
    }
  },
}));
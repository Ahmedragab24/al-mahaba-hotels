import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";
import type { UserProfile } from "@/types/api";

export type AuthUser = {
  id: string;
  email: string;
};

export type AuthState = {
  token: string | null;
  user: AuthUser | null;
  profile: UserProfile | Record<string, unknown> | null;
  roles: string[];
  blockedModules: string[];
  isAuthenticated: boolean;
};

const getLocalStorageItem = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const persistedToken = getLocalStorageItem("auth_token");
const persistedUser = getLocalStorageItem("auth_user");
const persistedProfile = getLocalStorageItem("auth_profile");
const persistedRoles = getLocalStorageItem("auth_roles");

const initialState: AuthState = {
  token: persistedToken,
  user: persistedUser ? JSON.parse(persistedUser) : null,
  profile: persistedProfile ? JSON.parse(persistedProfile) : null,
  roles: persistedRoles ? JSON.parse(persistedRoles) : [],
  blockedModules: [],
  isAuthenticated: !!persistedToken,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{
        token: string;
        user: AuthUser;
        profile?: AuthState["profile"];
        roles?: string[];
        blockedModules?: string[];
      }>,
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.profile = action.payload.profile ?? state.profile;
      state.roles = action.payload.roles ?? state.roles;
      state.blockedModules = action.payload.blockedModules ?? state.blockedModules;
      state.isAuthenticated = true;

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("auth_token", action.payload.token);
          localStorage.setItem("auth_user", JSON.stringify(action.payload.user));
          if (action.payload.profile) {
            localStorage.setItem("auth_profile", JSON.stringify(action.payload.profile));
          }
          if (action.payload.roles) {
            localStorage.setItem("auth_roles", JSON.stringify(action.payload.roles));
          }
        } catch (e) {
          console.warn("Failed to save auth to localStorage", e);
        }
      }
    },
    setProfile(state, action: PayloadAction<AuthState["profile"]>) {
      state.profile = action.payload;
      if (typeof window !== "undefined" && action.payload) {
        try {
          localStorage.setItem("auth_profile", JSON.stringify(action.payload));
        } catch (e) {
          console.warn(e);
        }
      }
    },
    setRoles(state, action: PayloadAction<string[]>) {
      state.roles = action.payload;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("auth_roles", JSON.stringify(action.payload));
        } catch (e) {
          console.warn(e);
        }
      }
    },
    setBlockedModules(state, action: PayloadAction<string[]>) {
      state.blockedModules = action.payload;
    },
    clearAuth(state) {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          localStorage.removeItem("auth_profile");
          localStorage.removeItem("auth_roles");
          localStorage.removeItem("auth_user_id");
          document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
          document.cookie = "auth_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        } catch (e) {
          console.warn("Failed to clear auth from localStorage", e);
        }
      }
      state.token = null;
      state.user = null;
      state.profile = null;
      state.roles = [];
      state.blockedModules = [];
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, setProfile, setRoles, setBlockedModules, clearAuth } =
  authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthProfile = (state: RootState) => state.auth.profile;
export const selectAuthRoles = (state: RootState) => state.auth.roles;

export default authSlice.reducer;

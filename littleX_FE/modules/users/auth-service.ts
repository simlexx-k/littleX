import { Buffer } from "buffer";
import { UserNode } from "@/nodes/user-node";
import { private_api } from "../../_core/api-client";
import { localStorageUtil } from "@/_core/utils";
import { APP_KEYS } from "@/_core/keys";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials { }

interface AuthResponse {
  token: string;
  user: UserNode;
}

const base64Decode = (value: string): string => {
  if (typeof window !== "undefined" && typeof window.atob === "function") {
    return window.atob(value);
  }
  return Buffer.from(value, "base64").toString("utf-8");
};

const parseJwtExpiry = (token: string): number | null => {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const decoded = JSON.parse(base64Decode(parts[1]));
    const exp = decoded?.exp ?? decoded?.expiration ?? decoded?.expires_at;
    if (typeof exp === "number") {
      return exp > 1e12 ? exp : exp * 1000;
    }
    if (typeof exp === "string") {
      const parsed = Date.parse(exp);
      return Number.isFinite(parsed) ? parsed : null;
    }
  } catch {
    return null;
  }
  return null;
};

const normalizeExpiration = (value?: number): number | null => {
  if (!value) return null;
  if (value > 1e12) return value;
  return value * 1000;
};

const purgeSessionData = () => {
  localStorageUtil.removeItem(APP_KEYS.TOKEN);
  localStorageUtil.removeItem(APP_KEYS.USER);
  localStorageUtil.removeItem(APP_KEYS.SESSION_EXPIRY);
  localStorageUtil.removeItem(APP_KEYS.NOTIFICATIONS);
};

const storeSessionData = (token: string, user: UserNode): number | null => {
  const expiryFromToken = parseJwtExpiry(token);
  const expiryFromUser = normalizeExpiration(user.expiration);
  const expiry = expiryFromToken ?? expiryFromUser ?? null;
  if (expiry && expiry <= Date.now()) {
    purgeSessionData();
    return null;
  }
  const ttl = expiry && expiry > Date.now() ? expiry - Date.now() : undefined;
  localStorageUtil.setItem(APP_KEYS.TOKEN, token, ttl);
  localStorageUtil.setItem(APP_KEYS.USER, user, ttl);
  if (expiry) {
    localStorageUtil.setItem(APP_KEYS.SESSION_EXPIRY, expiry, ttl);
  } else {
    localStorageUtil.removeItem(APP_KEYS.SESSION_EXPIRY);
  }
  return expiry;
};

const getStoredExpiry = (): number | null => {
  const expiry = localStorageUtil.getItem<number>(APP_KEYS.SESSION_EXPIRY);
  if (!expiry) {
    return null;
  }
  if (Date.now() >= expiry) {
    purgeSessionData();
    return null;
  }
  return expiry;
};

export const AuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await private_api.post("/walker/login_user", credentials);
    const payload = response.data?.reports?.[0]?.[0] || response.data;
    const token = payload?.token;
    const user = payload?.user;

    if (token && user) {
      storeSessionData(token, user);
    }

    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await private_api.post("/walker/register_user", data);
    const payload = response.data?.reports?.[0]?.[0] || response.data;

    if (payload?.token && payload?.user) {
      storeSessionData(payload.token, payload.user);
    }

    return response.data;
  },

  logout: async (): Promise<void> => {
    purgeSessionData();
  },

  changePassword: async (
    oldPassword: string,
    newPassword: string
  ): Promise<void> => {
    await private_api.post("/walker/change_password", {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },

  forgotPassword: async (email: string): Promise<void> => {
    await private_api.post("/walker/forgot_password", { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await private_api.post("/walker/reset_password", {
      code: token,
      new_password: password,
    });
  },

  getCurrentUser: (): UserNode | null => {
    const token = localStorageUtil.getItem<string>(APP_KEYS.TOKEN);
    const user: UserNode | null = localStorageUtil.getItem(APP_KEYS.USER);
    if (!token || !user) {
      return null;
    }

    return {
      id: user.id || "",
      email: user.email || "",
      root_id: user.root_id || "",
      is_activated: user.is_activated || false,
      is_admin: user.is_admin || false,
      expiration: user.expiration || 0,
      state: user.state || "",
      avatar:
        user.avatar ||
        "https://icons.veryicon.com/png/o/miscellaneous/two-color-icon-library/user-286.png",
      profile_username: user.profile_username,
    };
  },

  getSessionExpiry: (): number | null => {
    return getStoredExpiry();
  },
};

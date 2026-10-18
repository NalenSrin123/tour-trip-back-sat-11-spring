const TOKEN_KEY = 'token';
const ROLE_KEY = 'role';
const USER_KEY = 'user';

// Auth lives in sessionStorage so a brand-new tab/window starts logged out.
// (sessionStorage is isolated per browser tab, unlike localStorage which is shared.)
export interface StoredUser {
  id?: number | string;
  email?: string;
  fullName?: string;
  role?: string;
  roles?: string[];
  avatarUrl?: string;
  [key: string]: unknown;
}

export const getToken = (): string | null => sessionStorage.getItem(TOKEN_KEY);

export const getRole = (): string | null => sessionStorage.getItem(ROLE_KEY);

export const getUser = (): StoredUser | null => {
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
};

export const setAuth = (auth: { token: string; role: string; user: StoredUser }): void => {
  sessionStorage.setItem(TOKEN_KEY, auth.token);
  sessionStorage.setItem(ROLE_KEY, auth.role);
  sessionStorage.setItem(USER_KEY, JSON.stringify(auth.user));
};

export const isAuthenticated = (): boolean => Boolean(getToken());

export const clearAuth = (): void => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(ROLE_KEY);
  sessionStorage.removeItem(USER_KEY);
};

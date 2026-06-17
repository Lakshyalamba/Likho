"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { apiRequest } from "@/lib/api";

const TOKEN_STORAGE_KEY = "likho_token";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  username: string | null;
  bio: string | null;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login(email: string, password: string): Promise<void>;
  signup(name: string, email: string, password: string): Promise<void>;
  logout(): void;
  updateProfile(data: { name?: string; username?: string | null; bio?: string | null }): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistAuth = useCallback((authToken: string, authUser: AuthUser) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, authToken);
    setToken(authToken);
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (data: { name?: string; username?: string | null; bio?: string | null }) => {
      const response = await apiRequest<{ user: AuthUser }>("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
        token
      });
      setUser(response.user);
    },
    [token]
  );

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    apiRequest<{ user: AuthUser }>("/auth/me", {
      token: storedToken
    })
      .then((response) => {
        setToken(storedToken);
        setUser(response.user);
      })
      .catch((err) => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        if (err instanceof TypeError) {
          console.warn("Auth session check failed due to network error — keeping session for retry");
          setToken(storedToken);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      persistAuth(response.token, response.user);
    },
    [persistAuth]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const response = await apiRequest<AuthResponse>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password })
      });

      persistAuth(response.token, response.user);
    },
    [persistAuth]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      login,
      signup,
      logout,
      updateProfile
    }),
    [isLoading, login, logout, signup, updateProfile, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

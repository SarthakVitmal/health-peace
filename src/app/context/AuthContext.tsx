"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast, Toaster } from "sonner";

interface AuthContextType {
  isLoggedIn: boolean | null;
  login: (redirect?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: (signal?: AbortSignal) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname(); // Next.js hook for current path
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  // Safe storage functions for client-side only
  const getStorageItem = async (key: string) => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  };

  const setStorageItem = async (key: string, value: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
  };

  const removeStorageItem = async (key: string) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  };

  const checkAuthStatus = async (signal?: AbortSignal): Promise<boolean> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch("/api/auth/validate", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: signal || controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) return false;

      const data = await response.json();
      if (data.expiresAt) {
        scheduleTokenRefresh(data.expiresAt);
        await setStorageItem(
          "authState",
          JSON.stringify({
            isLoggedIn: data.isAuthenticated,
            expiresAt: data.expiresAt,
          })
        );
      }
      return data.isAuthenticated;
    } catch (error) {
      clearTimeout(timeoutId);
      if (!(error instanceof DOMException)) {
        console.error("Auth validation error:", error);
      }
      return false;
    }
  };

  const scheduleTokenRefresh = (expiresAt: number) => {
    const refreshTime = expiresAt * 1000 - Date.now() - 300000;
    if (refreshInterval.current) clearTimeout(refreshInterval.current);
    refreshInterval.current = setTimeout(async () => {
      try {
        await fetch("/api/auth/refresh", { credentials: "include" });
        const isValid = await checkAuthStatus();
        setIsLoggedIn(isValid);
      } catch (error) {
        console.error("Token refresh failed:", error);
        logout();
      }
    }, Math.max(refreshTime, 0));
  };

  const login = async (redirect = "/dashboard") => {
    try {
      const isValid = await checkAuthStatus();
      setIsLoggedIn(isValid);
      if (isValid) {
        router.replace(redirect);
      } else {
        router.replace("/login");
      }
    } catch (error) {
      console.error("Login validation failed:", error);
      setIsLoggedIn(false);
      router.replace("/login");
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setIsLoggedIn(false);
      await removeStorageItem("authState");
      if (refreshInterval.current) clearTimeout(refreshInterval.current);
      router.replace("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const initializeAuth = async () => {
      try {
        // Check cached auth state first
        const cachedAuth = await getStorageItem("authState");
        let initialState = false;
        if (cachedAuth) {
          const { isLoggedIn, expiresAt } = JSON.parse(cachedAuth);
          if (expiresAt > Date.now() / 1000 + 300) {
            initialState = isLoggedIn;
          }
        }
        setIsLoggedIn(initialState);

        // Validate with server in background
        const isValid = await checkAuthStatus(controller.signal);
        setIsLoggedIn(isValid);

        // Redirect based on auth status using Next.js pathname
        if (isValid && pathname === "/login") {
          router.replace("/dashboard");
        } else if (!isValid && pathname !== "/login") {
          router.replace("/login");
        }
      } catch (error) {
        console.error("Initial auth check failed:", error);
        setIsLoggedIn(false);
        router.replace("/login");
      }
    };

    initializeAuth();
    return () => {
      controller.abort();
      if (refreshInterval.current) clearTimeout(refreshInterval.current);
    };
  }, [router, pathname]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, checkAuthStatus }}>
      {children}
      <Toaster position="top-center" richColors closeButton />
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
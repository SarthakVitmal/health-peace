"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useRef} from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import AsyncStorage from "@react-native-async-storage/async-storage"; 

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
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  const checkAuthStatus = async (signal?: AbortSignal): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/validate', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal,
      });
      
      if (!response.ok) return false;
      
      const data = await response.json();
      if (data.expiresAt) {
        scheduleTokenRefresh(data.expiresAt);
      }
      return data.isAuthenticated;
    } catch (error) {
      if (!(error instanceof DOMException)) { // Ignore abort errors
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
        await fetch('/api/auth/refresh', { credentials: 'include' });
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
      if (isValid) {
        setIsLoggedIn(true);
        router.replace(redirect);
      }
    } catch (error) {
      console.error("Login validation failed:", error);
      setIsLoggedIn(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setIsLoggedIn(false);
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
        const cachedAuth = await AsyncStorage.getItem("authState");
        let initialState = false;
        if (cachedAuth) {
          const { isLoggedIn, expiresAt } = JSON.parse(cachedAuth);
          // Use cached state if token hasn't expired
          if (expiresAt > Date.now() / 1000 + 300) {
            initialState = isLoggedIn;
          }
        }
        setIsLoggedIn(initialState); // Render UI immediately

        // Validate with server in background
        const isValid = await checkAuthStatus(controller.signal);
        setIsLoggedIn(isValid);

        // Redirect based on auth status
        if (isValid && window.location.pathname === "/login") {
          router.replace("/dashboard");
        } else if (!isValid && window.location.pathname !== "/login") {
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
  }, [router]);

  // Render children immediately, no blocking loader
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

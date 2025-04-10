"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useRef} from "react";
import { useRouter } from "next/navigation";
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
    const validateAuth = async () => {
      const isValid = await checkAuthStatus(controller.signal);
      setIsLoggedIn(isValid);
    };
    validateAuth();
    return () => controller.abort();
  }, []);

  if (isLoggedIn === null) {
    return <div className="flex justify-center items-center min-h-screen text-gray-600">Checking authentication status, please wait...</div>;
  }

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
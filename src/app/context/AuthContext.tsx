"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isLoggedIn: boolean | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  const checkAuthStatus = () => {
    // Check both localStorage and cookies
    const hasLocalStorageToken = localStorage.getItem("isLoggedIn") === "true";
    const hasCookieToken = document.cookie.includes('token=');
    return hasLocalStorageToken || hasCookieToken;
  };

  useEffect(() => {
    // Initial check
    setIsLoggedIn(checkAuthStatus());

    // Set up interval to check auth status periodically
    const interval = setInterval(() => {
      const isAuthenticated = checkAuthStatus();
      if (isLoggedIn !== isAuthenticated) {
        setIsLoggedIn(isAuthenticated);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const logout = () => {
    // Clear all auth-related storage
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.replace("/");
  };
  useEffect(() => {
    if (isLoggedIn === false) {
      router.replace("/login");
    }
  }, [isLoggedIn]);

  if (isLoggedIn === null) {
    return null; //
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
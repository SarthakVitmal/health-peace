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

  useEffect(() => {
    const storedLoginState = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(storedLoginState);
  }, []);

  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const logout = () => {
    // Clear the cookie with the same path, domain, and security settings it was created with
    const cookieOptions = [
      "token=",
      "path=/",
      "expires=Thu, 01 Jan 1970 00:00:00 UTC",
      "max-age=0" // Additional expiration control
    ];
    
    // Add these if your cookie was created with them
    // "secure", 
    // "sameSite=strict",
    
    document.cookie = cookieOptions.join("; ");
    
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
    router.replace("/");
  };

  if (isLoggedIn === null) {
    return null;
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
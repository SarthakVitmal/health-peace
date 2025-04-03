"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";

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

  const logout = async () => {
    try {
      await fetch('/api/auth/logout');
      
      setIsLoggedIn(false);
      localStorage.removeItem("isLoggedIn");
      toast.success("Logged out successfully");
      router.replace("/")
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  if (isLoggedIn === null) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
      <Toaster position="top-center" richColors={true} closeButton={false} expand={false} />
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
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { getAuthToken, clearAuthToken } from "@/lib/api";
import type { User } from "@/types/rbac";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  refetchUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchUser = useCallback(async () => {
    const token = getAuthToken();
    
    console.log("AuthContext: Fetching user, token exists:", !!token);
    
    if (!token) {
      console.log("AuthContext: No token found");
      setIsLoading(false);
      setUser(null);
      setIsAuthenticated(false);
      return;
    }

    try {
      console.log("AuthContext: Making request to /auth/me");
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        credentials: 'omit',
      });

      console.log("AuthContext: Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("AuthContext: User fetched successfully");
        setUser(data.user);
        setIsAuthenticated(true);
      } else if (response.status === 401) {
        // Token is invalid, clear it
        console.log("AuthContext: Token expired or invalid (401)");
        clearAuthToken();
        setUser(null);
        setIsAuthenticated(false);
        // Don't redirect here - let the route guards handle it
      } else {
        // For other errors (500, 503, etc.), keep the token
        console.error("AuthContext: Failed to fetch user, status:", response.status);
        // Keep authenticated state if we have a token
        setIsAuthenticated(!!token);
      }
    } catch (error) {
      console.error("AuthContext: Network error:", error);
      // Network error - keep the token and authenticated state
      setIsAuthenticated(!!token);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    setUser,
    refetchUser: fetchUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

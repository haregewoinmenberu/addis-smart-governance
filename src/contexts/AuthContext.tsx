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
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [hasFetchedOnMount, setHasFetchedOnMount] = useState(false);

  // Wrapper for setUser that also updates isAuthenticated
  const setUser = useCallback((newUser: User | null) => {
    console.log("AuthContext: setUser called with:", newUser ? newUser.email : "null");
    setUserState(newUser);
    setIsAuthenticated(!!newUser);
  }, []);

  const fetchUser = useCallback(async () => {
    const token = getAuthToken();
    
    console.log("AuthContext: Fetching user, token exists:", !!token);
    
    if (!token) {
      console.log("AuthContext: No token found");
      setIsLoading(false);
      setUserState(null);
      setIsAuthenticated(false);
      return;
    }

    // Prevent multiple simultaneous fetches
    if (isFetching) {
      console.log("AuthContext: Already fetching, skipping");
      return;
    }

    setIsFetching(true);

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
        console.log("AuthContext: User fetched successfully", data.user?.email);
        setUserState(data.user);
        setIsAuthenticated(true);
      } else if (response.status === 401 || response.status === 500) {
        // Token is invalid or server error - clear auth to prevent redirect loops
        console.log(`AuthContext: Auth failed with status ${response.status}, clearing token`);
        const errorText = await response.text();
        console.error("AuthContext: Error response:", errorText);
        clearAuthToken();
        setUserState(null);
        setIsAuthenticated(false);
      } else {
        // For other errors (503, etc.), keep trying
        console.error("AuthContext: Failed to fetch user, status:", response.status);
        const errorText = await response.text();
        console.error("AuthContext: Error response:", errorText);
        // Don't set authenticated without a user - this prevents redirect loops
        setUserState(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("AuthContext: Network error:", error);
      // Network error - clear auth to prevent redirect loops
      clearAuthToken();
      setUserState(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [isFetching]);

  const logout = useCallback(() => {
    clearAuthToken();
    setUserState(null);
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }, []);

  // Only fetch user once on mount
  useEffect(() => {
    if (!hasFetchedOnMount) {
      setHasFetchedOnMount(true);
      fetchUser();
    }
  }, [hasFetchedOnMount, fetchUser]);

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

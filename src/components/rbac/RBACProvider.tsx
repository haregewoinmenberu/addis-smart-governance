import { createContext, useContext, ReactNode } from "react";
import { useRBAC } from "@/hooks/useRBAC";

const RBACContext = createContext<ReturnType<typeof useRBAC> | undefined>(undefined);

interface RBACProviderProps {
  children: ReactNode;
}

/**
 * RBAC Provider Component
 * Provides RBAC context to all child components
 */
export function RBACProvider({ children }: RBACProviderProps) {
  const rbac = useRBAC();

  return (
    <RBACContext.Provider value={rbac}>
      {children}
    </RBACContext.Provider>
  );
}

/**
 * Hook to use RBAC context
 */
export function useRBACContext() {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error("useRBACContext must be used within RBACProvider");
  }
  return context;
}

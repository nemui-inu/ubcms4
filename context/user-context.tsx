"use client";

import { createContext, useContext, ReactNode } from "react";
import { useCurrentUser } from "@/hooks/use-current-user"; // your existing hook

// Define the shape of context data
type UserContextType = ReturnType<typeof useCurrentUser>;

// Create the context
const UserContext = createContext<UserContextType | null>(null);

// Provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const user = useCurrentUser(); // ✅ use your hook here

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

// Hook to use it easily anywhere
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

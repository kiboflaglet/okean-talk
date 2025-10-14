// lib/context/AppContext.tsx
'use client'
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { User } from "@/lib/types";
import { refreshUser, subscribeUserChanges } from "@/lib/services/userContextService";

interface AppContextType {
  user: User | null;
  refreshUser: () => Promise<User | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // useEffect(() => {
  //   refreshUser(setUser); // initial load
  //   const unsubscribe = subscribeUserChanges(setUser); // listen for login/logout
  //   return unsubscribe;
  // }, []);

  return (
    <AppContext.Provider value={{ user, refreshUser: () => refreshUser(setUser) }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within an AppProvider");
  return context;
};

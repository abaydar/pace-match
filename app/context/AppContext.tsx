import React, { createContext, useContext, useEffect, useRef } from "react";
import { useCurrentUser } from "../../lib/hooks/useCurrentUser";
import { useConnections } from "../../lib/hooks/useConnections";
import { useReadyStatus } from "../../lib/hooks/useReadyStatus";
import { registerForPushNotifications } from "../../lib/notifications";
import type { UserRow, UserUpdate, ReadyStatusRow, ConnectionRow } from "../../lib/database.types";

type AppContextType = {
  // User
  dbUser: UserRow | null;
  userLoading: boolean;
  createUser: (name: string, role: "runner" | "leader") => Promise<UserRow>;
  updateUser: (updates: UserUpdate) => Promise<void>;

  // Ready status
  readyStatus: ReadyStatusRow | null;
  setReadyNow: (visibility?: "everyone" | "club_members") => Promise<void>;
  setTimeWindow: (start: Date, end: Date, visibility?: "everyone" | "club_members") => Promise<void>;
  clearReadyStatus: () => Promise<void>;

  // Connections
  connections: ConnectionRow[];
  connectionsLoading: boolean;
  sendConnectionRequest: (toUserId: string) => Promise<void>;
  acceptConnectionRequest: (requestId: string) => Promise<void>;
  declineConnectionRequest: (requestId: string) => Promise<void>;
  hasSentRequest: (toUserId: string) => boolean;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { dbUser, loading: userLoading, createUser, updateUser } = useCurrentUser();
  const pushRegistered = useRef(false);

  useEffect(() => {
    if (!dbUser || pushRegistered.current) return;
    pushRegistered.current = true;
    registerForPushNotifications().then((token) => {
      if (token) updateUser({ expo_push_token: token });
    });
  }, [dbUser?.id]);

  const {
    status: readyStatus,
    setReadyNow,
    setTimeWindow,
    clearStatus: clearReadyStatus,
  } = useReadyStatus(dbUser?.id);

  const {
    connections,
    loading: connectionsLoading,
    sendRequest: sendConnectionRequest,
    updateStatus,
    hasSentRequest,
  } = useConnections(dbUser?.id);

  const value: AppContextType = {
    dbUser,
    userLoading,
    createUser,
    updateUser,

    readyStatus,
    setReadyNow,
    setTimeWindow,
    clearReadyStatus,

    connections,
    connectionsLoading,
    sendConnectionRequest,
    acceptConnectionRequest: (id) => updateStatus(id, "accepted"),
    declineConnectionRequest: (id) => updateStatus(id, "declined"),
    hasSentRequest,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

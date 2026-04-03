import { useState, useEffect, useCallback } from "react";
import { useGetSupabase } from "./useSupabase";
import type { ConnectionRow } from "../database.types";

export function useConnections(currentUserId: string | undefined) {
  const getSupabase = useGetSupabase();
  const [connections, setConnections] = useState<ConnectionRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    const sb = await getSupabase();
    const { data } = await sb
      .from("connection_requests")
      .select("*")
      .or(`from_user_id.eq.${currentUserId},to_user_id.eq.${currentUserId}`)
      .order("created_at", { ascending: false });
    setConnections(data ?? []);
    setLoading(false);
  }, [currentUserId]);

  useEffect(() => { fetch(); }, [fetch]);

  // Realtime subscription
  useEffect(() => {
    if (!currentUserId) return;
    let sub: any;
    (async () => {
      const sb = await getSupabase();
      sub = sb
        .channel("connections")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "connection_requests",
            filter: `from_user_id=eq.${currentUserId}`,
          },
          () => fetch()
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "connection_requests",
            filter: `to_user_id=eq.${currentUserId}`,
          },
          () => fetch()
        )
        .subscribe();
    })();
    return () => { sub?.unsubscribe(); };
  }, [currentUserId]);

  const sendRequest = useCallback(
    async (toUserId: string) => {
      if (!currentUserId) return;
      const sb = await getSupabase();
      await sb.from("connection_requests").insert({ from_user_id: currentUserId, to_user_id: toUserId });
      await fetch();
    },
    [currentUserId]
  );

  const updateStatus = useCallback(
    async (requestId: string, status: "accepted" | "declined") => {
      const sb = await getSupabase();
      await sb.from("connection_requests").update({ status }).eq("id", requestId);
      await fetch();
    },
    []
  );

  const hasSentRequest = useCallback(
    (toUserId: string) =>
      connections.some(
        (c) =>
          c.from_user_id === currentUserId &&
          c.to_user_id === toUserId &&
          (c.status === "pending" || c.status === "accepted")
      ),
    [connections, currentUserId]
  );

  return { connections, loading, sendRequest, updateStatus, hasSentRequest, refetch: fetch };
}

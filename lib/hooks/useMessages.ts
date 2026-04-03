import { useState, useEffect, useCallback } from "react";
import { useGetSupabase } from "./useSupabase";
import type { MessageRow } from "../database.types";

export function useMessages(connectionId: string | undefined) {
  const getSupabase = useGetSupabase();
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!connectionId) return;
    setLoading(true);
    const sb = await getSupabase();
    const { data } = await sb
      .from("messages")
      .select("*")
      .eq("connection_id", connectionId)
      .order("sent_at", { ascending: true });
    setMessages(data ?? []);
    setLoading(false);
  }, [connectionId]);

  useEffect(() => { fetch(); }, [fetch]);

  // Realtime subscription for live chat
  useEffect(() => {
    if (!connectionId) return;
    let sub: any;
    (async () => {
      const sb = await getSupabase();
      sub = sb
        .channel(`messages:${connectionId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `connection_id=eq.${connectionId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as MessageRow]);
          }
        )
        .subscribe();
    })();
    return () => { sub?.unsubscribe(); };
  }, [connectionId]);

  const sendMessage = useCallback(
    async (senderId: string, body: string): Promise<void> => {
      if (!connectionId) return;
      const sb = await getSupabase();
      await sb.from("messages").insert({ connection_id: connectionId, sender_id: senderId, body });
    },
    [connectionId]
  );

  return { messages, loading, sendMessage };
}

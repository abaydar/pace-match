import { useState, useEffect, useCallback } from "react";
import { useGetSupabase } from "./useSupabase";
import type { ReadyStatusRow } from "../database.types";

export function useReadyStatus(userId: string | undefined) {
  const getSupabase = useGetSupabase();
  const [status, setStatus] = useState<ReadyStatusRow | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!userId) return;
    const sb = await getSupabase();
    const { data } = await sb
      .from("ready_status")
      .select("*")
      .eq("user_id", userId)
      .single();
    setStatus(data ?? null);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const setReadyNow = useCallback(
    async (visibility: "everyone" | "club_members" = "club_members") => {
      if (!userId) return;
      const sb = await getSupabase();
      const expires_at = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2h
      const { data, error } = await sb
        .from("ready_status")
        .upsert(
          { user_id: userId, time_window_start: null, time_window_end: null, visibility, expires_at },
          { onConflict: "user_id" }
        )
        .select()
        .single();
      if (!error) setStatus(data);
    },
    [userId]
  );

  const setTimeWindow = useCallback(
    async (
      start: Date,
      end: Date,
      visibility: "everyone" | "club_members" = "club_members"
    ) => {
      if (!userId) return;
      const sb = await getSupabase();
      const { data, error } = await sb
        .from("ready_status")
        .upsert(
          {
            user_id: userId,
            time_window_start: start.toISOString(),
            time_window_end: end.toISOString(),
            visibility,
            expires_at: end.toISOString(),
          },
          { onConflict: "user_id" }
        )
        .select()
        .single();
      if (!error) setStatus(data);
    },
    [userId]
  );

  const clearStatus = useCallback(async () => {
    if (!userId) return;
    const sb = await getSupabase();
    await sb.from("ready_status").delete().eq("user_id", userId);
    setStatus(null);
  }, [userId]);

  return { status, loading, setReadyNow, setTimeWindow, clearStatus, refetch: fetch };
}

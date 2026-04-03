import { useState, useEffect, useCallback, useRef } from "react";
import { useGetSupabase } from "./useSupabase";

export interface ReadyRunner {
  id: string;
  name: string;
  location: string | null;
  pace_min: number | null;
  pace_max: number | null;
  time_window_start: string | null;
  time_window_end: string | null;
  visibility: string;
  expires_at: string;
}

export function useReadyRunners(currentUserId?: string) {
  const getSupabase = useGetSupabase();
  const [runners, setRunners] = useState<ReadyRunner[]>([]);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<any>(null);

  const fetch = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const sb = await getSupabase();
      const { data } = await sb
        .from("ready_status")
        .select("user_id, time_window_start, time_window_end, visibility, expires_at, users(id, name, location, pace_min, pace_max)")
        .gt("expires_at", new Date().toISOString())
        .neq("user_id", currentUserId);

      const mapped: ReadyRunner[] = (data ?? [])
        .map((row: any) => {
          const user = Array.isArray(row.users) ? row.users[0] : row.users;
          if (!user) return null;
          return {
            id: user.id,
            name: user.name,
            location: user.location,
            pace_min: user.pace_min,
            pace_max: user.pace_max,
            time_window_start: row.time_window_start,
            time_window_end: row.time_window_end,
            visibility: row.visibility,
            expires_at: row.expires_at,
          };
        })
        .filter(Boolean) as ReadyRunner[];

      setRunners(mapped);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Initial fetch
  useEffect(() => { fetch(); }, [fetch]);

  // Realtime subscription — re-fetch whenever any ready_status row changes
  useEffect(() => {
    if (!currentUserId) return;

    let active = true;

    getSupabase().then((sb) => {
      if (!active) return;
      const channel = sb
        .channel("ready_status_live")
        .on("postgres_changes", { event: "*", schema: "public", table: "ready_status" }, () => {
          fetch();
        })
        .subscribe();
      channelRef.current = { sb, channel };
    });

    return () => {
      active = false;
      if (channelRef.current) {
        const { sb, channel } = channelRef.current;
        sb.removeChannel(channel);
        channelRef.current = null;
      }
    };
  }, [currentUserId, fetch]);

  return { runners, loading, refetch: fetch };
}

import { useState, useCallback } from "react";
import { useGetSupabase } from "./useSupabase";

export interface MatchedRunner {
  id: string;
  name: string;
  avatar_url: string | null;
  location: string | null;
  pace_min: number | null;
  pace_max: number | null;
  goals: string[];
  distance_min: number | null;
  distance_max: number | null;
  training_type: string | null;
  destination_runs: string[];
  ready_status: {
    time_window_start: string | null;
    time_window_end: string | null;
    visibility: string;
    expires_at: string;
  } | null;
  score: number;
}

export function useRunners() {
  const getSupabase = useGetSupabase();
  const [runners, setRunners] = useState<MatchedRunner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const sb = await getSupabase();
      const { data, error: fnErr } = await sb.functions.invoke("match-runners");
      if (fnErr) throw fnErr;
      setRunners(data.runners ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { runners, loading, error, fetchMatches };
}

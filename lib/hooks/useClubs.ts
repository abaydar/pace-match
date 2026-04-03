import { useState, useEffect, useCallback } from "react";
import { useGetSupabase } from "./useSupabase";
import type { ClubRow } from "../database.types";

export type ClubWithCount = ClubRow & { member_count: number };

export function useClubs() {
  const getSupabase = useGetSupabase();
  const [clubs, setClubs] = useState<ClubWithCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const sb = await getSupabase();

      const { data: clubRows, error: err } = await sb
        .from("run_clubs")
        .select("*")
        .order("name");

      if (err) throw err;

      // Fetch member counts in parallel
      const withCounts = await Promise.all(
        (clubRows ?? []).map(async (club: ClubRow) => {
          const { count } = await sb
            .from("club_members")
            .select("*", { count: "exact", head: true })
            .eq("club_id", club.id);
          return { ...club, member_count: count ?? 0 };
        })
      );

      setClubs(withCounts);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { clubs, loading, error, refetch: fetch };
}

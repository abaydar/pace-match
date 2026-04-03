import { useState, useEffect, useCallback } from "react";
import { useGetSupabase } from "./useSupabase";
import type { ClubRow } from "../database.types";

export type ClubWithCount = ClubRow & { member_count: number };

export function useClubs(userId?: string) {
  const getSupabase = useGetSupabase();
  const [clubs, setClubs] = useState<ClubWithCount[]>([]);
  const [joinedClubIds, setJoinedClubIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const sb = await getSupabase();

      const [clubsRes, membershipsRes] = await Promise.all([
        sb.from("run_clubs").select("*").order("name"),
        userId
          ? sb.from("club_members").select("club_id").eq("user_id", userId)
          : Promise.resolve({ data: [] }),
      ]);

      if (clubsRes.error) throw clubsRes.error;

      setJoinedClubIds(new Set((membershipsRes.data ?? []).map((m: any) => m.club_id)));

      // Fetch member counts in parallel
      const withCounts = await Promise.all(
        (clubsRes.data ?? []).map(async (club: ClubRow) => {
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
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const joinClub = useCallback(async (clubId: string) => {
    if (!userId) throw new Error("Not signed in");
    const sb = await getSupabase();
    const { error } = await sb.from("club_members").insert({ club_id: clubId, user_id: userId });
    if (error) throw error;
    setJoinedClubIds((prev) => new Set([...prev, clubId]));
    setClubs((prev) =>
      prev.map((c) => c.id === clubId ? { ...c, member_count: c.member_count + 1 } : c)
    );
  }, [userId]);

  const leaveClub = useCallback(async (clubId: string) => {
    if (!userId) throw new Error("Not signed in");
    const sb = await getSupabase();
    await sb.from("club_members").delete().eq("club_id", clubId).eq("user_id", userId);
    setJoinedClubIds((prev) => { const s = new Set(prev); s.delete(clubId); return s; });
    setClubs((prev) =>
      prev.map((c) => c.id === clubId ? { ...c, member_count: Math.max(0, c.member_count - 1) } : c)
    );
  }, [userId]);

  return { clubs, joinedClubIds, loading, error, joinClub, leaveClub, refetch: fetch };
}

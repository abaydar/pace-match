import { useState, useEffect, useCallback } from "react";
import { useGetSupabase } from "./useSupabase";
import type { ClubRow, EventRow, AnnouncementRow, RsvpStatus, UserRow } from "../database.types";

export function useLeaderClub(leaderId: string | undefined) {
  const getSupabase = useGetSupabase();
  const [club, setClub] = useState<ClubRow | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [members, setMembers] = useState<UserRow[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!leaderId) return;
    setLoading(true);
    const sb = await getSupabase();

    const [clubRes, eventsRes, announcementsRes] = await Promise.all([
      sb.from("run_clubs").select("*").eq("leader_id", leaderId).single(),
      sb.from("run_events").select("*").order("datetime"),
      sb.from("announcements").select("*").order("pinned", { ascending: false }).order("created_at", { ascending: false }),
    ]);

    if (clubRes.data) {
      setClub(clubRes.data);

      const [countRes, membersRes] = await Promise.all([
        sb.from("club_members").select("*", { count: "exact", head: true }).eq("club_id", clubRes.data.id),
        sb.from("club_members").select("users(*)").eq("club_id", clubRes.data.id),
      ]);
      setMemberCount(countRes.count ?? 0);
      setMembers((membersRes.data ?? []).map((m: any) => m.users).filter(Boolean));

      // Filter events/announcements to this club
      setEvents((eventsRes.data ?? []).filter((e) => e.club_id === clubRes.data!.id));
      setAnnouncements((announcementsRes.data ?? []).filter((a) => a.club_id === clubRes.data!.id));
    }
    setLoading(false);
  }, [leaderId]);

  useEffect(() => { fetch(); }, [fetch]);

  const createClub = useCallback(
    async (name: string, description: string, location: string): Promise<ClubRow> => {
      if (!leaderId) throw new Error("No leader ID");
      const sb = await getSupabase();
      const { data, error } = await sb
        .from("run_clubs")
        .insert({ name, description, location, leader_id: leaderId })
        .select()
        .single();
      if (error) throw error;
      setClub(data);
      return data;
    },
    [leaderId]
  );

  const createEvent = useCallback(
    async (event: Omit<EventRow, "id" | "created_at">): Promise<void> => {
      const sb = await getSupabase();
      await sb.from("run_events").insert(event);
      await fetch();
    },
    [fetch]
  );

  const updateEvent = useCallback(
    async (eventId: string, updates: Partial<EventRow>): Promise<void> => {
      const sb = await getSupabase();
      await sb.from("run_events").update(updates).eq("id", eventId);
      await fetch();
    },
    [fetch]
  );

  const deleteEvent = useCallback(
    async (eventId: string): Promise<void> => {
      const sb = await getSupabase();
      await sb.from("run_events").delete().eq("id", eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    },
    []
  );

  const postAnnouncement = useCallback(
    async (clubId: string, title: string, body: string, pinned = false): Promise<void> => {
      const sb = await getSupabase();
      await sb.from("announcements").insert({ club_id: clubId, title, body, pinned });
      await fetch();
    },
    [fetch]
  );

  const rsvp = useCallback(
    async (eventId: string, userId: string, status: RsvpStatus): Promise<void> => {
      const sb = await getSupabase();
      await sb.from("rsvps").upsert(
        { event_id: eventId, user_id: userId, status },
        { onConflict: "event_id,user_id" }
      );
    },
    []
  );

  const addMember = useCallback(
    async (userId: string): Promise<void> => {
      if (!club) throw new Error("No club");
      const sb = await getSupabase();
      const { error } = await sb.from("club_members").insert({ club_id: club.id, user_id: userId });
      if (error) throw error;
      await fetch();
    },
    [club, fetch]
  );

  const removeMember = useCallback(
    async (userId: string): Promise<void> => {
      if (!club) throw new Error("No club");
      const sb = await getSupabase();
      await sb.from("club_members").delete().eq("club_id", club.id).eq("user_id", userId);
      setMembers((prev) => prev.filter((m) => m.id !== userId));
      setMemberCount((prev) => Math.max(0, prev - 1));
    },
    [club]
  );

  const searchRunners = useCallback(
    async (query: string): Promise<UserRow[]> => {
      const sb = await getSupabase();
      const { data } = await sb
        .from("users")
        .select("*")
        .eq("role", "runner")
        .ilike("name", `%${query}%`)
        .limit(20);
      return data ?? [];
    },
    []
  );

  const sendEmergencyAlert = useCallback(
    async (clubId: string, title: string, body: string): Promise<void> => {
      const sb = await getSupabase();
      await sb.functions.invoke("send-emergency-alert", {
        body: { club_id: clubId, title, body },
      });
      await fetch();
    },
    [fetch]
  );

  return {
    club,
    events,
    announcements,
    members,
    memberCount,
    loading,
    createClub,
    createEvent,
    updateEvent,
    deleteEvent,
    postAnnouncement,
    rsvp,
    addMember,
    removeMember,
    searchRunners,
    sendEmergencyAlert,
    refetch: fetch,
  };
}

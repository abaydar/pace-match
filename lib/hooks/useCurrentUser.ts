import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-expo";
import { useGetSupabase } from "./useSupabase";
import type { UserRow, UserUpdate } from "../database.types";

export function useCurrentUser() {
  const { user: clerkUser } = useUser();
  const getSupabase = useGetSupabase();

  const [dbUser, setDbUser] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!clerkUser) {
      setDbUser(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const sb = await getSupabase();
      const { data, error: err } = await sb
        .from("users")
        .select("*")
        .eq("clerk_id", clerkUser.id)
        .single();
      if (err) throw err;
      setDbUser(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [clerkUser?.id]);

  useEffect(() => { fetch(); }, [fetch]);

  // Creates the user row in Supabase after first sign-up
  const createUser = useCallback(
    async (
      name: string,
      role: "runner" | "leader"
    ): Promise<UserRow> => {
      if (!clerkUser) throw new Error("Not authenticated");
      const sb = await getSupabase();
      const { data, error: err } = await sb
        .from("users")
        .insert({
          clerk_id: clerkUser.id,
          name,
          role,
          goals: [],
          destination_runs: [],
        })
        .select()
        .single();
      if (err) throw err;
      setDbUser(data);
      return data;
    },
    [clerkUser?.id]
  );

  const updateUser = useCallback(
    async (updates: UserUpdate): Promise<void> => {
      if (!dbUser) throw new Error("No user loaded");
      const sb = await getSupabase();
      const { data, error: err } = await sb
        .from("users")
        .update(updates)
        .eq("id", dbUser.id)
        .select()
        .single();
      if (err) throw err;
      setDbUser(data);
    },
    [dbUser?.id]
  );

  return { dbUser, loading, error, createUser, updateUser, refetch: fetch };
}

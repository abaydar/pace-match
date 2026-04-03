import { useSession } from "@clerk/clerk-expo";
import { authedClient } from "../supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

// Returns an async function that resolves a fresh Supabase client with a valid token.
// Use this for all database operations.
export function useGetSupabase() {
  const { session } = useSession();

  return async (): Promise<SupabaseClient> => {
    if (!session) throw new Error("Not authenticated");
    const token = await session.getToken({ template: "supabase" });
    console.log("Clerk token:", token ? `${token.slice(0, 30)}...` : "NULL");
    if (!token) throw new Error("Failed to get Supabase token from Clerk - check JWT template is named 'supabase'");
    return authedClient(token);
  };
}

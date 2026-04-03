import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Base client — used for calls that don't need user auth (e.g. public queries)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Returns an authenticated client scoped to the current Clerk session.
// Pass the Clerk session token (from useSession / getToken) to this.
export function authedClient(clerkToken: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
    auth: {
      // Disable Supabase's own auth since we're using Clerk JWTs
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

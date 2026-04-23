import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  // Resolve current user via the clerk_id → users.id mapping
  const { data: myId, error: idErr } = await supabase.rpc("current_user_id");
  if (idErr || !myId) {
    return new Response(JSON.stringify({ error: "User not found — ensure your profile is created" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get caller's profile
  const { data: me, error: meErr } = await supabase
    .from("users")
    .select("id, pace_min, pace_max, goals, distance_min, distance_max, training_type")
    .eq("id", myId)
    .single();

  if (meErr || !me) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get my club IDs
  const { data: myClubs } = await supabase
    .from("club_members")
    .select("club_id")
    .eq("user_id", me.id);

  const myClubIds = (myClubs ?? []).map((c: { club_id: string }) => c.club_id);

  // Fetch all other runners with their ready_status
  const { data: runners, error: rErr } = await supabase
    .from("users")
    .select(`
      id, name, avatar_url, location, pace_min, pace_max,
      goals, distance_min, distance_max, training_type, destination_runs,
      ready_status (
        time_window_start, time_window_end, visibility, expires_at
      ),
      club_members (
        club_id
      )
    `)
    .neq("id", me.id)
    .eq("role", "runner");

  if (rErr) {
    return new Response(JSON.stringify({ error: rErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const now = new Date();

  // Score each runner
  const scored = (runners ?? []).map((r: any) => {
    let score = 0;

    // 1. Pace overlap (0–40 pts)
    if (me.pace_min != null && me.pace_max != null && r.pace_min != null && r.pace_max != null) {
      const overlapMin = Math.max(me.pace_min, r.pace_min);
      const overlapMax = Math.min(me.pace_max, r.pace_max);
      if (overlapMax >= overlapMin) {
        const overlapRange = overlapMax - overlapMin;
        const myRange = me.pace_max - me.pace_min;
        score += 40 * Math.min(1, (overlapRange + 30) / Math.max(myRange, 60));
      }
    }

    // 2. Shared club (30 pts)
    const runnerClubIds = (r.club_members ?? []).map((c: { club_id: string }) => c.club_id);
    const sharesClub = runnerClubIds.some((id: string) => myClubIds.includes(id));
    if (sharesClub) score += 30;

    // 3. Shared goals (up to 15 pts)
    const myGoals: string[] = me.goals ?? [];
    const theirGoals: string[] = r.goals ?? [];
    const sharedGoals = myGoals.filter((g) => theirGoals.includes(g)).length;
    score += Math.min(15, sharedGoals * 5);

    // 4. Matching training type (10 pts)
    if (me.training_type && r.training_type === me.training_type) score += 10;

    // 5. Distance overlap (5 pts)
    if (
      me.distance_min != null && me.distance_max != null &&
      r.distance_min != null && r.distance_max != null
    ) {
      const dOverlap =
        Math.min(me.distance_max, r.distance_max) - Math.max(me.distance_min, r.distance_min);
      if (dOverlap > 0) score += 5;
    }

    // 6. Ready status bonus (20 pts) — only if visible to caller
    let readyStatus = null;
    const rs = Array.isArray(r.ready_status) ? r.ready_status[0] : r.ready_status;
    if (rs && new Date(rs.expires_at) > now) {
      if (rs.visibility === "everyone" || sharesClub) {
        score += 20;
        readyStatus = rs;
      }
    }

    return {
      id: r.id,
      name: r.name,
      avatar_url: r.avatar_url,
      location: r.location,
      pace_min: r.pace_min,
      pace_max: r.pace_max,
      goals: r.goals,
      distance_min: r.distance_min,
      distance_max: r.distance_max,
      training_type: r.training_type,
      destination_runs: r.destination_runs,
      ready_status: readyStatus,
      score,
    };
  });

  scored.sort((a: { score: number }, b: { score: number }) => b.score - a.score);

  return new Response(JSON.stringify({ runners: scored }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

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

  const { club_id, title, body } = await req.json();
  if (!club_id || !title || !body) {
    return new Response(JSON.stringify({ error: "club_id, title, and body are required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Use service role key so we can fan out to all members without RLS blocking us
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Verify caller is the club leader (use anon client with user JWT)
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: club, error: clubErr } = await supabase
    .from("run_clubs")
    .select("id, leader_id, name")
    .eq("id", club_id)
    .single();

  if (clubErr || !club) {
    return new Response(JSON.stringify({ error: "Club not found or access denied" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get all member user IDs
  const { data: members } = await supabaseAdmin
    .from("club_members")
    .select("user_id")
    .eq("club_id", club_id);

  if (!members?.length) {
    return new Response(JSON.stringify({ sent: 0, message: "No members found" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const memberIds = members.map((m: { user_id: string }) => m.user_id);

  // Get their push tokens
  const { data: tokenRows } = await supabaseAdmin
    .from("push_tokens")
    .select("token")
    .in("user_id", memberIds);

  const tokens = (tokenRows ?? []).map((r: { token: string }) => r.token);

  if (!tokens.length) {
    return new Response(JSON.stringify({ sent: 0, message: "No push tokens registered" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Batch in chunks of 100 (Expo limit)
  const chunks: string[][] = [];
  for (let i = 0; i < tokens.length; i += 100) {
    chunks.push(tokens.slice(i, i + 100));
  }

  let totalSent = 0;
  for (const chunk of chunks) {
    const messages = chunk.map((token) => ({
      to: token,
      title,
      body,
      priority: "high",
      sound: "default",
      data: { club_id, type: "emergency_alert" },
    }));

    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messages),
    });

    if (res.ok) totalSent += chunk.length;
  }

  // Also store as an announcement for in-app visibility
  await supabaseAdmin.from("announcements").insert({
    club_id,
    title: `🚨 ${title}`,
    body,
    pinned: true,
  });

  return new Response(JSON.stringify({ sent: totalSent }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

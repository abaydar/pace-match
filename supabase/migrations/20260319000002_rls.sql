-- ─── ENABLE RLS ──────────────────────────────────────────────────────────────
alter table public.users               enable row level security;
alter table public.ready_status        enable row level security;
alter table public.run_clubs           enable row level security;
alter table public.club_members        enable row level security;
alter table public.run_events          enable row level security;
alter table public.rsvps               enable row level security;
alter table public.announcements       enable row level security;
alter table public.connection_requests enable row level security;
alter table public.messages            enable row level security;
alter table public.push_tokens         enable row level security;

-- ─── HELPER: resolve clerk_id from JWT to users.id ───────────────────────────
create or replace function public.current_user_id()
returns uuid
language sql stable
as $$
  select id from public.users
  where clerk_id = (auth.jwt() ->> 'sub')
  limit 1
$$;

-- ─── HELPER: check if two users share a club ─────────────────────────────────
create or replace function public.shares_club(other_user_id uuid)
returns boolean
language sql stable
as $$
  select exists (
    select 1 from public.club_members a
    join public.club_members b on a.club_id = b.club_id
    where a.user_id = public.current_user_id()
      and b.user_id = other_user_id
  )
$$;

-- ─── USERS ───────────────────────────────────────────────────────────────────
-- Anyone signed in can read any user profile (needed for discover)
create policy "users: read all" on public.users
  for select using (auth.role() = 'authenticated');

-- Users can only insert/update their own row
create policy "users: insert own" on public.users
  for insert with check (clerk_id = (auth.jwt() ->> 'sub'));

create policy "users: update own" on public.users
  for update using (id = public.current_user_id());

-- ─── READY STATUS ────────────────────────────────────────────────────────────
-- Own status: always visible
-- Others: visible if visibility='everyone' OR shares a club
create policy "ready_status: read" on public.ready_status
  for select using (
    user_id = public.current_user_id()
    or (
      expires_at > now()
      and (
        visibility = 'everyone'
        or public.shares_club(user_id)
      )
    )
  );

create policy "ready_status: write own" on public.ready_status
  for all using (user_id = public.current_user_id())
  with check (user_id = public.current_user_id());

-- ─── RUN CLUBS ───────────────────────────────────────────────────────────────
-- Anyone can read clubs
create policy "run_clubs: read all" on public.run_clubs
  for select using (auth.role() = 'authenticated');

-- Only authenticated users can create clubs
create policy "run_clubs: insert" on public.run_clubs
  for insert with check (leader_id = public.current_user_id());

-- Only the leader can update/delete
create policy "run_clubs: update own" on public.run_clubs
  for update using (leader_id = public.current_user_id());

create policy "run_clubs: delete own" on public.run_clubs
  for delete using (leader_id = public.current_user_id());

-- ─── CLUB MEMBERS ────────────────────────────────────────────────────────────
-- Members can see their own club memberships; leaders can see all members of clubs they lead
create policy "club_members: read" on public.club_members
  for select using (
    user_id = public.current_user_id()
    or exists (
      select 1 from public.run_clubs rc
      where rc.id = club_id and rc.leader_id = public.current_user_id()
    )
  );

-- Users can join (insert themselves); leaders can add members
create policy "club_members: join" on public.club_members
  for insert with check (
    user_id = public.current_user_id()
    or exists (
      select 1 from public.run_clubs rc
      where rc.id = club_id and rc.leader_id = public.current_user_id()
    )
  );

-- Users can leave (delete self); leaders can remove anyone from their club
create policy "club_members: leave or kick" on public.club_members
  for delete using (
    user_id = public.current_user_id()
    or exists (
      select 1 from public.run_clubs rc
      where rc.id = club_id and rc.leader_id = public.current_user_id()
    )
  );

-- ─── RUN EVENTS ──────────────────────────────────────────────────────────────
-- Club members can read events for their clubs
create policy "run_events: read members" on public.run_events
  for select using (
    exists (
      select 1 from public.club_members cm
      where cm.club_id = run_events.club_id
        and cm.user_id = public.current_user_id()
    )
    or exists (
      select 1 from public.run_clubs rc
      where rc.id = run_events.club_id
        and rc.leader_id = public.current_user_id()
    )
  );

-- Only club leader can create/edit/delete events
create policy "run_events: write leader" on public.run_events
  for all using (
    exists (
      select 1 from public.run_clubs rc
      where rc.id = run_events.club_id
        and rc.leader_id = public.current_user_id()
    )
  )
  with check (
    exists (
      select 1 from public.run_clubs rc
      where rc.id = club_id
        and rc.leader_id = public.current_user_id()
    )
  );

-- ─── RSVPs ───────────────────────────────────────────────────────────────────
-- Members can read RSVPs for events in their clubs
create policy "rsvps: read" on public.rsvps
  for select using (
    exists (
      select 1 from public.run_events re
      join public.club_members cm on cm.club_id = re.club_id
      where re.id = rsvps.event_id
        and cm.user_id = public.current_user_id()
    )
  );

-- Users can upsert/delete their own RSVP
create policy "rsvps: write own" on public.rsvps
  for all using (user_id = public.current_user_id())
  with check (user_id = public.current_user_id());

-- ─── ANNOUNCEMENTS ───────────────────────────────────────────────────────────
-- Club members can read announcements
create policy "announcements: read members" on public.announcements
  for select using (
    exists (
      select 1 from public.club_members cm
      where cm.club_id = announcements.club_id
        and cm.user_id = public.current_user_id()
    )
    or exists (
      select 1 from public.run_clubs rc
      where rc.id = announcements.club_id
        and rc.leader_id = public.current_user_id()
    )
  );

-- Only leader can create/update/delete announcements
create policy "announcements: write leader" on public.announcements
  for all using (
    exists (
      select 1 from public.run_clubs rc
      where rc.id = announcements.club_id
        and rc.leader_id = public.current_user_id()
    )
  )
  with check (
    exists (
      select 1 from public.run_clubs rc
      where rc.id = club_id
        and rc.leader_id = public.current_user_id()
    )
  );

-- ─── CONNECTION REQUESTS ─────────────────────────────────────────────────────
-- Only the two parties can see the request
create policy "connection_requests: read participants" on public.connection_requests
  for select using (
    from_user_id = public.current_user_id()
    or to_user_id = public.current_user_id()
  );

-- Any authenticated user can send a request (as themselves)
create policy "connection_requests: insert" on public.connection_requests
  for insert with check (from_user_id = public.current_user_id());

-- Only the recipient can accept/decline; sender can delete (cancel)
create policy "connection_requests: update recipient" on public.connection_requests
  for update using (to_user_id = public.current_user_id());

create policy "connection_requests: delete sender" on public.connection_requests
  for delete using (from_user_id = public.current_user_id());

-- ─── MESSAGES ────────────────────────────────────────────────────────────────
-- Only participants of the connection can read messages
create policy "messages: read participants" on public.messages
  for select using (
    exists (
      select 1 from public.connection_requests cr
      where cr.id = messages.connection_id
        and (cr.from_user_id = public.current_user_id() or cr.to_user_id = public.current_user_id())
        and cr.status = 'accepted'
    )
  );

-- Sender must be a participant and the connection must be accepted
create policy "messages: insert participant" on public.messages
  for insert with check (
    sender_id = public.current_user_id()
    and exists (
      select 1 from public.connection_requests cr
      where cr.id = connection_id
        and (cr.from_user_id = public.current_user_id() or cr.to_user_id = public.current_user_id())
        and cr.status = 'accepted'
    )
  );

-- ─── PUSH TOKENS ─────────────────────────────────────────────────────────────
-- Users can only manage their own tokens
create policy "push_tokens: own" on public.push_tokens
  for all using (user_id = public.current_user_id())
  with check (user_id = public.current_user_id());

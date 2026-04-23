-- Extend users with new fields
alter table public.users
  add column if not exists gender text,
  add column if not exists is_available boolean not null default false,
  add column if not exists expo_push_token text,
  add column if not exists latitude float8,
  add column if not exists longitude float8;

-- ─── RUNS ────────────────────────────────────────────────────────────────────
create table public.runs (
  id               uuid primary key default gen_random_uuid(),
  host_id          uuid not null references public.users (id) on delete cascade,
  time             timestamptz not null,
  latitude         float8 not null,
  longitude        float8 not null,
  location_label   text,
  pace_bucket      text,
  distance         text,
  training_type    text,
  status           text not null default 'open' check (status in ('open', 'closed', 'cancelled')),
  created_at       timestamptz not null default now()
);

-- ─── RUN INVITES ─────────────────────────────────────────────────────────────
create table public.run_invites (
  id          uuid primary key default gen_random_uuid(),
  run_id      uuid not null references public.runs (id) on delete cascade,
  runner_id   uuid not null references public.users (id) on delete cascade,
  status      text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at  timestamptz not null default now(),
  constraint unique_run_invite unique (run_id, runner_id)
);

-- ─── RUN MESSAGES ────────────────────────────────────────────────────────────
create table public.run_messages (
  id            uuid primary key default gen_random_uuid(),
  run_id        uuid not null references public.runs (id) on delete cascade,
  sender_id     uuid not null references public.users (id) on delete cascade,
  recipient_id  uuid references public.users (id),  -- null = broadcast to all accepted
  body          text not null,
  created_at    timestamptz not null default now()
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
create index on public.runs (host_id, status);
create index on public.run_invites (run_id, status);
create index on public.run_invites (runner_id, status);
create index on public.run_messages (run_id, created_at);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table public.runs          enable row level security;
alter table public.run_invites   enable row level security;
alter table public.run_messages  enable row level security;

-- runs: host manages their own; all authenticated users can read open runs
create policy "runs: read open" on public.runs
  for select using (auth.role() = 'authenticated' and status = 'open');

create policy "runs: host owns" on public.runs
  using (host_id = public.current_user_id());

create policy "runs: host insert" on public.runs
  for insert with check (host_id = public.current_user_id());

-- run_invites: host inserts; runners read/update their own; host reads all for their run
create policy "run_invites: host inserts" on public.run_invites
  for insert with check (
    run_id in (select id from public.runs where host_id = public.current_user_id())
  );

create policy "run_invites: runner reads own" on public.run_invites
  for select using (runner_id = public.current_user_id());

create policy "run_invites: host reads" on public.run_invites
  for select using (
    run_id in (select id from public.runs where host_id = public.current_user_id())
  );

create policy "run_invites: runner updates own" on public.run_invites
  for update using (runner_id = public.current_user_id())
  with check (runner_id = public.current_user_id());

-- run_messages: participants read/insert
create policy "run_messages: participants read" on public.run_messages
  for select using (
    run_id in (
      select run_id from public.run_invites
      where runner_id = public.current_user_id() and status = 'accepted'
    )
    or run_id in (select id from public.runs where host_id = public.current_user_id())
  );

create policy "run_messages: participants insert" on public.run_messages
  for insert with check (sender_id = public.current_user_id());

-- Enable realtime
alter publication supabase_realtime add table public.run_invites;
alter publication supabase_realtime add table public.run_messages;

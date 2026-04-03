-- Enable extensions
create extension if not exists "uuid-ossp";

-- ─── USERS ───────────────────────────────────────────────────────────────────
create table public.users (
  id            uuid primary key default gen_random_uuid(),
  clerk_id      text unique not null,
  name          text not null,
  avatar_url    text,
  role          text not null check (role in ('runner', 'leader')),
  location      text,
  pace_min      integer,  -- seconds per mile
  pace_max      integer,  -- seconds per mile
  goals         text[]    default '{}',
  distance_min  float,
  distance_max  float,
  training_type text check (training_type in ('5k', '10k', 'half', 'marathon')),
  destination_runs text[] default '{}',
  created_at    timestamptz not null default now()
);

-- ─── READY STATUS ────────────────────────────────────────────────────────────
create table public.ready_status (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users (id) on delete cascade,
  time_window_start   timestamptz,  -- null means "right now"
  time_window_end     timestamptz,
  visibility          text not null default 'club_members' check (visibility in ('everyone', 'club_members')),
  expires_at          timestamptz not null,
  created_at          timestamptz not null default now(),
  -- only one active status per user
  constraint one_per_user unique (user_id)
);

-- ─── RUN CLUBS ───────────────────────────────────────────────────────────────
create table public.run_clubs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  location    text,
  leader_id   uuid not null references public.users (id) on delete restrict,
  created_at  timestamptz not null default now()
);

-- ─── CLUB MEMBERS ────────────────────────────────────────────────────────────
create table public.club_members (
  club_id     uuid not null references public.run_clubs (id) on delete cascade,
  user_id     uuid not null references public.users (id) on delete cascade,
  joined_at   timestamptz not null default now(),
  primary key (club_id, user_id)
);

-- ─── RUN EVENTS ──────────────────────────────────────────────────────────────
create table public.run_events (
  id               uuid primary key default gen_random_uuid(),
  club_id          uuid not null references public.run_clubs (id) on delete cascade,
  title            text not null,
  datetime         timestamptz not null,
  location         text,
  route_notes      text,
  pace_groups      jsonb default '[]',
  distance_options float[] default '{}',
  created_at       timestamptz not null default now()
);

-- ─── RSVPs ───────────────────────────────────────────────────────────────────
create table public.rsvps (
  event_id    uuid not null references public.run_events (id) on delete cascade,
  user_id     uuid not null references public.users (id) on delete cascade,
  status      text not null check (status in ('going', 'maybe', 'not_going')),
  updated_at  timestamptz not null default now(),
  primary key (event_id, user_id)
);

-- ─── ANNOUNCEMENTS ───────────────────────────────────────────────────────────
create table public.announcements (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references public.run_clubs (id) on delete cascade,
  title       text not null,
  body        text not null,
  pinned      boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ─── CONNECTION REQUESTS ─────────────────────────────────────────────────────
create table public.connection_requests (
  id            uuid primary key default gen_random_uuid(),
  from_user_id  uuid not null references public.users (id) on delete cascade,
  to_user_id    uuid not null references public.users (id) on delete cascade,
  status        text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at    timestamptz not null default now(),
  constraint no_self_request check (from_user_id <> to_user_id),
  constraint unique_pair unique (from_user_id, to_user_id)
);

-- ─── MESSAGES ────────────────────────────────────────────────────────────────
create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  connection_id   uuid not null references public.connection_requests (id) on delete cascade,
  sender_id       uuid not null references public.users (id) on delete cascade,
  body            text not null,
  sent_at         timestamptz not null default now()
);

-- ─── PUSH TOKENS ─────────────────────────────────────────────────────────────
create table public.push_tokens (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users (id) on delete cascade,
  token       text not null unique,
  created_at  timestamptz not null default now()
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
create index on public.ready_status (expires_at);
create index on public.ready_status (user_id);
create index on public.club_members (user_id);
create index on public.club_members (club_id);
create index on public.run_events (club_id, datetime);
create index on public.announcements (club_id, pinned desc, created_at desc);
create index on public.connection_requests (from_user_id, status);
create index on public.connection_requests (to_user_id, status);
create index on public.messages (connection_id, sent_at);
create index on public.push_tokens (user_id);

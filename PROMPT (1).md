# PaceMatch — Claude Code Developer Prompt

## Project Overview

PaceMatch is a React Native / Expo mobile app that connects runners based on compatibility — pace, distance, training type, and location. Users can filter nearby runners, send real-time run invites, and coordinate meetups through in-app messaging.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo (SDK 51+) |
| Auth | Clerk (`@clerk/clerk-expo`) |
| Database | Supabase (`@supabase/supabase-js`) |
| Realtime | Supabase Realtime (websockets) |
| Navigation | React Navigation v6 (stack + bottom tabs) |
| Location | `expo-location` |
| Maps | `react-native-maps` |
| Notifications | `expo-notifications` |
| Language | TypeScript (strict mode) |

---

## Repository Structure

```
/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Home / feed
│   │   └── profile.tsx            # User profile
│   └── _layout.tsx                # Root layout
├── screens/
│   ├── FilterScreen.tsx
│   ├── AvailableRunnersScreen.tsx
│   ├── StartRunScreen.tsx
│   ├── RunInviteScreen.tsx
│   └── AcceptedRunnersScreen.tsx
├── components/
│   ├── RunnerCard.tsx
│   ├── FilterChip.tsx
│   ├── MapPreview.tsx
│   └── Avatar.tsx
├── lib/
│   ├── supabase.ts                # Base Supabase client
│   ├── useSupabase.ts             # Authenticated Supabase hook (Clerk JWT)
│   └── notifications.ts          # Expo push notification helpers
├── types/
│   └── index.ts                   # Shared TypeScript types
├── constants/
│   └── filters.ts                 # Filter option definitions
└── PROMPT.md                      # This file
```

---

## Auth Architecture

Clerk handles all authentication. Supabase uses Clerk JWTs via Third-party Auth (RS256 / JWKS).

**Never use the Supabase anon client for authenticated requests.** Always use `useSupabase.ts`:

```ts
// lib/useSupabase.ts
import { useAuth } from '@clerk/clerk-expo'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export function useSupabase() {
  const { getToken } = useAuth()

  const getClient = async () => {
    const token = await getToken({ template: 'supabase' })
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })
  }

  return { getClient }
}
```

The current user's ID is always `userId` from Clerk's `useAuth()`. This maps to `auth.jwt() ->> 'sub'` in Supabase RLS policies.

---

## Database Schema

### `profiles`
```sql
create table profiles (
  id text primary key,                  -- Clerk user ID (sub)
  name text not null,
  avatar_url text,
  gender text,
  pace_bucket text,                     -- e.g. '8:00-9:30'
  preferred_distance text,              -- e.g. '5'
  training_type text,                   -- e.g. 'Easy run'
  latitude float8,
  longitude float8,
  is_available boolean default false,
  expo_push_token text,
  updated_at timestamptz default now()
);
```

### `runs`
```sql
create table runs (
  id uuid primary key default gen_random_uuid(),
  host_id text not null references profiles(id),
  time timestamptz not null,
  latitude float8 not null,
  longitude float8 not null,
  location_label text,
  pace_bucket text,
  distance text,
  training_type text,
  status text default 'open',           -- 'open' | 'closed' | 'cancelled'
  created_at timestamptz default now()
);
```

### `run_invites`
```sql
create table run_invites (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references runs(id) on delete cascade,
  runner_id text not null references profiles(id),
  status text default 'pending',        -- 'pending' | 'accepted' | 'declined'
  created_at timestamptz default now()
);
```

### `messages`
```sql
create table messages (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references runs(id) on delete cascade,
  sender_id text not null references profiles(id),
  recipient_id text,                    -- null = broadcast to all accepted runners
  body text not null,
  created_at timestamptz default now()
);
```

---

## RLS Policies

```sql
-- profiles: users manage their own profile
alter table profiles enable row level security;
create policy "own profile" on profiles
  using (id = auth.jwt() ->> 'sub');

-- runs: hosts manage their own runs, runners can read open runs
alter table runs enable row level security;
create policy "host owns run" on runs
  using (host_id = auth.jwt() ->> 'sub');
create policy "runners read open runs" on runs
  for select using (status = 'open');

-- run_invites: hosts insert, runners read/update their own invites
alter table run_invites enable row level security;
create policy "host inserts invites" on run_invites
  for insert with check (
    run_id in (select id from runs where host_id = auth.jwt() ->> 'sub')
  );
create policy "runner reads own invites" on run_invites
  for select using (runner_id = auth.jwt() ->> 'sub');
create policy "runner updates own invite status" on run_invites
  for update using (runner_id = auth.jwt() ->> 'sub')
  with check (runner_id = auth.jwt() ->> 'sub');

-- messages: run participants only
alter table messages enable row level security;
create policy "participants read messages" on messages
  for select using (
    run_id in (
      select run_id from run_invites
      where runner_id = auth.jwt() ->> 'sub' and status = 'accepted'
    )
    or run_id in (select id from runs where host_id = auth.jwt() ->> 'sub')
  );
create policy "participants send messages" on messages
  for insert with check (sender_id = auth.jwt() ->> 'sub');
```

---

## Screens

### `FilterScreen.tsx`
**Route:** `/filter`

Filter options (all single-select chips):

| Filter | Options |
|---|---|
| Pace (min/mi) | `7:00–8:00`, `8:00–9:30`, `9:30–11:00` |
| Distance | `3`, `5`, `10`, `Half` |
| Training type | `Easy run`, `Tempo`, `Long run`, `Track` |
| Gender preference | `Any`, `Women only`, `Men only` |
| Location radius (mi) | `2`, `5`, `10` |

- All filters optional except location radius
- "Find runners" button navigates to `AvailableRunnersScreen` with filters as params
- Store last-used filters in `AsyncStorage` and restore on mount

---

### `AvailableRunnersScreen.tsx`
**Route:** `/runners`

- Query `profiles` table using filters from params
- Filter `is_available = true`
- Filter `gender` if not "Any"
- Filter `pace_bucket`, `preferred_distance`, `training_type` if set
- Calculate distance from user's current GPS to each runner's `latitude/longitude`
- Exclude runners beyond the selected radius
- Sort by distance ascending

Each `RunnerCard` shows: avatar (initials), name, pace, distance away, training type badge.

"Start a run" button at the bottom navigates to `StartRunScreen`, passing the list of matched runner IDs.

---

### `StartRunScreen.tsx`
**Route:** `/start-run`

- Time picker defaulting to now + 30 minutes
- Use `expo-location` to get current GPS coordinates
- Reverse geocode to a human-readable label using `Location.reverseGeocodeAsync`
- Show a `react-native-maps` `MapView` centered on the user's location with a marker

On "Send invites":
1. Insert row into `runs`
2. Insert one row per invited runner into `run_invites` with `status: 'pending'`
3. Fetch each runner's `expo_push_token` from `profiles`
4. Send push notification to each runner via `lib/notifications.ts`
5. Navigate to `AcceptedRunnersScreen` with `run_id`

---

### `RunInviteScreen.tsx`
**Route:** `/invite/:run_id`
**Audience:** Invited runner (arrives via push notification deep link)

- Fetch the `runs` row by `run_id`
- Fetch the host's `profiles` row
- Display: host avatar + name, map preview (lat/lng), time, distance, pace
- **Accept** → update `run_invites` set `status = 'accepted'`, navigate home
- **Decline** → update `run_invites` set `status = 'declined'`, navigate home

---

### `AcceptedRunnersScreen.tsx`
**Route:** `/run/:run_id/accepted`
**Audience:** Run host

- Subscribe to Supabase Realtime on `run_invites` where `run_id = :run_id` and `status = 'accepted'`
- Fetch and display each accepted runner's profile in real time as they accept
- Each row: avatar, name, distance away, **Message** button (opens DM thread)
- Bottom CTA: **Message all** — inserts a broadcast message into `messages` with `recipient_id = null`

---

## Shared Types (`types/index.ts`)

```ts
export type PaceBucket = '7:00-8:00' | '8:00-9:30' | '9:30-11:00'
export type Distance = '3' | '5' | '10' | 'Half'
export type TrainingType = 'Easy run' | 'Tempo' | 'Long run' | 'Track'
export type GenderPreference = 'Any' | 'Women only' | 'Men only'
export type RunStatus = 'open' | 'closed' | 'cancelled'
export type InviteStatus = 'pending' | 'accepted' | 'declined'

export interface RunnerProfile {
  id: string
  name: string
  avatar_url: string | null
  gender: string | null
  pace_bucket: PaceBucket | null
  preferred_distance: Distance | null
  training_type: TrainingType | null
  latitude: number | null
  longitude: number | null
  is_available: boolean
  expo_push_token: string | null
  distanceAway?: number   // computed client-side (miles)
}

export interface Run {
  id: string
  host_id: string
  time: string
  latitude: number
  longitude: number
  location_label: string | null
  pace_bucket: PaceBucket | null
  distance: Distance | null
  training_type: TrainingType | null
  status: RunStatus
  created_at: string
}

export interface RunInvite {
  id: string
  run_id: string
  runner_id: string
  status: InviteStatus
  created_at: string
}
```

---

## Push Notifications (`lib/notifications.ts`)

```ts
import * as Notifications from 'expo-notifications'

export async function sendRunInviteNotification(
  pushToken: string,
  payload: { runId: string; hostName: string; time: string; locationLabel: string }
) {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: pushToken,
      title: `${payload.hostName} wants to run with you`,
      body: `${payload.time} · ${payload.locationLabel}`,
      data: { screen: 'RunInvite', runId: payload.runId },
    }),
  })
}
```

Deep link handling: on notification tap, navigate to `RunInviteScreen` with `run_id` from `data.runId`.

---

## Coding Standards

- **TypeScript strict** — no `any`, no `!` non-null assertions without a comment explaining why
- **No `useEffect` for data fetching** — use async functions called in event handlers or a data-fetching hook
- **Error + loading states** — every async operation must handle both; show a spinner on load, an inline error message on failure
- **No inline styles** — use `StyleSheet.create` for all React Native styles
- **Component size** — if a component exceeds 150 lines, split it
- **Realtime cleanup** — always unsubscribe from Supabase Realtime channels in the `useEffect` cleanup function
- **Environment variables** — all secrets via `process.env.EXPO_PUBLIC_*`; never hardcode URLs or keys

---

## Environment Variables

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
```

---

## What NOT to Do

- Do not restructure `App.tsx` or the root `_layout.tsx`
- Do not use the Supabase anon client directly for user data — always use `useSupabase.ts`
- Do not call Clerk's `userId` directly as a Supabase foreign key without confirming it matches the `sub` claim
- Do not add new third-party libraries without checking if Expo SDK already provides the capability
- Do not use `console.log` in production paths — use a logger utility or remove before committing

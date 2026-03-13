# PaceMatch — React Native/Expo Developer Prompt

You are an expert React Native/Expo developer and product-minded UX designer. Build a cross-platform mobile app called **"PaceMatch"** for runners and run clubs.

---

## GOAL

Create a marketplace-style running app where:
1. Runners can find other runners with similar pace/goals and optionally get matched to a run club.
2. Run club leaders can manage club operations (runs, schedules, RSVPs, announcements, weather/emergency updates).
3. Runners can set "Ready to run" status at specific times so other runners (especially within their club) can connect.

---

## PLATFORM + TECH

- React Native with Expo (SDK 51+), targeting iOS and Android
- Use a **component + context** architecture (React Context + useReducer for global state, or Zustand for lightweight state management)
- Use a simple **local mock data layer (in-memory)** for v1, structured so it can later be replaced by Firebase/Firestore or Supabase
- Use **Expo Router** (file-based routing) for navigation
- Style with **NativeWind** (Tailwind for React Native) or **StyleSheet** with a shared design tokens file
- Support dark mode via `useColorScheme` and accessible components (proper `accessibilityLabel`, `accessibilityRole` props)
- Use **@expo/vector-icons** (Ionicons or MaterialCommunityIcons) in place of SF Symbols

---

## PRIMARY ROLES + ONBOARDING

- First screen: Welcome
- Auth: simple (mock) sign up / log in
- Role selection screen during signup:
  - "I'm a Runner"
  - "I'm a Run Club Leader"
- The selected role determines the app's primary navigation (bottom tab bar via Expo Router tabs)

---

## RUNNER EXPERIENCE (Runner UI)

Create a runner-focused home UI. Screens / tabs (Runner):

1. **Discover** – Segmented control: "Runners" | "Run Clubs"; search bar + filter bottom sheet; results list with `RunnerCard` and `ClubCard` components
2. **Ready to Run** – Toggle + time selector ("Available now", "Today", "Tomorrow morning", custom time blocks); "Available runners" list prioritizing same club + similar pace
3. **Messages / Requests** – Connection requests list: Pending / Accepted
4. **Profile** – Edit pace, goals, distances, location, availability preferences

Filters:
- Pace range (min/mi or min/km)
- Location (city/neighborhood)
- Goals (fitness, long-run, race training, social)
- Distance preference (e.g., 3–5, 6–8, 9–12 miles)
- Destination runs (e.g., Central Park loop, waterfront route)
- Race training (5K / 10K / Half / Marathon)

**RunnerCard** (in lists):
- Name, pace range, location
- Tags (goals, distance, training)
- "Ready to run" status badge if applicable (e.g., "Ready now", "6–7 PM")
- CTA buttons: "Request to run" / "Message" (mock)

---

## RUN CLUB LEADER EXPERIENCE (Club Leader UI)

Screens / tabs (Leader):

1. **Club Dashboard** – Next run card (time, location, route); RSVP summary (Going/Maybe); quick actions: "Create Run", "Post Announcement", "Weather Alert"
2. **Schedule** – Weekly schedule view (FlatList or SectionList); training schedule section
3. **Runs (Events)** – Create/edit run event: title, date/time (use `@react-native-community/datetimepicker`), location + map placeholder (`react-native-maps` stub), route notes, pace groups, distance options, RSVP enabled
4. **Announcements** – Post updates to members; pin important messages
5. **Safety / Emergency** – Weather plan templates; emergency contacts/guidelines (editable); one-tap "Send emergency update" to members (mock)

---

## READY-TO-RUN STATUS FEATURE (Core)

- Runners set availability: "Ready now" or time blocks (e.g., "Today 6–7 PM", "Tomorrow 8–9 AM")
- Status displayed next to runner's name in lists and in a dedicated "Available" feed
- Basic privacy control — Visible to: "Everyone" or "Run club members only" (default: members only)

---

## DATA MODELS (Mock, structured for future backend)

```typescript
User: { id, name, role, location, paceRange, goals, distances, training, destinationRuns, clubIds, readyStatus: { timeWindow, visibility } }
RunClub: { id, name, location, description, schedule, leaderId, memberIds }
RunEvent: { id, clubId, title, datetime, location, routeNotes, paceGroups, distanceOptions, rsvpList }
Announcement: { id, clubId, title, body, pinned, createdAt }
ConnectionRequest: { id, fromUserId, toUserId, status }
```

---

## DELIVERABLES

Return:
1. A complete **Expo Router project file structure**
2. Screen skeleton code (TypeScript + JSX) for:
   - Welcome / Auth screens
   - Role selection
   - Runner tab layout + core screens
   - Club Leader tab layout + core screens
   - Ready-to-run status UI + mock data
3. Reusable UI components: `RunnerCard`, `ClubCard`, `RunEventCard`, `StatusBadge`
4. A short explanation of how to swap mock data for **Firebase** or **Supabase** later (high-level)
5. A `mockData.ts` file with **10 runners** and **3 clubs** so the UI looks real

---

## UI STYLE

- Modern, clean, community-oriented
- Consistent spacing/typography via a shared `theme.ts` tokens file
- Friendly empty states with icons and helper text
- Use `react-native-safe-area-context` for safe area handling
- Use `react-native-gesture-handler` + `react-native-reanimated` for smooth interactions (filter sheet, swipe actions)

---

## IMPORTANT

- Keep it MVP-level but realistically implementable
- Do not over-engineer; prefer readable, composable components
- Make sure the role-based tab experience feels **distinct and tailored** for each user type
- All navigation should use **Expo Router** conventions (`app/` directory, `_layout.tsx` files, dynamic routes)

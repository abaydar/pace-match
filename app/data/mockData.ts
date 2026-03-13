export type ReadyStatus = {
  timeWindow: 'now' | 'today-morning' | 'today-afternoon' | 'today-evening' | 'tomorrow-morning' | 'tomorrow-evening' | string
  visibility: 'everyone' | 'club-only'
}

export type User = {
  id: string
  name: string
  avatar?: string
  role: 'runner' | 'leader'
  location: string
  paceRange: string
  goals: string[]
  distances: string[]
  training: string | null
  destinationRuns: string[]
  clubIds: string[]
  readyStatus: ReadyStatus | null
  bio?: string
}

export type RunClub = {
  id: string
  name: string
  location: string
  description: string
  schedule: string[]
  leaderId: string
  memberIds: string[]
  pace: string
  memberCount: number
}

export type RunEvent = {
  id: string
  clubId: string
  title: string
  datetime: string
  location: string
  routeNotes: string
  paceGroups: string[]
  distanceOptions: string[]
  rsvpList: { userId: string; status: 'going' | 'maybe' | 'not-going' }[]
}

export type Announcement = {
  id: string
  clubId: string
  title: string
  body: string
  pinned: boolean
  createdAt: string
}

export type ConnectionRequest = {
  id: string
  fromUserId: string
  toUserId: string
  status: 'pending' | 'accepted' | 'declined'
}

// ─── Mock Users (10 runners) ────────────────────────────────────────────────

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alex Rivera',
    role: 'runner',
    location: 'Upper West Side, NY',
    paceRange: '8:30–9:00 /mi',
    goals: ['fitness', 'social'],
    distances: ['3–5 mi', '6–8 mi'],
    training: null,
    destinationRuns: ['Central Park loop'],
    clubIds: ['c1'],
    readyStatus: { timeWindow: 'now', visibility: 'everyone' },
    bio: 'Love early morning runs through Central Park. Always up for post-run coffee!',
  },
  {
    id: 'u2',
    name: 'Jordan Kim',
    role: 'runner',
    location: 'Brooklyn Heights, NY',
    paceRange: '7:45–8:15 /mi',
    goals: ['race training', 'long-run'],
    distances: ['6–8 mi', '9–12 mi'],
    training: 'Half Marathon',
    destinationRuns: ['Brooklyn Bridge loop'],
    clubIds: ['c2'],
    readyStatus: { timeWindow: 'today-evening', visibility: 'everyone' },
    bio: 'Training for my 3rd half marathon. Looking for consistent training partners.',
  },
  {
    id: 'u3',
    name: 'Sam Patel',
    role: 'runner',
    location: 'Midtown, NY',
    paceRange: '10:00–11:00 /mi',
    goals: ['fitness', 'social'],
    distances: ['3–5 mi'],
    training: null,
    destinationRuns: ['Central Park', 'High Line'],
    clubIds: ['c1', 'c3'],
    readyStatus: null,
    bio: 'Casual runner, 2 years in. Running keeps me sane during busy work weeks.',
  },
  {
    id: 'u4',
    name: 'Morgan Lee',
    role: 'runner',
    location: 'Harlem, NY',
    paceRange: '8:00–8:30 /mi',
    goals: ['race training', 'fitness'],
    distances: ['6–8 mi', '9–12 mi'],
    training: 'Marathon',
    destinationRuns: ['Harlem River path', 'Central Park'],
    clubIds: ['c2'],
    readyStatus: { timeWindow: 'tomorrow-morning', visibility: 'club-only' },
    bio: 'NYC Marathon 2025 prep. Chasing a sub-3:30 finish.',
  },
  {
    id: 'u5',
    name: 'Casey Wang',
    role: 'runner',
    location: 'East Village, NY',
    paceRange: '9:00–9:30 /mi',
    goals: ['social', 'fitness'],
    distances: ['3–5 mi'],
    training: '5K',
    destinationRuns: ['East River path'],
    clubIds: ['c3'],
    readyStatus: { timeWindow: 'today-afternoon', visibility: 'everyone' },
    bio: 'New to running this year. Love discovering new NYC routes!',
  },
  {
    id: 'u6',
    name: 'Taylor Gomez',
    role: 'runner',
    location: 'Williamsburg, Brooklyn',
    paceRange: '7:00–7:30 /mi',
    goals: ['race training', 'long-run'],
    distances: ['9–12 mi', '12+ mi'],
    training: 'Marathon',
    destinationRuns: ['Prospect Park', 'Brooklyn Bridge'],
    clubIds: ['c2'],
    readyStatus: { timeWindow: 'today-morning', visibility: 'everyone' },
    bio: 'Competitive runner with 5 marathons under my belt. Love tempo runs.',
  },
  {
    id: 'u7',
    name: 'Riley Chen',
    role: 'runner',
    location: 'Chelsea, NY',
    paceRange: '9:30–10:30 /mi',
    goals: ['fitness', 'social'],
    distances: ['3–5 mi', '6–8 mi'],
    training: '10K',
    destinationRuns: ['High Line', 'Hudson River path'],
    clubIds: ['c1'],
    readyStatus: null,
    bio: 'Running my first 10K this fall. Looking for encouragement!',
  },
  {
    id: 'u8',
    name: 'Drew Martinez',
    role: 'runner',
    location: 'Astoria, Queens',
    paceRange: '8:15–8:45 /mi',
    goals: ['race training', 'social'],
    distances: ['6–8 mi'],
    training: 'Half Marathon',
    destinationRuns: ['Astoria Park', 'East River'],
    clubIds: ['c3'],
    readyStatus: { timeWindow: 'now', visibility: 'everyone' },
    bio: 'Weekend warrior. Sunday long runs are my religion.',
  },
  {
    id: 'u9',
    name: 'Avery Thompson',
    role: 'runner',
    location: 'Park Slope, Brooklyn',
    paceRange: '9:45–10:15 /mi',
    goals: ['fitness', 'long-run'],
    distances: ['6–8 mi', '9–12 mi'],
    training: null,
    destinationRuns: ['Prospect Park'],
    clubIds: ['c2', 'c3'],
    readyStatus: { timeWindow: 'tomorrow-evening', visibility: 'club-only' },
    bio: 'Dog parent + runner. Prospect Park is my backyard track.',
  },
  {
    id: 'u10',
    name: 'Quinn Davis',
    role: 'runner',
    location: 'Bronx, NY',
    paceRange: '10:30–11:30 /mi',
    goals: ['fitness'],
    distances: ['3–5 mi'],
    training: '5K',
    destinationRuns: ['Van Cortlandt Park'],
    clubIds: [],
    readyStatus: null,
    bio: 'Just getting started on this running journey. Every mile counts!',
  },
]

// ─── Current User (logged-in runner) ────────────────────────────────────────

export const CURRENT_RUNNER: User = {
  id: 'me-runner',
  name: 'Jamie Okonkwo',
  role: 'runner',
  location: 'Upper East Side, NY',
  paceRange: '8:45–9:15 /mi',
  goals: ['fitness', 'social', 'race training'],
  distances: ['6–8 mi'],
  training: 'Half Marathon',
  destinationRuns: ['Central Park reservoir loop'],
  clubIds: ['c1'],
  readyStatus: null,
  bio: 'Software engineer by day, runner by early morning. NYC running scene is the best!',
}

export const CURRENT_LEADER: User = {
  id: 'me-leader',
  name: 'Sam Torres',
  role: 'leader',
  location: 'Brooklyn, NY',
  paceRange: '8:00–9:00 /mi',
  goals: ['fitness', 'social', 'community'],
  distances: ['6–8 mi', '9–12 mi'],
  training: null,
  destinationRuns: ['Prospect Park'],
  clubIds: ['c2'],
  readyStatus: null,
  bio: 'Run club leader for 3 years. I believe running is better together.',
}

// ─── Mock Run Clubs (3) ──────────────────────────────────────────────────────

export const MOCK_CLUBS: RunClub[] = [
  {
    id: 'c1',
    name: 'Downtown Dashers',
    location: 'Central Park, New York',
    description: 'Friendly community runners of all levels. We celebrate every milestone together.',
    schedule: ['Monday 6:30 AM', 'Wednesday 6:30 AM', 'Saturday 8:00 AM'],
    leaderId: 'me-leader',
    memberIds: ['u1', 'u3', 'u7', 'me-runner'],
    pace: '8:30–10:00 /mi',
    memberCount: 142,
  },
  {
    id: 'c2',
    name: 'Brooklyn Bridge Runners',
    location: 'Brooklyn Bridge Park, New York',
    description: 'Competitive and social run group. Half marathon and marathon training focus.',
    schedule: ['Tuesday 6:00 AM', 'Thursday 6:00 AM', 'Sunday 7:30 AM'],
    leaderId: 'me-leader',
    memberIds: ['u2', 'u4', 'u6', 'u9', 'me-runner'],
    pace: '7:45–9:00 /mi',
    memberCount: 210,
  },
  {
    id: 'c3',
    name: 'East River Run Crew',
    location: 'East River Esplanade, New York',
    description: 'Casual, welcoming run crew for beginners to intermediates. No runner left behind!',
    schedule: ['Wednesday 7:00 PM', 'Sunday 9:00 AM'],
    leaderId: 'u3',
    memberIds: ['u3', 'u5', 'u8', 'u9'],
    pace: '9:00–11:00 /mi',
    memberCount: 87,
  },
]

// ─── Mock Run Events ─────────────────────────────────────────────────────────

export const MOCK_EVENTS: RunEvent[] = [
  {
    id: 'e1',
    clubId: 'c2',
    title: 'Saturday Long Run – Brooklyn Bridge Loop',
    datetime: '2026-03-14T08:00:00',
    location: 'Brooklyn Bridge Park, Pier 1',
    routeNotes: 'Start at Pier 1, cross Brooklyn Bridge, loop through DUMBO, return via Manhattan Bridge. Approx 10 miles total.',
    paceGroups: ['7:30–8:00 /mi', '8:00–8:30 /mi', '8:30–9:00 /mi'],
    distanceOptions: ['6 mi', '8 mi', '10 mi'],
    rsvpList: [
      { userId: 'u2', status: 'going' },
      { userId: 'u4', status: 'going' },
      { userId: 'u6', status: 'going' },
      { userId: 'u9', status: 'maybe' },
      { userId: 'me-runner', status: 'going' },
    ],
  },
  {
    id: 'e2',
    clubId: 'c2',
    title: 'Tuesday Track Workout',
    datetime: '2026-03-17T06:00:00',
    location: 'McCarren Park Track, Williamsburg',
    routeNotes: 'Warm-up 1 mile, 6×800m at 5K pace, cool-down 1 mile. Bring spikes or flats if you have them.',
    paceGroups: ['Sub 7:00 /mi', '7:00–7:30 /mi', '7:30–8:00 /mi'],
    distanceOptions: ['4 mi (w/ intervals)'],
    rsvpList: [
      { userId: 'u2', status: 'going' },
      { userId: 'u6', status: 'going' },
      { userId: 'u4', status: 'maybe' },
    ],
  },
  {
    id: 'e3',
    clubId: 'c1',
    title: 'Wednesday Morning Run – Central Park',
    datetime: '2026-03-18T06:30:00',
    location: 'Central Park, Engineer\'s Gate (90th & 5th)',
    routeNotes: 'Classic inner loop (6 miles) at conversational pace. Stop at the boathouse halfway for water.',
    paceGroups: ['8:30–9:00 /mi', '9:00–9:30 /mi', '9:30–10:30 /mi'],
    distanceOptions: ['4 mi', '6 mi'],
    rsvpList: [
      { userId: 'u1', status: 'going' },
      { userId: 'u3', status: 'going' },
      { userId: 'u7', status: 'maybe' },
      { userId: 'me-runner', status: 'going' },
    ],
  },
  {
    id: 'e4',
    clubId: 'c2',
    title: 'Sunday Easy Long Run',
    datetime: '2026-03-22T07:30:00',
    location: 'Prospect Park, Grand Army Plaza',
    routeNotes: 'Easy effort long run around Prospect Park. Multiple loops depending on distance goal. Water stops at 3 and 6 miles.',
    paceGroups: ['8:00–8:30 /mi', '8:30–9:30 /mi'],
    distanceOptions: ['8 mi', '10 mi', '12 mi', '14 mi'],
    rsvpList: [
      { userId: 'u2', status: 'going' },
      { userId: 'u4', status: 'going' },
      { userId: 'u6', status: 'going' },
      { userId: 'u9', status: 'going' },
    ],
  },
]

// ─── Mock Announcements ───────────────────────────────────────────────────────

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    clubId: 'c2',
    title: '🏃 NYC Half Marathon Team Registration Open',
    body: 'We have 10 guaranteed entries for the NYC Half Marathon on March 19th! Priority goes to members who have attended 5+ runs this year. Reply here or DM Sam to claim your spot. Registration closes Friday.',
    pinned: true,
    createdAt: '2026-03-10T09:00:00',
  },
  {
    id: 'a2',
    clubId: 'c2',
    title: 'Route Change for Tuesday Track',
    body: 'Due to a track meet at McCarren Park, we\'re moving Tuesday\'s workout to Williamsburg Bridge back/forth intervals. Same start time (6 AM), meet at the base of the bridge on the Brooklyn side.',
    pinned: false,
    createdAt: '2026-03-11T14:30:00',
  },
  {
    id: 'a3',
    clubId: 'c2',
    title: 'New Pace Groups Starting Next Month',
    body: 'Based on your feedback, we\'re adding a 9:00–9:30 /mi pace group starting April 1st. All current members are welcome to switch groups — just let me know at the next run!',
    pinned: false,
    createdAt: '2026-03-08T10:00:00',
  },
  {
    id: 'a4',
    clubId: 'c1',
    title: '☀️ Saturday Run Changed to 8:30 AM',
    body: 'To avoid the expected morning rain, Saturday\'s run is pushed to 8:30 AM. We\'ll still meet at Engineer\'s Gate. Check the weather — it should clear by then!',
    pinned: true,
    createdAt: '2026-03-12T07:00:00',
  },
]

// ─── Mock Connection Requests ────────────────────────────────────────────────

export const MOCK_REQUESTS: ConnectionRequest[] = [
  { id: 'r1', fromUserId: 'u2', toUserId: 'me-runner', status: 'pending' },
  { id: 'r2', fromUserId: 'u6', toUserId: 'me-runner', status: 'pending' },
  { id: 'r3', fromUserId: 'u1', toUserId: 'me-runner', status: 'accepted' },
  { id: 'r4', fromUserId: 'u8', toUserId: 'me-runner', status: 'accepted' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getUserById(id: string): User | undefined {
  return [...MOCK_USERS, CURRENT_RUNNER, CURRENT_LEADER].find((u) => u.id === id)
}

export function getClubById(id: string): RunClub | undefined {
  return MOCK_CLUBS.find((c) => c.id === id)
}

export function getClubEvents(clubId: string): RunEvent[] {
  return MOCK_EVENTS.filter((e) => e.clubId === clubId)
}

export function getClubAnnouncements(clubId: string): Announcement[] {
  return MOCK_ANNOUNCEMENTS.filter((a) => a.clubId === clubId)
}

export function getReadyRunners(): User[] {
  return MOCK_USERS.filter((u) => u.readyStatus !== null)
}

export function formatDateTime(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function readyStatusLabel(status: ReadyStatus): string {
  const labels: Record<string, string> = {
    'now': 'Ready now',
    'today-morning': 'Today morning',
    'today-afternoon': 'Today afternoon',
    'today-evening': 'Today 6–8 PM',
    'tomorrow-morning': 'Tomorrow AM',
    'tomorrow-evening': 'Tomorrow PM',
  }
  return labels[status.timeWindow] ?? status.timeWindow
}

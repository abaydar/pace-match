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
  distanceAway?: number // computed client-side (miles)
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

export interface RunFilters {
  paceBucket: PaceBucket | null
  distance: Distance | null
  trainingType: TrainingType | null
  genderPreference: GenderPreference
  radiusMiles: number
}

export const DEFAULT_FILTERS: RunFilters = {
  paceBucket: null,
  distance: null,
  trainingType: null,
  genderPreference: 'Any',
  radiusMiles: 5,
}

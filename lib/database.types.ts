// ─── Flat aliases used throughout the app ────────────────────────────────────
export type Role = "runner" | "leader";
export type ReadyStatusVisibility = "everyone" | "club_members";
export type RsvpStatus = "going" | "maybe" | "not_going";
export type ConnectionStatus = "pending" | "accepted" | "declined";
export type TrainingType = "5k" | "10k" | "half" | "marathon";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_id: string;
          name: string;
          avatar_url: string | null;
          role: Role;
          location: string | null;
          pace_min: number | null;
          pace_max: number | null;
          goals: string[];
          distance_min: number | null;
          distance_max: number | null;
          training_type: TrainingType | null;
          destination_runs: string[];
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      ready_status: {
        Row: {
          id: string;
          user_id: string;
          time_window_start: string | null;
          time_window_end: string | null;
          visibility: ReadyStatusVisibility;
          expires_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ready_status"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ready_status"]["Insert"]>;
      };
      run_clubs: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          location: string | null;
          leader_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["run_clubs"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["run_clubs"]["Insert"]>;
      };
      club_members: {
        Row: {
          club_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["club_members"]["Row"], "joined_at"> & {
          joined_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["club_members"]["Insert"]>;
      };
      run_events: {
        Row: {
          id: string;
          club_id: string;
          title: string;
          datetime: string;
          location: string | null;
          route_notes: string | null;
          pace_groups: { label: string; pace: string }[];
          distance_options: number[];
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["run_events"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["run_events"]["Insert"]>;
      };
      rsvps: {
        Row: {
          event_id: string;
          user_id: string;
          status: RsvpStatus;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["rsvps"]["Row"], "updated_at"> & {
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["rsvps"]["Insert"]>;
      };
      announcements: {
        Row: {
          id: string;
          club_id: string;
          title: string;
          body: string;
          pinned: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["announcements"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["announcements"]["Insert"]>;
      };
      connection_requests: {
        Row: {
          id: string;
          from_user_id: string;
          to_user_id: string;
          status: ConnectionStatus;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["connection_requests"]["Row"],
          "id" | "status" | "created_at"
        > & {
          id?: string;
          status?: ConnectionStatus;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["connection_requests"]["Insert"]>;
      };
      messages: {
        Row: {
          id: string;
          connection_id: string;
          sender_id: string;
          body: string;
          sent_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["messages"]["Row"], "id" | "sent_at"> & {
          id?: string;
          sent_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
      push_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["push_tokens"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["push_tokens"]["Insert"]>;
      };
    };
  };
}

// ─── Flat row type aliases ────────────────────────────────────────────────────
export type UserRow = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export type ReadyStatusRow = Database["public"]["Tables"]["ready_status"]["Row"];
export type ReadyStatusInsert = Database["public"]["Tables"]["ready_status"]["Insert"];

export type ClubRow = Database["public"]["Tables"]["run_clubs"]["Row"];
export type ClubInsert = Database["public"]["Tables"]["run_clubs"]["Insert"];

export type EventRow = Database["public"]["Tables"]["run_events"]["Row"];
export type EventInsert = Database["public"]["Tables"]["run_events"]["Insert"];

export type AnnouncementRow = Database["public"]["Tables"]["announcements"]["Row"];
export type AnnouncementInsert = Database["public"]["Tables"]["announcements"]["Insert"];

export type ConnectionRow = Database["public"]["Tables"]["connection_requests"]["Row"];
export type ConnectionInsert = Database["public"]["Tables"]["connection_requests"]["Insert"];

export type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];

export type RsvpRow = Database["public"]["Tables"]["rsvps"]["Row"];

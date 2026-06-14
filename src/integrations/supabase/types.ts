export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      adaptation_log: {
        Row: {
          action_taken: string | null
          created_at: string | null
          id: string
          new_difficulty: string | null
          old_difficulty: string | null
          trigger_type: string | null
          user_id: string | null
        }
        Insert: {
          action_taken?: string | null
          created_at?: string | null
          id?: string
          new_difficulty?: string | null
          old_difficulty?: string | null
          trigger_type?: string | null
          user_id?: string | null
        }
        Update: {
          action_taken?: string | null
          created_at?: string | null
          id?: string
          new_difficulty?: string | null
          old_difficulty?: string | null
          trigger_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "adaptation_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      doubts: {
        Row: {
          created_at: string | null
          doubt_text: string | null
          hints_needed: number | null
          id: string
          image_url: string | null
          resolution_path: string | null
          resolved: boolean | null
          session_id: string | null
          subject_id: string | null
          topic: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          doubt_text?: string | null
          hints_needed?: number | null
          id?: string
          image_url?: string | null
          resolution_path?: string | null
          resolved?: boolean | null
          session_id?: string | null
          subject_id?: string | null
          topic?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          doubt_text?: string | null
          hints_needed?: number | null
          id?: string
          image_url?: string | null
          resolution_path?: string | null
          resolved?: boolean | null
          session_id?: string | null
          subject_id?: string | null
          topic?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doubts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doubts_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doubts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string | null
          exam_date: string | null
          exam_year: number | null
          goal_name: string | null
          goal_type: string | null
          id: string
          priority: number | null
          status: string | null
          triage_mode: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          exam_date?: string | null
          exam_year?: number | null
          goal_name?: string | null
          goal_type?: string | null
          id?: string
          priority?: number | null
          status?: string | null
          triage_mode?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          exam_date?: string | null
          exam_year?: number | null
          goal_name?: string | null
          goal_type?: string | null
          id?: string
          priority?: number | null
          status?: string | null
          triage_mode?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_log: {
        Row: {
          created_at: string | null
          id: string
          mood: string | null
          user_id: string | null
          week_of: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mood?: string | null
          user_id?: string | null
          week_of?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mood?: string | null
          user_id?: string | null
          week_of?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mood_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          chapter_id: string | null
          content: string | null
          created_at: string | null
          id: string
          image_url: string | null
          note_type: string | null
          subject_id: string | null
          topic: string | null
          user_id: string | null
        }
        Insert: {
          chapter_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          note_type?: string | null
          subject_id?: string | null
          topic?: string | null
          user_id?: string | null
        }
        Update: {
          chapter_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          note_type?: string | null
          subject_id?: string | null
          topic?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "syllabus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pomodoro_rooms: {
        Row: {
          break_minutes: number | null
          created_at: string | null
          host_user_id: string | null
          id: string
          members: Json | null
          phase: string | null
          phase_started_at: string | null
          room_code: string | null
          work_minutes: number | null
        }
        Insert: {
          break_minutes?: number | null
          created_at?: string | null
          host_user_id?: string | null
          id?: string
          members?: Json | null
          phase?: string | null
          phase_started_at?: string | null
          room_code?: string | null
          work_minutes?: number | null
        }
        Update: {
          break_minutes?: number | null
          created_at?: string | null
          host_user_id?: string | null
          id?: string
          members?: Json | null
          phase?: string | null
          phase_started_at?: string | null
          room_code?: string | null
          work_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pomodoro_rooms_host_user_id_fkey"
            columns: ["host_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          college_year: number | null
          created_at: string | null
          degree: string | null
          grade: number | null
          guardian_mode: boolean | null
          id: string
          language_preference: string | null
          mood_checkin_enabled: boolean | null
          parent_contact: string | null
          peak_hours: string[] | null
          study_buddy_mode: boolean | null
          theme_preference: string | null
          user_type: string | null
          voice_input_enabled: boolean | null
        }
        Insert: {
          college_year?: number | null
          created_at?: string | null
          degree?: string | null
          grade?: number | null
          guardian_mode?: boolean | null
          id: string
          language_preference?: string | null
          mood_checkin_enabled?: boolean | null
          parent_contact?: string | null
          peak_hours?: string[] | null
          study_buddy_mode?: boolean | null
          theme_preference?: string | null
          user_type?: string | null
          voice_input_enabled?: boolean | null
        }
        Update: {
          college_year?: number | null
          created_at?: string | null
          degree?: string | null
          grade?: number | null
          guardian_mode?: boolean | null
          id?: string
          language_preference?: string | null
          mood_checkin_enabled?: boolean | null
          parent_contact?: string | null
          peak_hours?: string[] | null
          study_buddy_mode?: boolean | null
          theme_preference?: string | null
          user_type?: string | null
          voice_input_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      readiness: {
        Row: {
          goal_id: string | null
          id: string
          last_updated: string | null
          predicted_score_max: number | null
          predicted_score_min: number | null
          readiness_score: number | null
          user_id: string | null
          weak_subjects: string[] | null
          weak_topics: string[] | null
        }
        Insert: {
          goal_id?: string | null
          id?: string
          last_updated?: string | null
          predicted_score_max?: number | null
          predicted_score_min?: number | null
          readiness_score?: number | null
          user_id?: string | null
          weak_subjects?: string[] | null
          weak_topics?: string[] | null
        }
        Update: {
          goal_id?: string | null
          id?: string
          last_updated?: string | null
          predicted_score_max?: number | null
          predicted_score_min?: number | null
          readiness_score?: number | null
          user_id?: string | null
          weak_subjects?: string[] | null
          weak_topics?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "readiness_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "readiness_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      scores: {
        Row: {
          created_at: string | null
          date_taken: string | null
          goal_id: string | null
          id: string
          max_value: number | null
          percentage: number | null
          score_type: string | null
          score_value: number | null
          subject_id: string | null
          topics_covered: string[] | null
          user_id: string | null
          weak_topics: string[] | null
        }
        Insert: {
          created_at?: string | null
          date_taken?: string | null
          goal_id?: string | null
          id?: string
          max_value?: number | null
          percentage?: number | null
          score_type?: string | null
          score_value?: number | null
          subject_id?: string | null
          topics_covered?: string[] | null
          user_id?: string | null
          weak_topics?: string[] | null
        }
        Update: {
          created_at?: string | null
          date_taken?: string | null
          goal_id?: string | null
          id?: string
          max_value?: number | null
          percentage?: number | null
          score_type?: string | null
          score_value?: number | null
          subject_id?: string | null
          topics_covered?: string[] | null
          user_id?: string | null
          weak_topics?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "scores_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scores_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          actual_minutes: number | null
          completion_status: string | null
          created_at: string | null
          difficulty_handled: string | null
          doubts_raised: number | null
          ended_at: string | null
          goal_id: string | null
          id: string
          image_doubts: number | null
          plan_id: string | null
          problems_attempted: number | null
          problems_correct: number | null
          score_percentage: number | null
          started_at: string | null
          subject_id: string | null
          topic: string | null
          user_id: string | null
        }
        Insert: {
          actual_minutes?: number | null
          completion_status?: string | null
          created_at?: string | null
          difficulty_handled?: string | null
          doubts_raised?: number | null
          ended_at?: string | null
          goal_id?: string | null
          id?: string
          image_doubts?: number | null
          plan_id?: string | null
          problems_attempted?: number | null
          problems_correct?: number | null
          score_percentage?: number | null
          started_at?: string | null
          subject_id?: string | null
          topic?: string | null
          user_id?: string | null
        }
        Update: {
          actual_minutes?: number | null
          completion_status?: string | null
          created_at?: string | null
          difficulty_handled?: string | null
          doubts_raised?: number | null
          ended_at?: string | null
          goal_id?: string | null
          id?: string
          image_doubts?: number | null
          plan_id?: string | null
          problems_attempted?: number | null
          problems_correct?: number | null
          score_percentage?: number | null
          started_at?: string | null
          subject_id?: string | null
          topic?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "study_plan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plan: {
        Row: {
          chapter_id: string | null
          created_at: string | null
          difficulty: string | null
          estimated_minutes: number | null
          goal_id: string | null
          id: string
          pomodoro_break_minutes: number | null
          pomodoro_work_minutes: number | null
          scheduled_date: string | null
          scheduled_end_time: string | null
          scheduled_start_time: string | null
          status: string | null
          subject_id: string | null
          task_type: string | null
          topic: string | null
          user_id: string | null
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string | null
          difficulty?: string | null
          estimated_minutes?: number | null
          goal_id?: string | null
          id?: string
          pomodoro_break_minutes?: number | null
          pomodoro_work_minutes?: number | null
          scheduled_date?: string | null
          scheduled_end_time?: string | null
          scheduled_start_time?: string | null
          status?: string | null
          subject_id?: string | null
          task_type?: string | null
          topic?: string | null
          user_id?: string | null
        }
        Update: {
          chapter_id?: string | null
          created_at?: string | null
          difficulty?: string | null
          estimated_minutes?: number | null
          goal_id?: string | null
          id?: string
          pomodoro_break_minutes?: number | null
          pomodoro_work_minutes?: number | null
          scheduled_date?: string | null
          scheduled_end_time?: string | null
          scheduled_start_time?: string | null
          status?: string | null
          subject_id?: string | null
          task_type?: string | null
          topic?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_plan_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "syllabus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_plan_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_plan_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_plan_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          ai_assessed_level: string | null
          created_at: string | null
          current_level: string | null
          goal_id: string | null
          id: string
          subject_name: string | null
          user_id: string | null
        }
        Insert: {
          ai_assessed_level?: string | null
          created_at?: string | null
          current_level?: string | null
          goal_id?: string | null
          id?: string
          subject_name?: string | null
          user_id?: string | null
        }
        Update: {
          ai_assessed_level?: string | null
          created_at?: string | null
          current_level?: string | null
          goal_id?: string | null
          id?: string
          subject_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subjects_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subjects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      syllabus: {
        Row: {
          chapter_name: string | null
          chapter_number: number | null
          completed_at: string | null
          created_at: string | null
          goal_id: string | null
          id: string
          is_completed: boolean | null
          is_skipped: boolean | null
          source: string | null
          subject_id: string | null
          topics: string[] | null
          user_id: string | null
          weightage: string | null
        }
        Insert: {
          chapter_name?: string | null
          chapter_number?: number | null
          completed_at?: string | null
          created_at?: string | null
          goal_id?: string | null
          id?: string
          is_completed?: boolean | null
          is_skipped?: boolean | null
          source?: string | null
          subject_id?: string | null
          topics?: string[] | null
          user_id?: string | null
          weightage?: string | null
        }
        Update: {
          chapter_name?: string | null
          chapter_number?: number | null
          completed_at?: string | null
          created_at?: string | null
          goal_id?: string | null
          id?: string
          is_completed?: boolean | null
          is_skipped?: boolean | null
          source?: string | null
          subject_id?: string | null
          topics?: string[] | null
          user_id?: string | null
          weightage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "syllabus_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syllabus_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syllabus_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          onboarding_complete: boolean | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          onboarding_complete?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          onboarding_complete?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

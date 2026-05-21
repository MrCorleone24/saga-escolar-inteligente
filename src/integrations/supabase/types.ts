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
      ai_pedagogical_content: {
        Row: {
          bncc_codes: string[] | null
          class_id: string | null
          content: string
          content_type: string
          created_at: string
          id: string
          learning_method: string | null
          student_id: string | null
          teacher_id: string
          title: string
        }
        Insert: {
          bncc_codes?: string[] | null
          class_id?: string | null
          content: string
          content_type: string
          created_at?: string
          id?: string
          learning_method?: string | null
          student_id?: string | null
          teacher_id: string
          title: string
        }
        Update: {
          bncc_codes?: string[] | null
          class_id?: string | null
          content?: string
          content_type?: string
          created_at?: string
          id?: string
          learning_method?: string | null
          student_id?: string | null
          teacher_id?: string
          title?: string
        }
        Relationships: []
      }
      classroom_moderation: {
        Row: {
          can_audio: boolean | null
          can_chat: boolean | null
          can_video: boolean | null
          created_at: string
          id: string
          is_muted: boolean | null
          role: string
          room_id: string
          user_id: string
        }
        Insert: {
          can_audio?: boolean | null
          can_chat?: boolean | null
          can_video?: boolean | null
          created_at?: string
          id?: string
          is_muted?: boolean | null
          role?: string
          room_id: string
          user_id: string
        }
        Update: {
          can_audio?: boolean | null
          can_chat?: boolean | null
          can_video?: boolean | null
          created_at?: string
          id?: string
          is_muted?: boolean | null
          role?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_moderation_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_versions: {
        Row: {
          date: string
          entry_id: string | null
          grade: string | null
          id: string
          note: string | null
          status: string
        }
        Insert: {
          date?: string
          entry_id?: string | null
          grade?: string | null
          id?: string
          note?: string | null
          status: string
        }
        Update: {
          date?: string
          entry_id?: string | null
          grade?: string | null
          id?: string
          note?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_versions_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "notebook_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          created_at: string
          date: string
          duration: string | null
          id: string
          status: string | null
          subject_id: string | null
          teacher_id: string | null
          title: string
          type: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          date: string
          duration?: string | null
          id?: string
          status?: string | null
          subject_id?: string | null
          teacher_id?: string | null
          title: string
          type: string
        }
        Update: {
          content?: string | null
          created_at?: string
          date?: string
          duration?: string | null
          id?: string
          status?: string | null
          subject_id?: string | null
          teacher_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notebook_entries: {
        Row: {
          confirmed_at: string | null
          content: string | null
          created_at: string
          date: string | null
          file_urls: string[] | null
          grade: string | null
          id: string
          lesson_id: string | null
          photo_url: string | null
          status: string | null
          student_id: string
          subject_id: string | null
          teacher_note: string | null
          title: string
          updated_at: string
        }
        Insert: {
          confirmed_at?: string | null
          content?: string | null
          created_at?: string
          date?: string | null
          file_urls?: string[] | null
          grade?: string | null
          id?: string
          lesson_id?: string | null
          photo_url?: string | null
          status?: string | null
          student_id: string
          subject_id?: string | null
          teacher_note?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          confirmed_at?: string | null
          content?: string | null
          created_at?: string
          date?: string | null
          file_urls?: string[] | null
          grade?: string | null
          id?: string
          lesson_id?: string | null
          photo_url?: string | null
          status?: string | null
          student_id?: string
          subject_id?: string | null
          teacher_note?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notebook_entries_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notebook_entries_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notebook_entries_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          max_students: number | null
          max_teachers: number | null
          name: string
          price_monthly: number
          role_type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          max_students?: number | null
          max_teachers?: number | null
          name: string
          price_monthly: number
          role_type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          max_students?: number | null
          max_teachers?: number | null
          name?: string
          price_monthly?: number
          role_type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          interests: string[] | null
          learning_pace: string | null
          learning_style: string | null
          level: number | null
          max_students: number | null
          max_teachers: number | null
          parent_id: string | null
          plan_type: string | null
          role: string
          school_name: string | null
          subscription_status: string | null
          updated_at: string
          xp: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          interests?: string[] | null
          learning_pace?: string | null
          learning_style?: string | null
          level?: number | null
          max_students?: number | null
          max_teachers?: number | null
          parent_id?: string | null
          plan_type?: string | null
          role: string
          school_name?: string | null
          subscription_status?: string | null
          updated_at?: string
          xp?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          interests?: string[] | null
          learning_pace?: string | null
          learning_style?: string | null
          level?: number | null
          max_students?: number | null
          max_teachers?: number | null
          parent_id?: string | null
          plan_type?: string | null
          role?: string
          school_name?: string | null
          subscription_status?: string | null
          updated_at?: string
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      room_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          room_id: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          room_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          room_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          status: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          status?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          color: string
          created_at: string
          emoji: string
          id: string
          name: string
        }
        Insert: {
          color: string
          created_at?: string
          emoji: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          emoji?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      whiteboard_sessions: {
        Row: {
          created_at: string
          id: string
          room_id: string | null
          teacher_id: string
          thumbnail_url: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          room_id?: string | null
          teacher_id: string
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          room_id?: string | null
          teacher_id?: string
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whiteboard_sessions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      whiteboard_strokes: {
        Row: {
          created_at: string
          id: string
          session_id: string
          stroke_data: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_id: string
          stroke_data: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string
          stroke_data?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whiteboard_strokes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "whiteboard_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "admin" | "school" | "teacher" | "student"
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
    Enums: {
      user_role: ["admin", "school", "teacher", "student"],
    },
  },
} as const

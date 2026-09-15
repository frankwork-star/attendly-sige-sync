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
      attendance: {
        Row: {
          attendance_date: string
          course_id: string | null
          created_at: string
          id: string
          note: string | null
          status: string
          student_id: string
        }
        Insert: {
          attendance_date: string
          course_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          status?: string
          student_id: string
        }
        Update: {
          attendance_date?: string
          course_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          id: string
          level: string
          name: string
          teacher_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          level: string
          name: string
          teacher_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          level?: string
          name?: string
          teacher_name?: string | null
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string | null
          relationship: string | null
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          relationship?: string | null
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          relationship?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      guardians: {
        Row: {
          address: string | null
          apellido_materno: string | null
          apellido_paterno: string | null
          comuna: string | null
          created_at: string
          email: string | null
          id: string
          list_number: number | null
          nombres: string | null
          observations: string | null
          phone: string | null
          student_id: string
        }
        Insert: {
          address?: string | null
          apellido_materno?: string | null
          apellido_paterno?: string | null
          comuna?: string | null
          created_at?: string
          email?: string | null
          id?: string
          list_number?: number | null
          nombres?: string | null
          observations?: string | null
          phone?: string | null
          student_id: string
        }
        Update: {
          address?: string | null
          apellido_materno?: string | null
          apellido_paterno?: string | null
          comuna?: string | null
          created_at?: string
          email?: string | null
          id?: string
          list_number?: number | null
          nombres?: string | null
          observations?: string | null
          phone?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardians_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      health_allergies: {
        Row: {
          created_at: string
          id: string
          name: string
          severity: string | null
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          severity?: string | null
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          severity?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_allergies_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      health_conditions: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_conditions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      health_records: {
        Row: {
          blood_type: string | null
          id: string
          notes: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          blood_type?: string | null
          id?: string
          notes?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          blood_type?: string | null
          id?: string
          notes?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_movements: {
        Row: {
          created_at: string
          id: string
          movement_date: string
          movement_type: string
          observations: string | null
          reason: string | null
          responsible: string | null
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          movement_date?: string
          movement_type: string
          observations?: string | null
          reason?: string | null
          responsible?: string | null
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          movement_date?: string
          movement_type?: string
          observations?: string | null
          reason?: string | null
          responsible?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_movements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          active: boolean
          address: string | null
          apellido_materno: string | null
          apellido_paterno: string
          birth_date: string | null
          comuna: string | null
          course_id: string | null
          created_at: string
          enrollment_number: string | null
          guardian_interview: string | null
          id: string
          level: string
          list_number: number | null
          nee_full_support: boolean
          nombres: string
          run_ipe: string | null
          sex: string | null
          speech_test_name: string | null
          speech_test_url: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          apellido_materno?: string | null
          apellido_paterno: string
          birth_date?: string | null
          comuna?: string | null
          course_id?: string | null
          created_at?: string
          enrollment_number?: string | null
          guardian_interview?: string | null
          id?: string
          level?: string
          list_number?: number | null
          nee_full_support?: boolean
          nombres: string
          run_ipe?: string | null
          sex?: string | null
          speech_test_name?: string | null
          speech_test_url?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          apellido_materno?: string | null
          apellido_paterno?: string
          birth_date?: string | null
          comuna?: string | null
          course_id?: string | null
          created_at?: string
          enrollment_number?: string | null
          guardian_interview?: string | null
          id?: string
          level?: string
          list_number?: number | null
          nee_full_support?: boolean
          nombres?: string
          run_ipe?: string | null
          sex?: string | null
          speech_test_name?: string | null
          speech_test_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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

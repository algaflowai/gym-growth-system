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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      access_passwords: {
        Row: {
          created_at: string
          id: string
          page_name: string
          password_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_name: string
          password_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          page_name?: string
          password_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      enrollment_dependents: {
        Row: {
          created_at: string
          dependent_price: number
          dependent_student_id: string
          enrollment_id: string
          id: string
          student_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dependent_price: number
          dependent_student_id: string
          enrollment_id: string
          id?: string
          student_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dependent_price?: number
          dependent_student_id?: string
          enrollment_id?: string
          id?: string
          student_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_dependents_dependent_student_id_fkey"
            columns: ["dependent_student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_dependents_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_dependents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollment_history: {
        Row: {
          archived_at: string
          created_at: string
          end_date: string
          enrollment_id: string
          id: string
          plan_id: string
          plan_name: string
          plan_price: number
          start_date: string
          status: string
          student_id: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string
          created_at?: string
          end_date: string
          enrollment_id: string
          id?: string
          plan_id: string
          plan_name: string
          plan_price: number
          start_date: string
          status: string
          student_id: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string
          created_at?: string
          end_date?: string
          enrollment_id?: string
          id?: string
          plan_id?: string
          plan_name?: string
          plan_price?: number
          start_date?: string
          status?: string
          student_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_history_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_history_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          created_at: string
          end_date: string
          id: string
          installment_amount: number | null
          is_installment_plan: boolean | null
          payment_day: number | null
          plan_id: string
          plan_name: string
          plan_price: number
          start_date: string
          status: string
          student_id: string
          total_installments: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          installment_amount?: number | null
          is_installment_plan?: boolean | null
          payment_day?: number | null
          plan_id: string
          plan_name: string
          plan_price: number
          start_date?: string
          status?: string
          student_id: string
          total_installments?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          installment_amount?: number | null
          is_installment_plan?: boolean | null
          payment_day?: number | null
          plan_id?: string
          plan_name?: string
          plan_price?: number
          start_date?: string
          status?: string
          student_id?: string
          total_installments?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_installments: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string
          enrollment_id: string
          id: string
          installment_number: number
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          status: string
          student_id: string
          total_installments: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date: string
          enrollment_id: string
          id?: string
          installment_number: number
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: string
          student_id: string
          total_installments: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string
          enrollment_id?: string
          id?: string
          installment_number?: number
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: string
          student_id?: string
          total_installments?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_installments_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_installments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      security_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          encrypted_value: string | null
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          encrypted_value?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          encrypted_value?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          address: string | null
          birth_date: string | null
          city: string | null
          cpf: string
          created_at: string
          deleted_at: string | null
          email: string
          emergency_contact: string | null
          gender: string | null
          health_issues: string | null
          id: string
          main_goal: string | null
          name: string
          notes: string | null
          phone: string
          restrictions: string | null
          rg: string | null
          status: string
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          city?: string | null
          cpf: string
          created_at?: string
          deleted_at?: string | null
          email: string
          emergency_contact?: string | null
          gender?: string | null
          health_issues?: string | null
          id?: string
          main_goal?: string | null
          name: string
          notes?: string | null
          phone: string
          restrictions?: string | null
          rg?: string | null
          status?: string
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          city?: string | null
          cpf?: string
          created_at?: string
          deleted_at?: string | null
          email?: string
          emergency_contact?: string | null
          gender?: string | null
          health_issues?: string | null
          id?: string
          main_goal?: string | null
          name?: string
          notes?: string | null
          phone?: string
          restrictions?: string | null
          rg?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_admin_role: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      cleanup_old_security_logs: { Args: never; Returns: undefined }
      get_current_user_id: { Args: never; Returns: string }
      get_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      inactivate_expired_enrollments: { Args: never; Returns: undefined }
      initialize_first_admin: { Args: { user_email: string }; Returns: boolean }
      is_admin: { Args: { _user_id?: string }; Returns: boolean }
      log_security_event: {
        Args: {
          action_type: string
          event_details?: Json
          target_user_id?: string
        }
        Returns: undefined
      }
      sync_student_status: { Args: never; Returns: undefined }
      update_access_password: {
        Args: { new_password: string; page_name: string }
        Returns: undefined
      }
      update_encrypted_password: {
        Args: { new_password: string; page_name: string }
        Returns: undefined
      }
      verify_page_access: {
        Args: { page_name_input: string; password_input: string }
        Returns: boolean
      }
      verify_password: {
        Args: { password_input: string; stored_hash: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const

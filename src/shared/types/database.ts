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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      contest_config: {
        Row: {
          bases_texto: string | null
          edad_minima: number
          fecha_anuncio_ganadores: string | null
          fecha_apertura: string | null
          fecha_cierre: string | null
          fecha_limite_fotos: string | null
          galeria_publica_desde_envio: boolean
          id: number
          max_fotos_por_participante: number
          modo_pruebas: boolean
          tamano_max_mb: number
          updated_at: string
        }
        Insert: {
          bases_texto?: string | null
          edad_minima?: number
          fecha_anuncio_ganadores?: string | null
          fecha_apertura?: string | null
          fecha_cierre?: string | null
          fecha_limite_fotos?: string | null
          galeria_publica_desde_envio?: boolean
          id?: number
          max_fotos_por_participante?: number
          modo_pruebas?: boolean
          tamano_max_mb?: number
          updated_at?: string
        }
        Update: {
          bases_texto?: string | null
          edad_minima?: number
          fecha_anuncio_ganadores?: string | null
          fecha_apertura?: string | null
          fecha_cierre?: string | null
          fecha_limite_fotos?: string | null
          galeria_publica_desde_envio?: boolean
          id?: number
          max_fotos_por_participante?: number
          modo_pruebas?: boolean
          tamano_max_mb?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          acepta_bases: boolean
          apellidos: string | null
          created_at: string
          email: string
          fecha_nacimiento: string | null
          id: string
          nombre: string | null
          role: string
          telefono: string | null
          tutor_dni: string | null
          tutor_nombre: string | null
          updated_at: string
        }
        Insert: {
          acepta_bases?: boolean
          apellidos?: string | null
          created_at?: string
          email: string
          fecha_nacimiento?: string | null
          id: string
          nombre?: string | null
          role?: string
          telefono?: string | null
          tutor_dni?: string | null
          tutor_nombre?: string | null
          updated_at?: string
        }
        Update: {
          acepta_bases?: boolean
          apellidos?: string | null
          created_at?: string
          email?: string
          fecha_nacimiento?: string | null
          id?: string
          nombre?: string | null
          role?: string
          telefono?: string | null
          tutor_dni?: string | null
          tutor_nombre?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          categoria: string
          created_at: string
          description: string | null
          id: string
          origen: string
          participant_id: string
          premio: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          storage_path: string
          title: string
          updated_at: string
        }
        Insert: {
          categoria: string
          created_at?: string
          description?: string | null
          id?: string
          origen?: string
          participant_id: string
          premio?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_path: string
          title: string
          updated_at?: string
        }
        Update: {
          categoria?: string
          created_at?: string
          description?: string | null
          id?: string
          origen?: string
          participant_id?: string
          premio?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_path?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
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

export type SubmissionStatus = "pending" | "approved" | "rejected" | "winner"
export type ProfileRole = "participant" | "admin"
export type SubmissionCategoria = "paisajes" | "patrimonio" | "rincon"
export type SubmissionOrigen = "web" | "email"
export type PremioTipo = "primero" | "segundo" | "tercero"
export type GrupoEdad = "Infantil / Juvenil" | "Adultos"

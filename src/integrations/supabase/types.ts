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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          categoria: string
          codigo: string
          created_at: string | null
          debates_requeridos: number | null
          descripcion: string
          icono: string
          id: string
          lecciones_requeridas: number | null
          nombre: string
          puntos_requeridos: number | null
          racha_requerida: number | null
        }
        Insert: {
          categoria: string
          codigo: string
          created_at?: string | null
          debates_requeridos?: number | null
          descripcion: string
          icono: string
          id?: string
          lecciones_requeridas?: number | null
          nombre: string
          puntos_requeridos?: number | null
          racha_requerida?: number | null
        }
        Update: {
          categoria?: string
          codigo?: string
          created_at?: string | null
          debates_requeridos?: number | null
          descripcion?: string
          icono?: string
          id?: string
          lecciones_requeridas?: number | null
          nombre?: string
          puntos_requeridos?: number | null
          racha_requerida?: number | null
        }
        Relationships: []
      }
      argument_cards: {
        Row: {
          autor_id: string | null
          citas_biblicas: Json | null
          created_at: string | null
          errores_comunes: Json | null
          estado: Database["public"]["Enums"]["content_estado"] | null
          evidencia: Json | null
          id: string
          perfil_doctrinal:
            | Database["public"]["Enums"]["perfil_doctrinal"]
            | null
          premisas: Json | null
          puentes_empaticos: Json | null
          recursos_sugeridos: Json | null
          resumen_2min: string
          resumen_30s: string
          resumen_5min: string
          revisor_id: string | null
          tema: string
          updated_at: string | null
        }
        Insert: {
          autor_id?: string | null
          citas_biblicas?: Json | null
          created_at?: string | null
          errores_comunes?: Json | null
          estado?: Database["public"]["Enums"]["content_estado"] | null
          evidencia?: Json | null
          id?: string
          perfil_doctrinal?:
            | Database["public"]["Enums"]["perfil_doctrinal"]
            | null
          premisas?: Json | null
          puentes_empaticos?: Json | null
          recursos_sugeridos?: Json | null
          resumen_2min: string
          resumen_30s: string
          resumen_5min: string
          revisor_id?: string | null
          tema: string
          updated_at?: string | null
        }
        Update: {
          autor_id?: string | null
          citas_biblicas?: Json | null
          created_at?: string | null
          errores_comunes?: Json | null
          estado?: Database["public"]["Enums"]["content_estado"] | null
          evidencia?: Json | null
          id?: string
          perfil_doctrinal?:
            | Database["public"]["Enums"]["perfil_doctrinal"]
            | null
          premisas?: Json | null
          puentes_empaticos?: Json | null
          recursos_sugeridos?: Json | null
          resumen_2min?: string
          resumen_30s?: string
          resumen_5min?: string
          revisor_id?: string | null
          tema?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "argument_cards_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "argument_cards_revisor_id_fkey"
            columns: ["revisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      debates: {
        Row: {
          completed: boolean | null
          created_at: string | null
          feedback: string | null
          id: string
          personaje: string
          puntaje_amor: number | null
          puntaje_fe: number | null
          puntaje_razon: number | null
          tema: string
          transcript: Json | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          personaje: string
          puntaje_amor?: number | null
          puntaje_fe?: number | null
          puntaje_razon?: number | null
          tema: string
          transcript?: Json | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          personaje?: string
          puntaje_amor?: number | null
          puntaje_fe?: number | null
          puntaje_razon?: number | null
          tema?: string
          transcript?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_logs: {
        Row: {
          completado: boolean | null
          created_at: string | null
          fecha: string
          habit_id: string
          id: string
          notas: string | null
        }
        Insert: {
          completado?: boolean | null
          created_at?: string | null
          fecha?: string
          habit_id: string
          id?: string
          notas?: string | null
        }
        Update: {
          completado?: boolean | null
          created_at?: string | null
          fecha?: string
          habit_id?: string
          id?: string
          notas?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          created_at: string | null
          id: string
          meta_semanal: number | null
          racha_actual: number | null
          racha_maxima: number | null
          tipo: Database["public"]["Enums"]["habit_type"]
          ultima_actividad: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          meta_semanal?: number | null
          racha_actual?: number | null
          racha_maxima?: number | null
          tipo: Database["public"]["Enums"]["habit_type"]
          ultima_actividad?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          meta_semanal?: number | null
          racha_actual?: number | null
          racha_maxima?: number | null
          tipo?: Database["public"]["Enums"]["habit_type"]
          ultima_actividad?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      library_lessons: {
        Row: {
          categoria: string
          contenido: string
          created_at: string | null
          descripcion: string
          id: string
          nivel: number
          orden: number | null
          recursos: Json | null
          titulo: string
        }
        Insert: {
          categoria: string
          contenido: string
          created_at?: string | null
          descripcion: string
          id?: string
          nivel: number
          orden?: number | null
          recursos?: Json | null
          titulo: string
        }
        Update: {
          categoria?: string
          contenido?: string
          created_at?: string | null
          descripcion?: string
          id?: string
          nivel?: number
          orden?: number | null
          recursos?: Json | null
          titulo?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          contenido: string
          created_at: string | null
          estado: Database["public"]["Enums"]["content_estado"] | null
          id: string
          likes_count: number | null
          tipo: Database["public"]["Enums"]["post_type"]
          user_id: string
        }
        Insert: {
          contenido: string
          created_at?: string | null
          estado?: Database["public"]["Enums"]["content_estado"] | null
          id?: string
          likes_count?: number | null
          tipo: Database["public"]["Enums"]["post_type"]
          user_id: string
        }
        Update: {
          contenido?: string
          created_at?: string | null
          estado?: Database["public"]["Enums"]["content_estado"] | null
          id?: string
          likes_count?: number | null
          tipo?: Database["public"]["Enums"]["post_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          edad_segmento: Database["public"]["Enums"]["edad_segmento"] | null
          email: string | null
          id: string
          iglesia: string | null
          nombre: string
          pais: string | null
          perfil_doctrinal:
            | Database["public"]["Enums"]["perfil_doctrinal"]
            | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          edad_segmento?: Database["public"]["Enums"]["edad_segmento"] | null
          email?: string | null
          id: string
          iglesia?: string | null
          nombre: string
          pais?: string | null
          perfil_doctrinal?:
            | Database["public"]["Enums"]["perfil_doctrinal"]
            | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          edad_segmento?: Database["public"]["Enums"]["edad_segmento"] | null
          email?: string | null
          id?: string
          iglesia?: string | null
          nombre?: string
          pais?: string | null
          perfil_doctrinal?:
            | Database["public"]["Enums"]["perfil_doctrinal"]
            | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          desbloqueado_en: string | null
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          desbloqueado_en?: string | null
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          desbloqueado_en?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lesson_progress: {
        Row: {
          completado: boolean | null
          created_at: string | null
          fecha_completado: string | null
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completado?: boolean | null
          created_at?: string | null
          fecha_completado?: string | null
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completado?: boolean | null
          created_at?: string | null
          fecha_completado?: string | null
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "library_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string | null
          debates_completados: number
          id: string
          lecciones_completadas: number
          nivel: number
          puntos_totales: number
          racha_actual_dias: number
          racha_maxima_dias: number
          tarjetas_estudiadas: number
          ultima_actividad: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          debates_completados?: number
          id?: string
          lecciones_completadas?: number
          nivel?: number
          puntos_totales?: number
          racha_actual_dias?: number
          racha_maxima_dias?: number
          tarjetas_estudiadas?: number
          ultima_actividad?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          debates_completados?: number
          id?: string
          lecciones_completadas?: number
          nivel?: number
          puntos_totales?: number
          racha_actual_dias?: number
          racha_maxima_dias?: number
          tarjetas_estudiadas?: number
          ultima_actividad?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_level: { Args: { puntos: number }; Returns: number }
    }
    Enums: {
      app_role:
        | "user"
        | "moderator"
        | "revisor_teologico"
        | "admin"
        | "lider_iglesia"
      content_estado: "borrador" | "revisado" | "publicado"
      edad_segmento: "18-25" | "26-35" | "36-50" | "51+"
      habit_type:
        | "oracion"
        | "gratitud"
        | "servicio"
        | "lectura_biblica"
        | "descanso"
      perfil_doctrinal:
        | "catolico"
        | "evangelico"
        | "pentecostal"
        | "no_denominacional"
        | "otro"
      post_type: "testimonio" | "peticion_oracion" | "reflexion"
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
      app_role: [
        "user",
        "moderator",
        "revisor_teologico",
        "admin",
        "lider_iglesia",
      ],
      content_estado: ["borrador", "revisado", "publicado"],
      edad_segmento: ["18-25", "26-35", "36-50", "51+"],
      habit_type: [
        "oracion",
        "gratitud",
        "servicio",
        "lectura_biblica",
        "descanso",
      ],
      perfil_doctrinal: [
        "catolico",
        "evangelico",
        "pentecostal",
        "no_denominacional",
        "otro",
      ],
      post_type: ["testimonio", "peticion_oracion", "reflexion"],
    },
  },
} as const

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
      admin_activity_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      apostle_path_activities: {
        Row: {
          actividad_id: string
          actividad_tipo: string
          completado_en: string
          etapa: number
          id: string
          metadata: Json | null
          puntos_ganados: number
          user_id: string
        }
        Insert: {
          actividad_id: string
          actividad_tipo: string
          completado_en?: string
          etapa: number
          id?: string
          metadata?: Json | null
          puntos_ganados?: number
          user_id: string
        }
        Update: {
          actividad_id?: string
          actividad_tipo?: string
          completado_en?: string
          etapa?: number
          id?: string
          metadata?: Json | null
          puntos_ganados?: number
          user_id?: string
        }
        Relationships: []
      }
      apostle_path_progress: {
        Row: {
          apostol_completado: boolean
          cimientos_completado: boolean
          created_at: string
          debatidor_completado: boolean
          defensor_completado: boolean
          etapa_actual: number
          fecha_inicio: string
          fecha_ultima_actividad: string | null
          id: string
          misionero_completado: boolean
          puntos_ruta: number
          updated_at: string
          user_id: string
        }
        Insert: {
          apostol_completado?: boolean
          cimientos_completado?: boolean
          created_at?: string
          debatidor_completado?: boolean
          defensor_completado?: boolean
          etapa_actual?: number
          fecha_inicio?: string
          fecha_ultima_actividad?: string | null
          id?: string
          misionero_completado?: boolean
          puntos_ruta?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          apostol_completado?: boolean
          cimientos_completado?: boolean
          created_at?: string
          debatidor_completado?: boolean
          defensor_completado?: boolean
          etapa_actual?: number
          fecha_inicio?: string
          fecha_ultima_actividad?: string | null
          id?: string
          misionero_completado?: boolean
          puntos_ruta?: number
          updated_at?: string
          user_id?: string
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
      bible_plan_notes: {
        Row: {
          created_at: string | null
          dia: number
          id: string
          nota: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dia: number
          id?: string
          nota: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dia?: number
          id?: string
          nota?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bible_reading_plan: {
        Row: {
          color_periodo: string | null
          created_at: string
          dia: number
          es_libro_narrativo: boolean | null
          id: string
          lectura_1: string | null
          lectura_2: string | null
          lectura_3: string | null
          pasaje_referencia: string
          pasaje_texto: string
          periodo: string | null
          reflexion: string | null
          titulo: string
          youtube_video_id: string | null
        }
        Insert: {
          color_periodo?: string | null
          created_at?: string
          dia: number
          es_libro_narrativo?: boolean | null
          id?: string
          lectura_1?: string | null
          lectura_2?: string | null
          lectura_3?: string | null
          pasaje_referencia: string
          pasaje_texto: string
          periodo?: string | null
          reflexion?: string | null
          titulo: string
          youtube_video_id?: string | null
        }
        Update: {
          color_periodo?: string | null
          created_at?: string
          dia?: number
          es_libro_narrativo?: boolean | null
          id?: string
          lectura_1?: string | null
          lectura_2?: string | null
          lectura_3?: string | null
          pasaje_referencia?: string
          pasaje_texto?: string
          periodo?: string | null
          reflexion?: string | null
          titulo?: string
          youtube_video_id?: string | null
        }
        Relationships: []
      }
      bible_text_cache: {
        Row: {
          capitulo: number
          created_at: string | null
          id: string
          libro: string
          texto: string
          traduccion: string | null
        }
        Insert: {
          capitulo: number
          created_at?: string | null
          id?: string
          libro: string
          texto: string
          traduccion?: string | null
        }
        Update: {
          capitulo?: number
          created_at?: string | null
          id?: string
          libro?: string
          texto?: string
          traduccion?: string | null
        }
        Relationships: []
      }
      content_feedback: {
        Row: {
          comentario: string | null
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          leido: boolean | null
          rating: number
          user_id: string
        }
        Insert: {
          comentario?: string | null
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          leido?: boolean | null
          rating: number
          user_id: string
        }
        Update: {
          comentario?: string | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          leido?: boolean | null
          rating?: number
          user_id?: string
        }
        Relationships: []
      }
      course_lessons: {
        Row: {
          contenido: string | null
          created_at: string | null
          duracion_min: number | null
          id: string
          media_id: string | null
          module_id: string | null
          orden: number | null
          quiz_data: Json | null
          tipo: string | null
          titulo: string
        }
        Insert: {
          contenido?: string | null
          created_at?: string | null
          duracion_min?: number | null
          id?: string
          media_id?: string | null
          module_id?: string | null
          orden?: number | null
          quiz_data?: Json | null
          tipo?: string | null
          titulo: string
        }
        Update: {
          contenido?: string | null
          created_at?: string | null
          duracion_min?: number | null
          id?: string
          media_id?: string | null
          module_id?: string | null
          orden?: number | null
          quiz_data?: Json | null
          tipo?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string | null
          created_at: string | null
          descripcion: string | null
          id: string
          orden: number | null
          titulo: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          orden?: number | null
          titulo: string
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          orden?: number | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          categoria: string
          created_at: string | null
          descripcion: string | null
          duracion_total_min: number | null
          id: string
          imagen_url: string | null
          instructor_id: string | null
          metadata: Json | null
          nivel: string | null
          orden: number | null
          precio: number | null
          publicado: boolean | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          categoria: string
          created_at?: string | null
          descripcion?: string | null
          duracion_total_min?: number | null
          id?: string
          imagen_url?: string | null
          instructor_id?: string | null
          metadata?: Json | null
          nivel?: string | null
          orden?: number | null
          precio?: number | null
          publicado?: boolean | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          categoria?: string
          created_at?: string | null
          descripcion?: string | null
          duracion_total_min?: number | null
          id?: string
          imagen_url?: string | null
          instructor_id?: string | null
          metadata?: Json | null
          nivel?: string | null
          orden?: number | null
          precio?: number | null
          publicado?: boolean | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_content: {
        Row: {
          audio_completas_url: string | null
          audio_ensenanza_url: string | null
          audio_laudes_url: string | null
          audio_reflexion_url: string | null
          audio_tip_url: string | null
          audio_versiculo_url: string | null
          created_at: string | null
          ensenanza_contenido: string | null
          ensenanza_titulo: string | null
          fecha: string
          id: string
          oracion_completas: string
          oracion_laudes: string
          reflexion_ia: string
          tip_apologetico: string
          versiculo_referencia: string
          versiculo_texto: string
        }
        Insert: {
          audio_completas_url?: string | null
          audio_ensenanza_url?: string | null
          audio_laudes_url?: string | null
          audio_reflexion_url?: string | null
          audio_tip_url?: string | null
          audio_versiculo_url?: string | null
          created_at?: string | null
          ensenanza_contenido?: string | null
          ensenanza_titulo?: string | null
          fecha: string
          id?: string
          oracion_completas: string
          oracion_laudes: string
          reflexion_ia: string
          tip_apologetico: string
          versiculo_referencia: string
          versiculo_texto: string
        }
        Update: {
          audio_completas_url?: string | null
          audio_ensenanza_url?: string | null
          audio_laudes_url?: string | null
          audio_reflexion_url?: string | null
          audio_tip_url?: string | null
          audio_versiculo_url?: string | null
          created_at?: string | null
          ensenanza_contenido?: string | null
          ensenanza_titulo?: string | null
          fecha?: string
          id?: string
          oracion_completas?: string
          oracion_laudes?: string
          reflexion_ia?: string
          tip_apologetico?: string
          versiculo_referencia?: string
          versiculo_texto?: string
        }
        Relationships: []
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
      evangelization_logs: {
        Row: {
          created_at: string | null
          descripcion: string
          fecha: string
          id: string
          persona_nombre: string | null
          resultado: string | null
          seguimiento_necesario: boolean | null
          tipo: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          descripcion: string
          fecha: string
          id?: string
          persona_nombre?: string | null
          resultado?: string | null
          seguimiento_necesario?: boolean | null
          tipo: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          descripcion?: string
          fecha?: string
          id?: string
          persona_nombre?: string | null
          resultado?: string | null
          seguimiento_necesario?: boolean | null
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback_alert_history: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_config_id: string | null
          content_type: string
          details: Json | null
          id: string
          negative_count: number
          negative_percentage: number
          total_count: number
          triggered_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_config_id?: string | null
          content_type: string
          details?: Json | null
          id?: string
          negative_count: number
          negative_percentage: number
          total_count: number
          triggered_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_config_id?: string | null
          content_type?: string
          details?: Json | null
          id?: string
          negative_count?: number
          negative_percentage?: number
          total_count?: number
          triggered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_alert_history_alert_config_id_fkey"
            columns: ["alert_config_id"]
            isOneToOne: false
            referencedRelation: "feedback_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_alerts: {
        Row: {
          content_type: string
          created_at: string
          enabled: boolean
          id: string
          min_feedback_count: number
          threshold_percentage: number
          time_window_hours: number
          updated_at: string
        }
        Insert: {
          content_type: string
          created_at?: string
          enabled?: boolean
          id?: string
          min_feedback_count?: number
          threshold_percentage?: number
          time_window_hours?: number
          updated_at?: string
        }
        Update: {
          content_type?: string
          created_at?: string
          enabled?: boolean
          id?: string
          min_feedback_count?: number
          threshold_percentage?: number
          time_window_hours?: number
          updated_at?: string
        }
        Relationships: []
      }
      gratitude_entries: {
        Row: {
          created_at: string
          entrada_1: string
          entrada_2: string | null
          entrada_3: string | null
          fecha: string
          id: string
          reflexion_biblica: string | null
          user_id: string
          versiculo_sugerido: string | null
        }
        Insert: {
          created_at?: string
          entrada_1: string
          entrada_2?: string | null
          entrada_3?: string | null
          fecha?: string
          id?: string
          reflexion_biblica?: string | null
          user_id: string
          versiculo_sugerido?: string | null
        }
        Update: {
          created_at?: string
          entrada_1?: string
          entrada_2?: string | null
          entrada_3?: string | null
          fecha?: string
          id?: string
          reflexion_biblica?: string | null
          user_id?: string
          versiculo_sugerido?: string | null
        }
        Relationships: []
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
          audio_url: string | null
          categoria: string
          contenido: string
          contenido_enriquecido: string | null
          created_at: string | null
          descripcion: string
          duracion_estimada: number | null
          id: string
          language: string | null
          nivel: number
          orden: number | null
          recursos: Json | null
          titulo: string
        }
        Insert: {
          audio_url?: string | null
          categoria: string
          contenido: string
          contenido_enriquecido?: string | null
          created_at?: string | null
          descripcion: string
          duracion_estimada?: number | null
          id?: string
          language?: string | null
          nivel: number
          orden?: number | null
          recursos?: Json | null
          titulo: string
        }
        Update: {
          audio_url?: string | null
          categoria?: string
          contenido?: string
          contenido_enriquecido?: string | null
          created_at?: string | null
          descripcion?: string
          duracion_estimada?: number | null
          id?: string
          language?: string | null
          nivel?: number
          orden?: number | null
          recursos?: Json | null
          titulo?: string
        }
        Relationships: []
      }
      live_session_registrations: {
        Row: {
          asistio: boolean | null
          id: string
          registered_at: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          asistio?: boolean | null
          id?: string
          registered_at?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          asistio?: boolean | null
          id?: string
          registered_at?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_session_registrations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_sessions: {
        Row: {
          categoria: string | null
          created_at: string | null
          descripcion: string | null
          duracion_estimada_min: number | null
          estado: string | null
          id: string
          imagen_url: string | null
          instructor_id: string | null
          max_participants: number | null
          metadata: Json | null
          precio: number | null
          recording_url: string | null
          scheduled_at: string
          titulo: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          descripcion?: string | null
          duracion_estimada_min?: number | null
          estado?: string | null
          id?: string
          imagen_url?: string | null
          instructor_id?: string | null
          max_participants?: number | null
          metadata?: Json | null
          precio?: number | null
          recording_url?: string | null
          scheduled_at: string
          titulo: string
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          descripcion?: string | null
          duracion_estimada_min?: number | null
          estado?: string | null
          id?: string
          imagen_url?: string | null
          instructor_id?: string | null
          max_participants?: number | null
          metadata?: Json | null
          precio?: number | null
          recording_url?: string | null
          scheduled_at?: string
          titulo?: string
        }
        Relationships: []
      }
      media_library: {
        Row: {
          created_at: string | null
          descripcion: string | null
          duracion_segundos: number | null
          estado: Database["public"]["Enums"]["content_estado"] | null
          formato: string | null
          id: string
          metadata: Json | null
          size_bytes: number | null
          subido_por: string | null
          tags: string[] | null
          thumbnail_url: string | null
          tipo: string
          titulo: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          duracion_segundos?: number | null
          estado?: Database["public"]["Enums"]["content_estado"] | null
          formato?: string | null
          id?: string
          metadata?: Json | null
          size_bytes?: number | null
          subido_por?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          tipo: string
          titulo: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          duracion_segundos?: number | null
          estado?: Database["public"]["Enums"]["content_estado"] | null
          formato?: string | null
          id?: string
          metadata?: Json | null
          size_bytes?: number | null
          subido_por?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      movies: {
        Row: {
          anio: number | null
          categoria: string | null
          clasificacion: string | null
          created_at: string | null
          descripcion: string | null
          destacada: boolean | null
          director: string | null
          duracion_min: number | null
          id: string
          imagen_banner: string | null
          imagen_poster: string | null
          media_id: string | null
          metadata: Json | null
          orden: number | null
          publicada: boolean | null
          sinopsis: string | null
          titulo: string
          trailer_url: string | null
        }
        Insert: {
          anio?: number | null
          categoria?: string | null
          clasificacion?: string | null
          created_at?: string | null
          descripcion?: string | null
          destacada?: boolean | null
          director?: string | null
          duracion_min?: number | null
          id?: string
          imagen_banner?: string | null
          imagen_poster?: string | null
          media_id?: string | null
          metadata?: Json | null
          orden?: number | null
          publicada?: boolean | null
          sinopsis?: string | null
          titulo: string
          trailer_url?: string | null
        }
        Update: {
          anio?: number | null
          categoria?: string | null
          clasificacion?: string | null
          created_at?: string | null
          descripcion?: string | null
          destacada?: boolean | null
          director?: string | null
          duracion_min?: number | null
          id?: string
          imagen_banner?: string | null
          imagen_poster?: string | null
          media_id?: string | null
          metadata?: Json | null
          orden?: number | null
          publicada?: boolean | null
          sinopsis?: string | null
          titulo?: string
          trailer_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movies_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_library"
            referencedColumns: ["id"]
          },
        ]
      }
      novenas: {
        Row: {
          categoria: string
          created_at: string
          descripcion: string
          dias: Json
          id: string
          imagen_url: string | null
          intencion: string
          language: string | null
          orden: number | null
          titulo: string
        }
        Insert: {
          categoria?: string
          created_at?: string
          descripcion: string
          dias?: Json
          id?: string
          imagen_url?: string | null
          intencion: string
          language?: string | null
          orden?: number | null
          titulo: string
        }
        Update: {
          categoria?: string
          created_at?: string
          descripcion?: string
          dias?: Json
          id?: string
          imagen_url?: string | null
          intencion?: string
          language?: string | null
          orden?: number | null
          titulo?: string
        }
        Relationships: []
      }
      oraciones: {
        Row: {
          audio_url: string | null
          categoria: string
          created_at: string
          historia: string | null
          id: string
          language: string | null
          nombre: string
          orden: number | null
          subcategoria: string | null
          texto: string
        }
        Insert: {
          audio_url?: string | null
          categoria: string
          created_at?: string
          historia?: string | null
          id?: string
          language?: string | null
          nombre: string
          orden?: number | null
          subcategoria?: string | null
          texto: string
        }
        Update: {
          audio_url?: string | null
          categoria?: string
          created_at?: string
          historia?: string | null
          id?: string
          language?: string | null
          nombre?: string
          orden?: number | null
          subcategoria?: string | null
          texto?: string
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
      prayer_journal: {
        Row: {
          contenido: string
          created_at: string | null
          fecha_respuesta: string | null
          id: string
          notas_respuesta: string | null
          respondida: boolean | null
          tipo: string
          user_id: string
          versiculo_relacionado: string | null
        }
        Insert: {
          contenido: string
          created_at?: string | null
          fecha_respuesta?: string | null
          id?: string
          notas_respuesta?: string | null
          respondida?: boolean | null
          tipo: string
          user_id: string
          versiculo_relacionado?: string | null
        }
        Update: {
          contenido?: string
          created_at?: string | null
          fecha_respuesta?: string | null
          id?: string
          notas_respuesta?: string | null
          respondida?: boolean | null
          tipo?: string
          user_id?: string
          versiculo_relacionado?: string | null
        }
        Relationships: []
      }
      processing_jobs: {
        Row: {
          attempts: number
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          job_type: string
          max_attempts: number
          processing_time_ms: number | null
          result_data: Json | null
          started_at: string | null
          status: string
          target_id: string
          target_table: string
          target_title: string | null
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_type: string
          max_attempts?: number
          processing_time_ms?: number | null
          result_data?: Json | null
          started_at?: string | null
          status?: string
          target_id: string
          target_table: string
          target_title?: string | null
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_type?: string
          max_attempts?: number
          processing_time_ms?: number | null
          result_data?: Json | null
          started_at?: string | null
          status?: string
          target_id?: string
          target_table?: string
          target_title?: string | null
        }
        Relationships: []
      }
      processing_logs: {
        Row: {
          attempt_number: number
          created_at: string
          id: string
          job_id: string
          message: string | null
          metadata: Json | null
          status: string
        }
        Insert: {
          attempt_number: number
          created_at?: string
          id?: string
          job_id: string
          message?: string | null
          metadata?: Json | null
          status: string
        }
        Update: {
          attempt_number?: number
          created_at?: string
          id?: string
          job_id?: string
          message?: string | null
          metadata?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "processing_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "processing_jobs"
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
      sleep_stories: {
        Row: {
          audio_url: string | null
          categoria: string
          contenido: string
          created_at: string
          descripcion: string
          duracion_estimada: number
          id: string
          imagen_url: string | null
          language: string | null
          orden: number | null
          titulo: string
        }
        Insert: {
          audio_url?: string | null
          categoria?: string
          contenido: string
          created_at?: string
          descripcion: string
          duracion_estimada?: number
          id?: string
          imagen_url?: string | null
          language?: string | null
          orden?: number | null
          titulo: string
        }
        Update: {
          audio_url?: string | null
          categoria?: string
          contenido?: string
          created_at?: string
          descripcion?: string
          duracion_estimada?: number
          id?: string
          imagen_url?: string | null
          language?: string | null
          orden?: number | null
          titulo?: string
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
      user_bible_progress: {
        Row: {
          created_at: string
          dia_actual: number
          dias_completados: Json
          fecha_inicio: string
          id: string
          racha_actual: number
          ultima_lectura: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dia_actual?: number
          dias_completados?: Json
          fecha_inicio?: string
          id?: string
          racha_actual?: number
          ultima_lectura?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dia_actual?: number
          dias_completados?: Json
          fecha_inicio?: string
          id?: string
          racha_actual?: number
          ultima_lectura?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_content_history: {
        Row: {
          completado: boolean | null
          content_id: string
          content_type: string
          first_accessed: string | null
          id: string
          last_accessed: string | null
          tiempo_total_seg: number | null
          user_id: string
          visitas: number | null
        }
        Insert: {
          completado?: boolean | null
          content_id: string
          content_type: string
          first_accessed?: string | null
          id?: string
          last_accessed?: string | null
          tiempo_total_seg?: number | null
          user_id: string
          visitas?: number | null
        }
        Update: {
          completado?: boolean | null
          content_id?: string
          content_type?: string
          first_accessed?: string | null
          id?: string
          last_accessed?: string | null
          tiempo_total_seg?: number | null
          user_id?: string
          visitas?: number | null
        }
        Relationships: []
      }
      user_course_progress: {
        Row: {
          certificado_emitido: boolean | null
          course_id: string
          fecha_completado: string | null
          fecha_inicio: string | null
          id: string
          lessons_completed: string[] | null
          progreso_porcentaje: number | null
          user_id: string
        }
        Insert: {
          certificado_emitido?: boolean | null
          course_id: string
          fecha_completado?: string | null
          fecha_inicio?: string | null
          id?: string
          lessons_completed?: string[] | null
          progreso_porcentaje?: number | null
          user_id: string
        }
        Update: {
          certificado_emitido?: boolean | null
          course_id?: string
          fecha_completado?: string | null
          fecha_inicio?: string | null
          id?: string
          lessons_completed?: string[] | null
          progreso_porcentaje?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
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
      user_movie_history: {
        Row: {
          completada: boolean | null
          id: string
          last_watched: string | null
          movie_id: string
          tiempo_visto_seg: number | null
          user_id: string
        }
        Insert: {
          completada?: boolean | null
          id?: string
          last_watched?: string | null
          movie_id: string
          tiempo_visto_seg?: number | null
          user_id: string
        }
        Update: {
          completada?: boolean | null
          id?: string
          last_watched?: string | null
          movie_id?: string
          tiempo_visto_seg?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_movie_history_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_preferences: {
        Row: {
          created_at: string
          hora_preferida: string | null
          id: string
          notificaciones_habilitadas: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          hora_preferida?: string | null
          id?: string
          notificaciones_habilitadas?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          hora_preferida?: string | null
          id?: string
          notificaciones_habilitadas?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_novena_progress: {
        Row: {
          completada: boolean | null
          created_at: string
          dia_actual: number
          dias_completados: Json
          fecha_inicio: string
          hora_recordatorio: string | null
          id: string
          novena_id: string
          recordatorio_activo: boolean | null
          ultima_actividad: string | null
          user_id: string
        }
        Insert: {
          completada?: boolean | null
          created_at?: string
          dia_actual?: number
          dias_completados?: Json
          fecha_inicio?: string
          hora_recordatorio?: string | null
          id?: string
          novena_id: string
          recordatorio_activo?: boolean | null
          ultima_actividad?: string | null
          user_id: string
        }
        Update: {
          completada?: boolean | null
          created_at?: string
          dia_actual?: number
          dias_completados?: Json
          fecha_inicio?: string
          hora_recordatorio?: string | null
          id?: string
          novena_id?: string
          recordatorio_activo?: boolean | null
          ultima_actividad?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_novena_progress_novena_id_fkey"
            columns: ["novena_id"]
            isOneToOne: false
            referencedRelation: "novenas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_oraciones_favoritas: {
        Row: {
          created_at: string
          id: string
          oracion_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          oracion_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          oracion_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_oraciones_favoritas_oracion_id_fkey"
            columns: ["oracion_id"]
            isOneToOne: false
            referencedRelation: "oraciones"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rituals: {
        Row: {
          compartio_fe: boolean | null
          created_at: string | null
          diario_personal: string | null
          examen_conciencia: Json | null
          fecha: string
          id: string
          meta_evangelizacion: string | null
          notas_evangelizacion: string | null
          ritual_matutino_completado: boolean | null
          ritual_nocturno_completado: boolean | null
          user_id: string
        }
        Insert: {
          compartio_fe?: boolean | null
          created_at?: string | null
          diario_personal?: string | null
          examen_conciencia?: Json | null
          fecha: string
          id?: string
          meta_evangelizacion?: string | null
          notas_evangelizacion?: string | null
          ritual_matutino_completado?: boolean | null
          ritual_nocturno_completado?: boolean | null
          user_id: string
        }
        Update: {
          compartio_fe?: boolean | null
          created_at?: string | null
          diario_personal?: string | null
          examen_conciencia?: Json | null
          fecha?: string
          id?: string
          meta_evangelizacion?: string | null
          notas_evangelizacion?: string | null
          ritual_matutino_completado?: boolean | null
          ritual_nocturno_completado?: boolean | null
          user_id?: string
        }
        Relationships: []
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
      user_rosario_progress: {
        Row: {
          completado: boolean | null
          created_at: string
          decenas_completadas: number | null
          duracion_minutos: number | null
          fecha: string
          id: string
          misterio_tipo: string
          user_id: string
        }
        Insert: {
          completado?: boolean | null
          created_at?: string
          decenas_completadas?: number | null
          duracion_minutos?: number | null
          fecha?: string
          id?: string
          misterio_tipo: string
          user_id: string
        }
        Update: {
          completado?: boolean | null
          created_at?: string
          decenas_completadas?: number | null
          duracion_minutos?: number | null
          fecha?: string
          id?: string
          misterio_tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sleep_history: {
        Row: {
          completado: boolean | null
          created_at: string
          duracion_escuchada: number | null
          fecha: string
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          completado?: boolean | null
          created_at?: string
          duracion_escuchada?: number | null
          fecha?: string
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          completado?: boolean | null
          created_at?: string
          duracion_escuchada?: number | null
          fecha?: string
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sleep_history_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "sleep_stories"
            referencedColumns: ["id"]
          },
        ]
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
      check_feedback_alerts: {
        Args: never
        Returns: {
          config_id: string
          content_type: string
          negative_count: number
          negative_percentage: number
          threshold_exceeded: boolean
          total_count: number
        }[]
      }
      get_processing_stats: {
        Args: { p_job_type?: string }
        Returns: {
          avg_processing_time_ms: number
          completed_jobs: number
          error_jobs: number
          job_type: string
          pending_jobs: number
          processing_jobs: number
          success_rate: number
          total_jobs: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
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

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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_config: {
        Row: {
          created_at: string
          key: string
          value: string
        }
        Insert: {
          created_at?: string
          key: string
          value: string
        }
        Update: {
          created_at?: string
          key?: string
          value?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description: string
          icon: string
          id: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      challenge_participations: {
        Row: {
          challenge_id: string
          completed: boolean
          completed_days: number
          created_at: string
          id: string
          last_completed_date: string | null
          start_date: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean
          completed_days?: number
          created_at?: string
          id?: string
          last_completed_date?: string | null
          start_date: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean
          completed_days?: number
          created_at?: string
          id?: string
          last_completed_date?: string | null
          start_date?: string
          user_id?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          created_at: string
          id: string
          nome: string
          streak: number
          ultima_data: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          streak?: number
          ultima_data?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          streak?: number
          ultima_data?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          created_at: string
          id: string
          post_id: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_notifications: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          post_id: string | null
          read: boolean
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          id?: string
          post_id?: string | null
          read?: boolean
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          post_id?: string | null
          read?: boolean
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          created_at: string
          id: string
          likes_count: number
          text: string
          user_id: string
          workout_duration_min: number | null
          workout_focus: string | null
          workout_type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          likes_count?: number
          text?: string
          user_id: string
          workout_duration_min?: number | null
          workout_focus?: string | null
          workout_type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          likes_count?: number
          text?: string
          user_id?: string
          workout_duration_min?: number | null
          workout_focus?: string | null
          workout_type?: string | null
        }
        Relationships: []
      }
      cycle_tracking: {
        Row: {
          created_at: string
          data: string
          id: string
          note: string | null
          sintomi: string[] | null
          tipo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: string
          id?: string
          note?: string | null
          sintomi?: string[] | null
          tipo?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          note?: string | null
          sintomi?: string[] | null
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      food_diary: {
        Row: {
          created_at: string
          data: string
          descrizione: string
          id: string
          mood: string
          tipo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: string
          descrizione: string
          id?: string
          mood: string
          tipo: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          descrizione?: string
          id?: string
          mood?: string
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      leaderboard: {
        Row: {
          created_at: string
          id: string
          rank: number
          user_id: string
          week_start: string
          workouts_week: number
          xp_week: number
        }
        Insert: {
          created_at?: string
          id?: string
          rank?: number
          user_id: string
          week_start: string
          workouts_week?: number
          xp_week?: number
        }
        Update: {
          created_at?: string
          id?: string
          rank?: number
          user_id?: string
          week_start?: string
          workouts_week?: number
          xp_week?: number
        }
        Relationships: []
      }
      measurements: {
        Row: {
          coscia: string
          created_at: string
          data: string
          fianchi: string
          id: string
          peso: string
          user_id: string
          vita: string
        }
        Insert: {
          coscia?: string
          created_at?: string
          data: string
          fianchi?: string
          id?: string
          peso: string
          user_id: string
          vita?: string
        }
        Update: {
          coscia?: string
          created_at?: string
          data?: string
          fianchi?: string
          id?: string
          peso?: string
          user_id?: string
          vita?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          level: number
          premium: boolean
          premium_expires: string | null
          stripe_customer_id: string | null
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          level?: number
          premium?: boolean
          premium_expires?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          level?: number
          premium?: boolean
          premium_expires?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          altezza: number | null
          attivita_livello: string | null
          attrezzi_selezionati: string[] | null
          calorie_target: number | null
          created_at: string
          durata_ciclo: number | null
          durata_mestruazione: number | null
          eta: number | null
          fuso_orario: string | null
          giorni_allenamento: number[] | null
          id: string
          livello: string | null
          modalita_gravidanza: boolean | null
          notifica_orario: string | null
          notifiche_abilitate: boolean | null
          obiettivo_nutrizionale: string | null
          peso: number | null
          settimana_gestazionale: number | null
          ultimi_attrezzi: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          altezza?: number | null
          attivita_livello?: string | null
          attrezzi_selezionati?: string[] | null
          calorie_target?: number | null
          created_at?: string
          durata_ciclo?: number | null
          durata_mestruazione?: number | null
          eta?: number | null
          fuso_orario?: string | null
          giorni_allenamento?: number[] | null
          id?: string
          livello?: string | null
          modalita_gravidanza?: boolean | null
          notifica_orario?: string | null
          notifiche_abilitate?: boolean | null
          obiettivo_nutrizionale?: string | null
          peso?: number | null
          settimana_gestazionale?: number | null
          ultimi_attrezzi?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          altezza?: number | null
          attivita_livello?: string | null
          attrezzi_selezionati?: string[] | null
          calorie_target?: number | null
          created_at?: string
          durata_ciclo?: number | null
          durata_mestruazione?: number | null
          eta?: number | null
          fuso_orario?: string | null
          giorni_allenamento?: number[] | null
          id?: string
          livello?: string | null
          modalita_gravidanza?: boolean | null
          notifica_orario?: string | null
          notifiche_abilitate?: boolean | null
          obiettivo_nutrizionale?: string | null
          peso?: number | null
          settimana_gestazionale?: number | null
          ultimi_attrezzi?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      water_tracking: {
        Row: {
          bicchieri: number
          created_at: string
          data: string
          id: string
          user_id: string
        }
        Insert: {
          bicchieri?: number
          created_at?: string
          data: string
          id?: string
          user_id: string
        }
        Update: {
          bicchieri?: number
          created_at?: string
          data?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_history: {
        Row: {
          attrezzo: string
          completato: boolean
          created_at: string
          data_key: string
          id: string
          round: number
          user_id: string
        }
        Insert: {
          attrezzo: string
          completato?: boolean
          created_at?: string
          data_key: string
          id?: string
          round?: number
          user_id: string
        }
        Update: {
          attrezzo?: string
          completato?: boolean
          created_at?: string
          data_key?: string
          id?: string
          round?: number
          user_id?: string
        }
        Relationships: []
      }
      workout_plans: {
        Row: {
          allenamenti: Json | null
          created_at: string
          id: string
          piano: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allenamenti?: Json | null
          created_at?: string
          id?: string
          piano?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allenamenti?: Json | null
          created_at?: string
          id?: string
          piano?: Json | null
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
      delete_user_account: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      toggle_post_like: {
        Args: { p_post_id: string; p_user_id: string }
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

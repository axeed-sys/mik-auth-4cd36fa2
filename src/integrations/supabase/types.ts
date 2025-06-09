export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      payment_plans: {
        Row: {
          amount: number
          billing_cycle: string
          created_at: string
          currency: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          amount: number
          billing_cycle?: string
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          amount?: number
          billing_cycle?: string
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          metadata: Json | null
          paid_at: string | null
          payment_method: string | null
          paystack_reference: string | null
          reference: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          paystack_reference?: string | null
          reference: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          paystack_reference?: string | null
          reference?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "pppoe_users"
            referencedColumns: ["id"]
          },
        ]
      }
      pppoe_users: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          last_login: string | null
          mac_address: string | null
          password: string
          profile: string
          status: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          last_login?: string | null
          mac_address?: string | null
          password: string
          profile: string
          status?: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          last_login?: string | null
          mac_address?: string | null
          password?: string
          profile?: string
          status?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      radius_servers: {
        Row: {
          created_at: string
          id: string
          ip_address: string
          name: string
          port: number
          secret: string
          status: string
          timeout: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address: string
          name: string
          port?: number
          secret: string
          status?: string
          timeout?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string
          name?: string
          port?: number
          secret?: string
          status?: string
          timeout?: number
          updated_at?: string
        }
        Relationships: []
      }
      router_config: {
        Row: {
          api_port: number
          connection_type: string
          created_at: string
          id: string
          ip_address: string
          is_active: boolean
          name: string
          password: string
          ssh_port: number
          updated_at: string
          username: string
        }
        Insert: {
          api_port?: number
          connection_type?: string
          created_at?: string
          id?: string
          ip_address: string
          is_active?: boolean
          name: string
          password: string
          ssh_port?: number
          updated_at?: string
          username: string
        }
        Update: {
          api_port?: number
          connection_type?: string
          created_at?: string
          id?: string
          ip_address?: string
          is_active?: boolean
          name?: string
          password?: string
          ssh_port?: number
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      user_payment_status: {
        Row: {
          auto_block_enabled: boolean
          created_at: string
          id: string
          last_payment_date: string | null
          next_due_date: string
          plan_price: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_block_enabled?: boolean
          created_at?: string
          id?: string
          last_payment_date?: string | null
          next_due_date: string
          plan_price: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_block_enabled?: boolean
          created_at?: string
          id?: string
          last_payment_date?: string | null
          next_due_date?: string
          plan_price?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_payment_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "pppoe_users"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

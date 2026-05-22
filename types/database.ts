// Auto-generated from Supabase type generator
// Este archivo contiene las definiciones generadas de la BD

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
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          role: string
          is_active: boolean
          data_consent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          role?: string
          is_active?: boolean
          data_consent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          role?: string
          is_active?: boolean
          data_consent_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          name: string
          description: string | null
          type: string
          price: number
          duration_months: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: string
          price: number
          duration_months?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: string
          price?: number
          duration_months?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          user_id: string | null
          first_name: string
          last_name: string
          email: string
          phone: string | null
          preferred_date: string
          status: string
          notes: string | null
          data_consent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          preferred_date: string
          status?: string
          notes?: string | null
          data_consent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          preferred_date?: string
          status?: string
          notes?: string | null
          data_consent?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          service_id: string
          starts_at: string
          ends_at: string
          status: string
          auto_renew: boolean
          gateway_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service_id: string
          starts_at?: string
          ends_at: string
          status?: string
          auto_renew?: boolean
          gateway_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service_id?: string
          starts_at?: string
          ends_at?: string
          status?: string
          auto_renew?: boolean
          gateway_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string | null
          subscription_id: string | null
          amount: number
          payment_method: string
          status: string
          notes: string | null
          gateway: string
          gateway_transaction_id: string | null
          gateway_reference: string | null
          gateway_status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          subscription_id?: string | null
          amount: number
          payment_method?: string
          status?: string
          notes?: string | null
          gateway?: string
          gateway_transaction_id?: string | null
          gateway_reference?: string | null
          gateway_status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          subscription_id?: string | null
          amount?: number
          payment_method?: string
          status?: string
          notes?: string | null
          gateway?: string
          gateway_transaction_id?: string | null
          gateway_reference?: string | null
          gateway_status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      v_dashboard_summary: {
        Row: {
          mrr: number
          monthly_income: number
          active_subscriptions: number
          recurring_subscriptions: number
          one_time_subscriptions: number
          pending_reservations: number
        }
      }
      v_monthly_income: {
        Row: {
          month: string
          total: number
        }
      }
      v_service_mix: {
        Row: {
          service_type: string
          count: number
        }
      }
      v_subscriptions_detail: {
        Row: {
          id: string
          user_id: string
          service_id: string
          starts_at: string
          ends_at: string
          status: string
          auto_renew: boolean
          created_at: string
          client_name: string
          service_name: string
          service_type: string
          price: number
        }
      }
      v_transactions_detail: {
        Row: {
          id: string
          user_id: string | null
          subscription_id: string | null
          amount: number
          payment_method: string
          status: string
          notes: string | null
          created_at: string
          client_name: string
        }
      }
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

// Enum types extracted for convenience
export type UserRole = "admin" | "client";
export type ServiceType = "manejo_redes" | "auditoria" | "capacitacion" | "otro";
export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type SubscriptionStatus = "active" | "expired" | "cancelled" | "pending";
export type TransactionStatus = "pending" | "completed" | "failed" | "refunded";
export type PaymentMethod = "cash" | "transfer" | "card" | "pending";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]

export type Views<T extends keyof Database["public"]["Views"]> =
  Database["public"]["Views"][T]["Row"]

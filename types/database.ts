// Tipos de la base de datos de RGL Estudio
// Generado manualmente. Para tipos auto-generados ejecutar:
// npx supabase gen types typescript --local > types/database.ts

export type UserRole = "admin" | "client";
export type ServiceType = "manejo_redes" | "auditoria" | "capacitacion" | "otro";
export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type SubscriptionStatus = "active" | "expired" | "cancelled" | "pending";
export type TransactionStatus = "pending" | "completed" | "failed" | "refunded";
export type PaymentMethod = "cash" | "transfer" | "card" | "pending";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          data_consent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          data_consent_at?: string | null;
        };
        Update: {
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          data_consent_at?: string | null;
        };
      };
      services: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type: ServiceType;
          price: number;
          duration_months: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          type: ServiceType;
          price: number;
          duration_months?: number;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          description?: string | null;
          type?: ServiceType;
          price?: number;
          duration_months?: number;
          is_active?: boolean;
        };
      };
      reservations: {
        Row: {
          id: string;
          user_id: string | null;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          preferred_date: string;
          status: ReservationStatus;
          notes: string | null;
          data_consent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string | null;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          preferred_date: string;
          status?: ReservationStatus;
          notes?: string | null;
          data_consent: boolean;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          preferred_date?: string;
          status?: ReservationStatus;
          notes?: string | null;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          service_id: string;
          starts_at: string;
          ends_at: string;
          status: SubscriptionStatus;
          auto_renew: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          service_id: string;
          starts_at?: string;
          ends_at: string;
          status?: SubscriptionStatus;
          auto_renew?: boolean;
        };
        Update: {
          starts_at?: string;
          ends_at?: string;
          status?: SubscriptionStatus;
          auto_renew?: boolean;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string | null;
          subscription_id: string | null;
          amount: number;
          payment_method: PaymentMethod;
          status: TransactionStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string | null;
          subscription_id?: string | null;
          amount: number;
          payment_method?: PaymentMethod;
          status?: TransactionStatus;
          notes?: string | null;
        };
        Update: {
          amount?: number;
          payment_method?: PaymentMethod;
          status?: TransactionStatus;
          notes?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      service_type: ServiceType;
      reservation_status: ReservationStatus;
      subscription_status: SubscriptionStatus;
      transaction_status: TransactionStatus;
      payment_method: PaymentMethod;
    };
  };
};

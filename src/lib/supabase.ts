import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Browser client for SSR
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Server-side client (for API routes)
export function createSupabaseServerClient() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          organizer_id: string
          name: string
          description: string | null
          start_date: string
          end_date: string
          location: string | null
          is_online: boolean
          image_url: string | null
          category: string | null
          status: 'draft' | 'published' | 'cancelled'
          pricing_plan: 'flat_fee' | 'per_ticket'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organizer_id: string
          name: string
          description?: string | null
          start_date: string
          end_date: string
          location?: string | null
          is_online?: boolean
          image_url?: string | null
          category?: string | null
          status?: 'draft' | 'published' | 'cancelled'
          pricing_plan?: 'flat_fee' | 'per_ticket'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organizer_id?: string
          name?: string
          description?: string | null
          start_date?: string
          end_date?: string
          location?: string | null
          is_online?: boolean
          image_url?: string | null
          category?: string | null
          status?: 'draft' | 'published' | 'cancelled'
          pricing_plan?: 'flat_fee' | 'per_ticket'
          created_at?: string
          updated_at?: string
        }
      }
      ticket_types: {
        Row: {
          id: string
          event_id: string
          name: string
          description: string | null
          price: number
          quantity_available: number | null
          quantity_sold: number
          sales_start_date: string | null
          sales_end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          description?: string | null
          price: number
          quantity_available?: number | null
          quantity_sold?: number
          sales_start_date?: string | null
          sales_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          description?: string | null
          price?: number
          quantity_available?: number | null
          quantity_sold?: number
          sales_start_date?: string | null
          sales_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          event_id: string
          buyer_email: string
          buyer_name: string
          total_amount: number
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_intent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          buyer_email: string
          buyer_name: string
          total_amount: number
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          buyer_email?: string
          buyer_name?: string
          total_amount?: number
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          order_id: string
          event_id: string
          ticket_type_id: string
          attendee_name: string
          attendee_email: string
          qr_code: string
          is_checked_in: boolean
          checked_in_at: string | null
          checked_in_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          event_id: string
          ticket_type_id: string
          attendee_name: string
          attendee_email: string
          qr_code: string
          is_checked_in?: boolean
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          event_id?: string
          ticket_type_id?: string
          attendee_name?: string
          attendee_email?: string
          qr_code?: string
          is_checked_in?: boolean
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      check_ins: {
        Row: {
          id: string
          ticket_id: string
          event_id: string
          checked_in_by: string
          checked_in_at: string
          device_info: any | null
        }
        Insert: {
          id?: string
          ticket_id: string
          event_id: string
          checked_in_by: string
          checked_in_at?: string
          device_info?: any | null
        }
        Update: {
          id?: string
          ticket_id?: string
          event_id?: string
          checked_in_by?: string
          checked_in_at?: string
          device_info?: any | null
        }
      }
      event_analytics: {
        Row: {
          id: string
          event_id: string
          total_tickets_sold: number
          total_revenue: number
          total_checked_in: number
          last_updated: string
        }
        Insert: {
          id?: string
          event_id: string
          total_tickets_sold?: number
          total_revenue?: number
          total_checked_in?: number
          last_updated?: string
        }
        Update: {
          id?: string
          event_id?: string
          total_tickets_sold?: number
          total_revenue?: number
          total_checked_in?: number
          last_updated?: string
        }
      }
    }
  }
}


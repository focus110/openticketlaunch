/* eslint-disable @typescript-eslint/no-explicit-any */
export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Event {
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
  organizer?: User
  ticket_types?: TicketType[]
  analytics?: EventAnalytics
}

export interface TicketType {
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

export interface Order {
  id: string
  event_id: string
  buyer_email: string
  buyer_name: string
  total_amount: number
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_intent_id: string | null
  created_at: string
  updated_at: string
  tickets?: Ticket[]
  event?: Event
}

export interface Ticket {
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
  ticket_type?: TicketType
  event?: Event
  order?: Order
}

export interface CheckIn {
  id: string
  ticket_id: string
  event_id: string
  checked_in_by: string
  checked_in_at: string
  device_info: any | null
}

export interface EventAnalytics {
  id: string
  event_id: string
  total_tickets_sold: number
  total_revenue: number
  total_checked_in: number
  last_updated: string
}

// Form types
export interface CreateEventForm {
  name: string
  description: string
  start_date: string
  end_date: string
  location: string
  is_online: boolean
  category: string
  image_url?: string
}

export interface CreateTicketTypeForm {
  name: string
  description?: string
  price: number
  quantity_available?: number
  sales_start_date?: string
  sales_end_date?: string
}

export interface CheckoutForm {
  buyer_name: string
  buyer_email: string
  tickets: {
    ticket_type_id: string
    quantity: number
    attendee_names: string[]
    attendee_emails: string[]
  }[]
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  total_pages: number
}

// Dashboard types
export interface DashboardStats {
  total_events: number
  total_tickets_sold: number
  total_revenue: number
  total_checked_in: number
  recent_orders: Order[]
  upcoming_events: Event[]
}

// Event categories
export const EVENT_CATEGORIES = [
  'Music',
  'Conference',
  'Workshop',
  'Seminar',
  'Networking',
  'Sports',
  'Arts & Culture',
  'Food & Drink',
  'Technology',
  'Business',
  'Education',
  'Health & Wellness',
  'Entertainment',
  'Other'
] as const

export type EventCategory = typeof EVENT_CATEGORIES[number]

// Pricing plans
export const PRICING_PLANS = {
  FLAT_FEE: {
    id: 'flat_fee' as const,
    name: 'Flat Fee',
    price: 20000,
    currency: 'NGN',
    description: 'NGN20,000/month for unlimited events & tickets',
    benefits: ['No per-ticket fees', 'Unlimited events', 'Best for regular events']
  },
  PER_TICKET: {
    id: 'per_ticket' as const,
    name: 'Per-Ticket Fee',
    percentage: 2.5,
    fixed_fee: 50,
    currency: 'NGN',
    description: '2.5% + NGN50 per ticket',
    benefits: ['Only pay when you sell', 'Perfect for trying us out', 'No monthly commitment']
  }
} as const

export type PricingPlan = keyof typeof PRICING_PLANS

// QR Code data structure
export interface QRCodeData {
  ticketId: string
  eventId: string
  timestamp: number
}

// Check-in scanner types
export interface ScanResult {
  success: boolean
  ticket?: Ticket
  error?: string
  message?: string
}

export interface CheckInStats {
  total_tickets: number
  checked_in: number
  remaining: number
  percentage: number
}


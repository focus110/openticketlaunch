# Database Schema for Event Ticketing App

## Tables Overview

### 1. users (extends Supabase auth.users)
```sql
-- This table extends the built-in Supabase auth.users
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. events
```sql
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID REFERENCES public.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  is_online BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  category TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled')),
  pricing_plan TEXT DEFAULT 'per_ticket' CHECK (pricing_plan IN ('flat_fee', 'per_ticket')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. ticket_types
```sql
CREATE TABLE public.ticket_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  quantity_available INTEGER,
  quantity_sold INTEGER DEFAULT 0,
  sales_start_date TIMESTAMP WITH TIME ZONE,
  sales_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. orders
```sql
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_intent_id TEXT, -- Stripe payment intent ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. tickets
```sql
CREATE TABLE public.tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) NOT NULL,
  ticket_type_id UUID REFERENCES public.ticket_types(id) NOT NULL,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  qr_code TEXT UNIQUE NOT NULL, -- Unique QR code for each ticket
  is_checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checked_in_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. check_ins
```sql
CREATE TABLE public.check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES public.tickets(id) NOT NULL,
  event_id UUID REFERENCES public.events(id) NOT NULL,
  checked_in_by UUID REFERENCES public.users(id) NOT NULL,
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  device_info JSONB -- Store device/browser info for audit
);
```

### 7. event_analytics
```sql
CREATE TABLE public.event_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  total_tickets_sold INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  total_checked_in INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Row Level Security (RLS) Policies

### users table
- Users can only read/update their own profile
- Public read access for basic user info (name, avatar) for event organizers

### events table
- Organizers can CRUD their own events
- Public read access for published events
- Draft events only visible to organizers

### ticket_types table
- Organizers can CRUD ticket types for their events
- Public read access for published events

### orders table
- Buyers can read their own orders
- Organizers can read orders for their events

### tickets table
- Ticket holders can read their own tickets
- Organizers can read tickets for their events
- Check-in staff can update check-in status

### check_ins table
- Organizers and check-in staff can read/write for their events

### event_analytics table
- Organizers can read analytics for their events

## Indexes for Performance

```sql
-- Events
CREATE INDEX idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_start_date ON public.events(start_date);

-- Ticket Types
CREATE INDEX idx_ticket_types_event_id ON public.ticket_types(event_id);

-- Orders
CREATE INDEX idx_orders_event_id ON public.orders(event_id);
CREATE INDEX idx_orders_buyer_email ON public.orders(buyer_email);

-- Tickets
CREATE INDEX idx_tickets_order_id ON public.tickets(order_id);
CREATE INDEX idx_tickets_event_id ON public.tickets(event_id);
CREATE INDEX idx_tickets_qr_code ON public.tickets(qr_code);
CREATE INDEX idx_tickets_attendee_email ON public.tickets(attendee_email);

-- Check-ins
CREATE INDEX idx_check_ins_event_id ON public.check_ins(event_id);
CREATE INDEX idx_check_ins_ticket_id ON public.check_ins(ticket_id);
```

## Functions and Triggers

### Update Analytics Trigger
```sql
-- Function to update event analytics when tickets are sold or checked in
CREATE OR REPLACE FUNCTION update_event_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update analytics when tickets are created, updated, or deleted
  INSERT INTO public.event_analytics (event_id, total_tickets_sold, total_revenue, total_checked_in)
  SELECT 
    NEW.event_id,
    COUNT(*),
    SUM(tt.price),
    COUNT(*) FILTER (WHERE t.is_checked_in = true)
  FROM public.tickets t
  JOIN public.ticket_types tt ON t.ticket_type_id = tt.id
  WHERE t.event_id = NEW.event_id
  GROUP BY t.event_id
  ON CONFLICT (event_id) DO UPDATE SET
    total_tickets_sold = EXCLUDED.total_tickets_sold,
    total_revenue = EXCLUDED.total_revenue,
    total_checked_in = EXCLUDED.total_checked_in,
    last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on tickets table
CREATE TRIGGER trigger_update_analytics
  AFTER INSERT OR UPDATE OR DELETE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION update_event_analytics();
```

## Key Features Supported by Schema

1. **Multi-ticket Events**: Events can have multiple ticket types with different prices
2. **QR Code Check-ins**: Each ticket has a unique QR code for scanning
3. **Order Management**: Orders can contain multiple tickets
4. **Analytics**: Real-time analytics for event organizers
5. **Audit Trail**: Check-in history with timestamps and staff info
6. **Flexible Pricing**: Support for both flat fee and per-ticket pricing models
7. **Payment Integration**: Ready for Stripe integration with payment intent tracking


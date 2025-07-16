-- Event Ticketing App - Supabase Database Setup
-- Run this script in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
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

-- Create ticket_types table
CREATE TABLE IF NOT EXISTS public.ticket_types (
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

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  ticket_type_id UUID REFERENCES public.ticket_types(id) ON DELETE CASCADE NOT NULL,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  qr_code TEXT UNIQUE NOT NULL,
  is_checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checked_in_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create check_ins table
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  checked_in_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  device_info JSONB
);

-- Create event_analytics table
CREATE TABLE IF NOT EXISTS public.event_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_tickets_sold INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  total_checked_in INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);

CREATE INDEX IF NOT EXISTS idx_ticket_types_event_id ON public.ticket_types(event_id);

CREATE INDEX IF NOT EXISTS idx_orders_event_id ON public.orders(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_email ON public.orders(buyer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);

CREATE INDEX IF NOT EXISTS idx_tickets_order_id ON public.tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON public.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_qr_code ON public.tickets(qr_code);
CREATE INDEX IF NOT EXISTS idx_tickets_attendee_email ON public.tickets(attendee_email);
CREATE INDEX IF NOT EXISTS idx_tickets_is_checked_in ON public.tickets(is_checked_in);

CREATE INDEX IF NOT EXISTS idx_check_ins_event_id ON public.check_ins(event_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_ticket_id ON public.check_ins(ticket_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_checked_in_at ON public.check_ins(checked_in_at);

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update event analytics
CREATE OR REPLACE FUNCTION public.update_event_analytics()
RETURNS TRIGGER AS $$
DECLARE
  event_id_to_update UUID;
BEGIN
  -- Determine which event to update based on the operation
  IF TG_OP = 'DELETE' THEN
    event_id_to_update := OLD.event_id;
  ELSE
    event_id_to_update := NEW.event_id;
  END IF;

  -- Update or insert analytics
  INSERT INTO public.event_analytics (
    event_id,
    total_tickets_sold,
    total_revenue,
    total_checked_in,
    last_updated
  )
  SELECT 
    t.event_id,
    COUNT(t.id),
    COALESCE(SUM(tt.price), 0),
    COUNT(t.id) FILTER (WHERE t.is_checked_in = true),
    NOW()
  FROM public.tickets t
  JOIN public.ticket_types tt ON t.ticket_type_id = tt.id
  WHERE t.event_id = event_id_to_update
  GROUP BY t.event_id
  ON CONFLICT (event_id) DO UPDATE SET
    total_tickets_sold = EXCLUDED.total_tickets_sold,
    total_revenue = EXCLUDED.total_revenue,
    total_checked_in = EXCLUDED.total_checked_in,
    last_updated = EXCLUDED.last_updated;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for analytics updates
DROP TRIGGER IF EXISTS trigger_update_analytics_on_tickets ON public.tickets;
CREATE TRIGGER trigger_update_analytics_on_tickets
  AFTER INSERT OR UPDATE OR DELETE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_event_analytics();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ticket_types_updated_at BEFORE UPDATE ON public.ticket_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone" ON public.users
  FOR SELECT USING (true);

-- RLS Policies for events table
CREATE POLICY "Organizers can manage their own events" ON public.events
  FOR ALL USING (auth.uid() = organizer_id);

CREATE POLICY "Published events are viewable by everyone" ON public.events
  FOR SELECT USING (status = 'published' OR auth.uid() = organizer_id);

-- RLS Policies for ticket_types table
CREATE POLICY "Organizers can manage ticket types for their events" ON public.ticket_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = ticket_types.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Ticket types are viewable for published events" ON public.ticket_types
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = ticket_types.event_id 
      AND events.status = 'published'
    )
  );

-- RLS Policies for orders table
CREATE POLICY "Buyers can view their own orders" ON public.orders
  FOR SELECT USING (buyer_email = auth.email());

CREATE POLICY "Organizers can view orders for their events" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = orders.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Orders can be updated by system" ON public.orders
  FOR UPDATE USING (true);

-- RLS Policies for tickets table
CREATE POLICY "Ticket holders can view their own tickets" ON public.tickets
  FOR SELECT USING (attendee_email = auth.email());

CREATE POLICY "Organizers can view tickets for their events" ON public.tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = tickets.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can update check-in status" ON public.tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = tickets.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "System can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (true);

-- RLS Policies for check_ins table
CREATE POLICY "Organizers can manage check-ins for their events" ON public.check_ins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = check_ins.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

-- RLS Policies for event_analytics table
CREATE POLICY "Organizers can view analytics for their events" ON public.event_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = event_analytics.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "System can manage analytics" ON public.event_analytics
  FOR ALL USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Create a function to get event with analytics
CREATE OR REPLACE FUNCTION public.get_event_with_analytics(event_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'event', row_to_json(e.*),
    'analytics', row_to_json(ea.*),
    'ticket_types', (
      SELECT json_agg(row_to_json(tt.*))
      FROM public.ticket_types tt
      WHERE tt.event_id = e.id
    )
  )
  INTO result
  FROM public.events e
  LEFT JOIN public.event_analytics ea ON ea.event_id = e.id
  WHERE e.id = event_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check in a ticket
CREATE OR REPLACE FUNCTION public.check_in_ticket(
  ticket_qr_code TEXT,
  event_id UUID,
  checked_in_by_id UUID DEFAULT auth.uid()
)
RETURNS JSON AS $$
DECLARE
  ticket_record public.tickets%ROWTYPE;
  result JSON;
BEGIN
  -- Find the ticket
  SELECT * INTO ticket_record
  FROM public.tickets
  WHERE qr_code = ticket_qr_code AND event_id = check_in_ticket.event_id;
  
  -- Check if ticket exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Ticket not found'
    );
  END IF;
  
  -- Check if already checked in
  IF ticket_record.is_checked_in THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Ticket already checked in',
      'checked_in_at', ticket_record.checked_in_at
    );
  END IF;
  
  -- Update ticket as checked in
  UPDATE public.tickets
  SET 
    is_checked_in = true,
    checked_in_at = NOW(),
    checked_in_by = checked_in_by_id
  WHERE id = ticket_record.id;
  
  -- Insert check-in record
  INSERT INTO public.check_ins (ticket_id, event_id, checked_in_by)
  VALUES (ticket_record.id, check_in_ticket.event_id, checked_in_by_id);
  
  -- Return success with ticket info
  SELECT json_build_object(
    'success', true,
    'ticket', json_build_object(
      'id', t.id,
      'attendee_name', t.attendee_name,
      'attendee_email', t.attendee_email,
      'ticket_type', tt.name,
      'checked_in_at', t.checked_in_at
    )
  )
  INTO result
  FROM public.tickets t
  JOIN public.ticket_types tt ON t.ticket_type_id = tt.id
  WHERE t.id = ticket_record.id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- Chat Messages Table
-- Run this in your Supabase SQL Editor
-- ============================================

create table chat_messages (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references appointment_bookings(id) on delete cascade not null,
  sender_id uuid references auth.users(id) not null,
  content text,
  file_url text,
  file_name text,
  file_type text,
  created_at timestamptz default now()
);

-- Enable Realtime on this table
alter publication supabase_realtime add table chat_messages;

-- RLS: only the doctor or patient in the booking can read/write
alter table chat_messages enable row level security;

create policy "Users can read their own chat messages"
  on chat_messages for select using (
    sender_id = auth.uid()
    or booking_id in (
      select id from appointment_bookings
      where patient_id = auth.uid() or doctor_id = auth.uid()
    )
  );

create policy "Users can insert their own chat messages"
  on chat_messages for insert with check (
    sender_id = auth.uid()
    and booking_id in (
      select id from appointment_bookings
      where patient_id = auth.uid() or doctor_id = auth.uid()
    )
  );

-- ============================================
-- Storage Bucket: chat-files
-- Create this in Supabase Dashboard > Storage
-- Name: chat-files
-- Public: true
-- Allowed MIME types: image/*, application/pdf, 
--   application/msword, text/plain
-- Max file size: 10MB
-- ============================================

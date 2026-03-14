-- ============================================
-- Medical Reports Migration (Idempotent)
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Create Table (only if it doesn't exist)
create table if not exists patient_reports (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references auth.users(id) on delete cascade not null,
  file_url text not null,
  file_name text not null,
  file_type text,
  created_at timestamptz default now()
);

-- 2. Enable RLS
alter table patient_reports enable row level security;

-- 3. Table Policies (Safe to run multiple times)
drop policy if exists "Patients can manage their own reports" on patient_reports;
create policy "Patients can manage their own reports"
  on patient_reports for all using (
    auth.uid() = patient_id
  );

drop policy if exists "Doctors can view reports of their patients" on patient_reports;
create policy "Doctors can view reports of their patients"
  on patient_reports for select using (
    exists (
      select 1 from appointment_bookings
      where doctor_id = auth.uid() and patient_id = patient_reports.patient_id
    )
  );

-- 4. Storage Policies (Safe to run multiple times)
-- IMPORTANT: These apply to storage.objects table
drop policy if exists "Allow Authenticated Upload" on storage.objects;
CREATE POLICY "Allow Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'medical-reports' AND (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Allow Individual View" on storage.objects;
CREATE POLICY "Allow Individual View"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'medical-reports' AND (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Allow Individual Delete" on storage.objects;
CREATE POLICY "Allow Individual Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'medical-reports' AND (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Allow Doctors to View Reports" on storage.objects;
CREATE POLICY "Allow Doctors to View Reports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-reports' 
  AND EXISTS (
    SELECT 1 FROM appointment_bookings 
    WHERE doctor_id = auth.uid() 
    AND patient_id = (storage.foldername(name))[1]::uuid
  )
);

-- ============================================
-- Storage Bucket: medical-reports
-- 1. Create this in Supabase Dashboard > Storage
-- 2. Name: medical-reports
-- 3. Public: true (to allow easy viewing via URLs)
-- ============================================

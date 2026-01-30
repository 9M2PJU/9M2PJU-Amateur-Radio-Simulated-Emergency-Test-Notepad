-- Create system_config table to store global settings
create table if not exists public.system_config (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_by uuid references auth.users(id)
);

-- Turn on RLS
alter table public.system_config enable row level security;

-- Allow read access to everyone (public) or authenticated users
create policy "Allow public read access"
  on public.system_config for select
  using (true);

-- Allow insert/update only for Super Admins
-- Note: This assumes you have a profiles table with is_super_admin column
create policy "Allow update for super admins"
  on public.system_config for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.is_super_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.is_super_admin = true
    )
  );

create policy "Allow insert for super admins"
  on public.system_config for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.is_super_admin = true
    )
  );

-- Insert default configuration for donation popup duration (10 seconds)
insert into public.system_config (key, value, description)
values (
  'donation_popup_duration',
  '{"seconds": 10}',
  'Duration in seconds for the donation popup countdown'
)
on conflict (key) do nothing;

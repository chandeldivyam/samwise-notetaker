-- supabase/migrations/20240319000000_create_recordings_table.sql
create table recordings (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  s3_key text not null,
  original_filename text not null,
  file_type text not null,
  file_size bigint not null,
  duration integer,
  user_id uuid references auth.users not null
);

-- Create an RLS policy
alter table recordings enable row level security;

create policy "Users can create their own recordings" on recordings
  for insert with check (auth.uid() = user_id);

create policy "Users can view their own recordings" on recordings
  for select using (auth.uid() = user_id);

create policy "Users can update their own recordings" on recordings
  for update using (auth.uid() = user_id);

create policy "Users can delete their own recordings" on recordings
  for delete using (auth.uid() = user_id);

-- Create updated_at trigger
create trigger update_recordings_updated_at
    before update on recordings
    for each row
    execute function update_updated_at_column();
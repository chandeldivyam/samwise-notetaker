-- ./supabase/migrations/4_create_transcription_segments.sql
create table transcription_segments (
  id uuid default uuid_generate_v4() primary key,
  recording_id uuid references recordings(id) on delete cascade not null,
  speaker_label text not null,
  original_speaker_number integer not null,
  person_id uuid references people(id) on delete set null,
  start_time numeric not null,
  end_time numeric not null,
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table transcription_segments enable row level security;
create policy "Users can view their own segments"
  on transcription_segments for select
  using (auth.uid() = (select user_id from recordings where id = recording_id));
  
create policy "Users can update their own segments"
  on transcription_segments for update
  using (auth.uid() = (select user_id from recordings where id = recording_id));

create policy "Users can insert segments for their recordings"
  on transcription_segments for insert
  with check (auth.uid() = (select user_id from recordings where id = recording_id));

-- Create updated_at trigger
create trigger update_transcription_segments_updated_at
    before update on transcription_segments
    for each row
    execute function update_updated_at_column();
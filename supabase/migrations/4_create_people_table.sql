-- ./supabase/migrations/2_create_people_table.sql
create table if not exists people (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    email text not null,
    tags text[] default array[]::text[],
    description text,
    user_id uuid references auth.users(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create unique constraint on email per user
create unique index people_email_user_id_idx on people (email, user_id);

-- Create RLS policies
alter table people enable row level security;

create policy "Users can create their own people entries"
    on people for insert
    with check (auth.uid() = user_id);

create policy "Users can view their own people entries"
    on people for select
    using (auth.uid() = user_id);

create policy "Users can update their own people entries"
    on people for update
    using (auth.uid() = user_id);

create policy "Users can delete their own people entries"
    on people for delete
    using (auth.uid() = user_id);

-- Reuse the existing updated_at trigger
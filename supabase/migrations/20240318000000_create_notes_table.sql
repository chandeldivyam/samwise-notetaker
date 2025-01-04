create table if not exists notes (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    content text,
    user_id uuid references auth.users(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table notes enable row level security;

create policy "Users can create their own notes"
    on notes for insert
    with check (auth.uid() = user_id);

create policy "Users can view their own notes"
    on notes for select
    using (auth.uid() = user_id);

create policy "Users can update their own notes"
    on notes for update
    using (auth.uid() = user_id);

create policy "Users can delete their own notes"
    on notes for delete
    using (auth.uid() = user_id);

-- Create updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_notes_updated_at
    before update on notes
    for each row
    execute function update_updated_at_column(); 
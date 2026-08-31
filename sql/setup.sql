create table if not exists public.votes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  candidate text not null check (candidate in ('left', 'right')),
  created_at timestamptz not null default now()
);

revoke all on table public.votes from anon, authenticated;
grant select, insert, update on table public.votes to authenticated;

alter table public.votes enable row level security;

drop policy if exists "Everyone can read vote totals" on public.votes;
drop policy if exists "Users can cast their own vote" on public.votes;
drop policy if exists "Users can change their own vote" on public.votes;

create policy "Everyone can read vote totals"
on public.votes
for select
to authenticated
using (true);

create policy "Users can cast their own vote"
on public.votes
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can change their own vote"
on public.votes
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

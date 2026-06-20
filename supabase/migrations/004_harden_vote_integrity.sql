do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.poll_options'::regclass
      and conname = 'poll_options_activity_id_id_key'
  ) then
    alter table public.poll_options
      add constraint poll_options_activity_id_id_key unique (activity_id, id);
  end if;
end $$;

do $$
declare
  invalid_vote_count integer;
begin
  select count(*)
  into invalid_vote_count
  from public.votes as v
  left join public.poll_options as o
    on o.id = v.option_id
   and o.activity_id = v.activity_id
  where o.id is null;

  if invalid_vote_count > 0 then
    raise exception
      'Cannot add votes_activity_option_fkey: % existing votes reference an option from a different activity.',
      invalid_vote_count;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.votes'::regclass
      and conname = 'votes_activity_option_fkey'
  ) then
    alter table public.votes
      add constraint votes_activity_option_fkey
      foreign key (activity_id, option_id)
      references public.poll_options(activity_id, id)
      on delete cascade;
  end if;
end $$;

alter policy "public can submit votes"
  on public.votes
  with check (
    activity_id in (
      select id
      from public.activities
      where status = 'open'
    )
  );

do $$
begin
  if not exists (
    select 1
    from pg_publication as p
    join pg_publication_rel as pr
      on pr.prpubid = p.oid
    where p.pubname = 'supabase_realtime'
      and pr.prrelid = 'public.participants'::regclass
  ) then
    alter publication supabase_realtime add table public.participants;
  end if;
end $$;

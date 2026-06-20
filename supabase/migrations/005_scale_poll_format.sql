alter table public.poll_options
  add column if not exists scale_value integer;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.activities'::regclass
      and conname = 'activities_type_check'
  ) then
    alter table public.activities
      drop constraint activities_type_check;
  end if;

  alter table public.activities
    add constraint activities_type_check
    check (type in ('multiple_choice', 'scale'));
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.poll_options'::regclass
      and conname = 'poll_options_scale_value_check'
  ) then
    alter table public.poll_options
      add constraint poll_options_scale_value_check
      check (scale_value is null or scale_value between -3 and 3);
  end if;
end $$;

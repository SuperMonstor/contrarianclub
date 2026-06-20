-- Allow the presenter to hold a dedicated debate-swing stage, advanced by the
-- host after the post-debate results have been shown.
alter table public.presentation_state
  drop constraint if exists presentation_state_mode_check;

alter table public.presentation_state
  add constraint presentation_state_mode_check
  check (mode in ('join', 'poll', 'results', 'swing'));

alter table public.activities
  add column if not exists scale_left_label text,
  add column if not exists scale_center_label text,
  add column if not exists scale_right_label text;

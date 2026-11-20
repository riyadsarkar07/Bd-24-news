alter table public.articles add column label_translations jsonb not null default '{}'::jsonb check (jsonb_typeof(label_translations) = 'object');

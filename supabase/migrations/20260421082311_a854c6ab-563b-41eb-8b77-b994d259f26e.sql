ALTER TABLE public.challenge_participations
ADD COLUMN IF NOT EXISTS completed_dates text[] NOT NULL DEFAULT '{}'::text[];
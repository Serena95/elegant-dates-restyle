-- Add completed_dates array to track which days a challenge was completed (supports retroactive)
ALTER TABLE public.challenges
ADD COLUMN IF NOT EXISTS completed_dates text[] NOT NULL DEFAULT '{}';

-- Index to speed user lookup
CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON public.challenges(user_id);
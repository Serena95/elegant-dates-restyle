-- 1) Profiles: blocca auto-escalation di premium/stripe via RLS column-level
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND premium IS NOT DISTINCT FROM (SELECT p.premium FROM public.profiles p WHERE p.user_id = auth.uid())
    AND premium_expires IS NOT DISTINCT FROM (SELECT p.premium_expires FROM public.profiles p WHERE p.user_id = auth.uid())
    AND stripe_customer_id IS NOT DISTINCT FROM (SELECT p.stripe_customer_id FROM public.profiles p WHERE p.user_id = auth.uid())
  );

-- 2) Leaderboard: rimuovi INSERT/UPDATE client e usa una RPC SECURITY DEFINER
DROP POLICY IF EXISTS "Users can upsert own leaderboard" ON public.leaderboard;
DROP POLICY IF EXISTS "Users can update own leaderboard" ON public.leaderboard;

CREATE OR REPLACE FUNCTION public.increment_leaderboard(p_xp_gained integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_week_start text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_xp_gained IS NULL OR p_xp_gained < 0 OR p_xp_gained > 1000 THEN
    RAISE EXCEPTION 'Invalid xp value';
  END IF;

  -- ISO week start (Monday) in UTC
  v_week_start := to_char(date_trunc('week', (now() AT TIME ZONE 'UTC'))::date, 'YYYY-MM-DD');

  INSERT INTO public.leaderboard (user_id, week_start, xp_week, workouts_week, rank)
  VALUES (v_user_id, v_week_start, p_xp_gained, 1, 0)
  ON CONFLICT (user_id, week_start)
  DO UPDATE SET
    xp_week = public.leaderboard.xp_week + EXCLUDED.xp_week,
    workouts_week = public.leaderboard.workouts_week + 1;
END;
$$;

-- Ensure unique constraint exists for ON CONFLICT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leaderboard_user_week_unique'
  ) THEN
    ALTER TABLE public.leaderboard
      ADD CONSTRAINT leaderboard_user_week_unique UNIQUE (user_id, week_start);
  END IF;
END$$;

REVOKE ALL ON FUNCTION public.increment_leaderboard(integer) FROM public;
GRANT EXECUTE ON FUNCTION public.increment_leaderboard(integer) TO authenticated;
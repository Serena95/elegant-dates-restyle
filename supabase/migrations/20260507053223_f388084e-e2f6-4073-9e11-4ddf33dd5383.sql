
ALTER TABLE public.community_posts ADD CONSTRAINT post_text_max CHECK (char_length(text) <= 1000);
ALTER TABLE public.community_comments ADD CONSTRAINT comment_text_max CHECK (char_length(text) <= 500);

CREATE OR REPLACE FUNCTION public.add_workout_xp(p_streak integer)
 RETURNS TABLE(xp_gained integer, new_xp integer, new_level integer, leveled_up boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_streak integer;
  v_gain integer;
  v_old_xp integer;
  v_old_level integer;
  v_new_xp integer;
  v_new_level integer;
  v_today text;
  v_has_workout boolean;
  v_already_awarded boolean;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_today := to_char((now() AT TIME ZONE 'UTC')::date, 'YYYY-MM-DD');

  -- Require a completed workout today
  SELECT EXISTS(
    SELECT 1 FROM public.workout_history
    WHERE user_id = v_user_id AND data_key = v_today AND completato = true
  ) INTO v_has_workout;

  IF NOT v_has_workout THEN
    RAISE EXCEPTION 'No workout completed today';
  END IF;

  -- Only award XP once per calendar day (UTC)
  SELECT EXISTS(
    SELECT 1 FROM public.leaderboard
    WHERE user_id = v_user_id
      AND week_start = to_char(date_trunc('week', (now() AT TIME ZONE 'UTC'))::date, 'YYYY-MM-DD')
      AND created_at::date = (now() AT TIME ZONE 'UTC')::date
  ) INTO v_already_awarded;

  v_streak := GREATEST(0, LEAST(COALESCE(p_streak, 0), 30));
  v_gain := 50 + (v_streak * 10);

  SELECT COALESCE(xp, 0), COALESCE(level, 1)
    INTO v_old_xp, v_old_level
  FROM public.profiles WHERE user_id = v_user_id;

  IF v_already_awarded THEN
    -- Return current state without adding XP again
    RETURN QUERY SELECT 0, COALESCE(v_old_xp,0), COALESCE(v_old_level,1), false;
    RETURN;
  END IF;

  v_new_xp := COALESCE(v_old_xp, 0) + v_gain;

  v_new_level := CASE
    WHEN v_new_xp >= 3000 THEN 5
    WHEN v_new_xp >= 1500 THEN 4
    WHEN v_new_xp >= 600  THEN 3
    WHEN v_new_xp >= 200  THEN 2
    ELSE 1
  END;

  UPDATE public.profiles
    SET xp = v_new_xp, level = v_new_level
  WHERE user_id = v_user_id;

  RETURN QUERY SELECT v_gain, v_new_xp, v_new_level, (v_new_level > COALESCE(v_old_level, 1));
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_leaderboard(p_xp_gained integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_week_start text;
  v_today text;
  v_has_workout boolean;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_xp_gained IS NULL OR p_xp_gained < 0 OR p_xp_gained > 1000 THEN
    RAISE EXCEPTION 'Invalid xp value';
  END IF;

  v_today := to_char((now() AT TIME ZONE 'UTC')::date, 'YYYY-MM-DD');

  SELECT EXISTS(
    SELECT 1 FROM public.workout_history
    WHERE user_id = v_user_id AND data_key = v_today AND completato = true
  ) INTO v_has_workout;

  IF NOT v_has_workout THEN
    RAISE EXCEPTION 'No workout completed today';
  END IF;

  v_week_start := to_char(date_trunc('week', (now() AT TIME ZONE 'UTC'))::date, 'YYYY-MM-DD');

  -- One increment per day per user
  IF EXISTS(
    SELECT 1 FROM public.leaderboard
    WHERE user_id = v_user_id
      AND week_start = v_week_start
      AND created_at::date = (now() AT TIME ZONE 'UTC')::date
  ) THEN
    RETURN;
  END IF;

  INSERT INTO public.leaderboard (user_id, week_start, xp_week, workouts_week, rank)
  VALUES (v_user_id, v_week_start, p_xp_gained, 1, 0)
  ON CONFLICT (user_id, week_start)
  DO UPDATE SET
    xp_week = public.leaderboard.xp_week + EXCLUDED.xp_week,
    workouts_week = public.leaderboard.workouts_week + 1;
END;
$function$;

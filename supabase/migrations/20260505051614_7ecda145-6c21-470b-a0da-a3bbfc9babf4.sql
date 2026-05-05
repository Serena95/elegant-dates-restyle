
-- 1) Tighten profiles UPDATE policy to also prevent client-side xp/level tampering
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND NOT (premium IS DISTINCT FROM (SELECT p.premium FROM public.profiles p WHERE p.user_id = auth.uid()))
  AND NOT (premium_expires IS DISTINCT FROM (SELECT p.premium_expires FROM public.profiles p WHERE p.user_id = auth.uid()))
  AND NOT (stripe_customer_id IS DISTINCT FROM (SELECT p.stripe_customer_id FROM public.profiles p WHERE p.user_id = auth.uid()))
  AND NOT (xp IS DISTINCT FROM (SELECT p.xp FROM public.profiles p WHERE p.user_id = auth.uid()))
  AND NOT (level IS DISTINCT FROM (SELECT p.level FROM public.profiles p WHERE p.user_id = auth.uid()))
);

-- 2) SECURITY DEFINER RPC to safely award XP (capped server-side)
CREATE OR REPLACE FUNCTION public.add_workout_xp(p_streak integer)
RETURNS TABLE(xp_gained integer, new_xp integer, new_level integer, leveled_up boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_streak integer;
  v_gain integer;
  v_old_xp integer;
  v_old_level integer;
  v_new_xp integer;
  v_new_level integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_streak := GREATEST(0, LEAST(COALESCE(p_streak, 0), 30));
  v_gain := 50 + (v_streak * 10); -- mirrors XP_PER_WORKOUT + streak bonus, capped

  SELECT COALESCE(xp, 0), COALESCE(level, 1)
    INTO v_old_xp, v_old_level
  FROM public.profiles WHERE user_id = v_user_id;

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
$$;

REVOKE ALL ON FUNCTION public.add_workout_xp(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_workout_xp(integer) TO authenticated;

-- 3) Realtime channel-level authorization: restrict to community_posts and per-user channels
DROP POLICY IF EXISTS "Authenticated can subscribe to community and own channels" ON realtime.messages;

CREATE POLICY "Authenticated can subscribe to community and own channels"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = 'community_posts'
  OR realtime.topic() = ('user:' || auth.uid()::text)
);

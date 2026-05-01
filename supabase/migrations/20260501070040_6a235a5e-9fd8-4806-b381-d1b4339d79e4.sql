
-- 1. Fix profiles SELECT policy: only owner sees full row; others see only public fields via view
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Public view exposing only safe fields
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT user_id, display_name, avatar_url, xp, level
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- 2. Fix toggle_post_like to use auth.uid() instead of caller-supplied user id
DROP FUNCTION IF EXISTS public.toggle_post_like(uuid, uuid);

CREATE OR REPLACE FUNCTION public.toggle_post_like(p_post_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  already_liked boolean;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM community_likes WHERE post_id = p_post_id AND user_id = v_user_id
  ) INTO already_liked;

  IF already_liked THEN
    DELETE FROM community_likes WHERE post_id = p_post_id AND user_id = v_user_id;
    UPDATE community_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = p_post_id;
    RETURN false;
  ELSE
    INSERT INTO community_likes (post_id, user_id) VALUES (p_post_id, v_user_id);
    UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = p_post_id;
    RETURN true;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.toggle_post_like(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.toggle_post_like(uuid) TO authenticated;

-- 3. app_config: revoke API access (server-side only via service role)
REVOKE ALL ON TABLE public.app_config FROM anon, authenticated;

-- 4. Storage policies for exercise-images: restrict writes to admins only
DROP POLICY IF EXISTS "Authenticated users can upload exercise images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update exercise images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete exercise images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload exercise images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update exercise images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete exercise images" ON storage.objects;

CREATE POLICY "Admins can upload exercise images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'exercise-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update exercise images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'exercise-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete exercise images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'exercise-images' AND public.has_role(auth.uid(), 'admin'));

-- 5. Realtime: restrict subscriptions to own-user channels
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can subscribe to own channels" ON realtime.messages;

CREATE POLICY "Users can subscribe to own channels"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    realtime.topic() LIKE '%' || auth.uid()::text || '%'
    OR realtime.topic() LIKE 'public:%'
  );

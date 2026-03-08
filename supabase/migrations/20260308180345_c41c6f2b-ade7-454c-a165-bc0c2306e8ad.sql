
-- Replace permissive UPDATE policy with a restricted one (only post owner can update)
DROP POLICY IF EXISTS "Anyone can update likes count" ON public.community_posts;
CREATE POLICY "Owners can update own posts"
  ON public.community_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create a secure function for toggling likes (bypasses RLS safely)
CREATE OR REPLACE FUNCTION public.toggle_post_like(p_post_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  already_liked boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM community_likes WHERE post_id = p_post_id AND user_id = p_user_id
  ) INTO already_liked;

  IF already_liked THEN
    DELETE FROM community_likes WHERE post_id = p_post_id AND user_id = p_user_id;
    UPDATE community_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = p_post_id;
    RETURN false;
  ELSE
    INSERT INTO community_likes (post_id, user_id) VALUES (p_post_id, p_user_id);
    UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = p_post_id;
    RETURN true;
  END IF;
END;
$$;

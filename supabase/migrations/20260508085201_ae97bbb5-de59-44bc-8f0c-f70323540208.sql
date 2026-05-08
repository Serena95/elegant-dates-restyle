DROP POLICY IF EXISTS "Owners can update own posts" ON public.community_posts;

CREATE POLICY "Owners can update own posts"
ON public.community_posts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND likes_count = (SELECT likes_count FROM public.community_posts p WHERE p.id = community_posts.id)
);
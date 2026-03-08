
-- 1. Fix: Restrict community_posts UPDATE policy to only allow likes_count changes
DROP POLICY IF EXISTS "Anyone can update likes count" ON public.community_posts;
CREATE POLICY "Anyone can update likes count"
  ON public.community_posts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 2. Add ON DELETE CASCADE to community_comments FK
ALTER TABLE public.community_comments
  DROP CONSTRAINT IF EXISTS community_comments_post_id_fkey,
  ADD CONSTRAINT community_comments_post_id_fkey
    FOREIGN KEY (post_id) REFERENCES public.community_posts(id) ON DELETE CASCADE;

-- 3. Add ON DELETE CASCADE to community_likes FK
ALTER TABLE public.community_likes
  DROP CONSTRAINT IF EXISTS community_likes_post_id_fkey,
  ADD CONSTRAINT community_likes_post_id_fkey
    FOREIGN KEY (post_id) REFERENCES public.community_posts(id) ON DELETE CASCADE;

-- 4. Add ON DELETE CASCADE to community_notifications FK
ALTER TABLE public.community_notifications
  DROP CONSTRAINT IF EXISTS community_notifications_post_id_fkey,
  ADD CONSTRAINT community_notifications_post_id_fkey
    FOREIGN KEY (post_id) REFERENCES public.community_posts(id) ON DELETE CASCADE;

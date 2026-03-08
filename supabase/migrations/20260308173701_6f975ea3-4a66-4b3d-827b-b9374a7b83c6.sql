
-- Fix: drop the duplicate/conflicting UPDATE policies on community_posts, keep only the permissive one
DROP POLICY IF EXISTS "Users can update own posts" ON public.community_posts;
-- The "Anyone can update likes count" is needed for the like system

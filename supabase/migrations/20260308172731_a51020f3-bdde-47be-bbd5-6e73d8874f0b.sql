
-- Add XP fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS xp integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS level integer NOT NULL DEFAULT 1;

-- Community posts table
CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  text text NOT NULL DEFAULT '',
  workout_type text DEFAULT NULL,
  workout_focus text DEFAULT NULL,
  workout_duration_min integer DEFAULT NULL,
  likes_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read posts
CREATE POLICY "Anyone can view posts" ON public.community_posts
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own posts" ON public.community_posts
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.community_posts
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Community likes
CREATE TABLE public.community_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.community_likes
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own likes" ON public.community_likes
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON public.community_likes
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Community comments
CREATE TABLE public.community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  text text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.community_comments
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own comments" ON public.community_comments
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.community_comments
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fitness challenges tracking (user participation)
CREATE TABLE public.challenge_participations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id text NOT NULL,
  start_date text NOT NULL,
  completed_days integer NOT NULL DEFAULT 0,
  last_completed_date text DEFAULT NULL,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own participations" ON public.challenge_participations
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own participations" ON public.challenge_participations
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participations" ON public.challenge_participations
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own participations" ON public.challenge_participations
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime for community posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;

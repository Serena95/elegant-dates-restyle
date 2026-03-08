
-- 1. Leaderboard table (weekly)
CREATE TABLE public.leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  week_start text NOT NULL,
  xp_week integer NOT NULL DEFAULT 0,
  workouts_week integer NOT NULL DEFAULT 0,
  rank integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can upsert own leaderboard" ON public.leaderboard FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leaderboard" ON public.leaderboard FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 2. Badges table
CREATE TABLE public.badges (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT TO authenticated USING (true);

-- 3. User badges table
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_id text NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view user badges" ON public.user_badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own badges" ON public.user_badges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 4. Community notifications table
CREATE TABLE public.community_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  from_user_id uuid NOT NULL,
  type text NOT NULL,
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.community_notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert notifications" ON public.community_notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Users can update own notifications" ON public.community_notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 5. Fix community_posts UPDATE policy for likes_count
CREATE POLICY "Users can update own posts" ON public.community_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Anyone can update likes count" ON public.community_posts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 6. Make profiles viewable by all authenticated users (for public profiles)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Authenticated users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);

-- 7. Seed badge definitions
INSERT INTO public.badges (id, name, description, icon) VALUES
  ('first_workout', 'Prima Volta', 'Completa il tuo primo allenamento', '🌟'),
  ('five_workouts', 'In Forma', 'Completa 5 allenamenti', '💪'),
  ('ten_workouts', 'Costanza', 'Completa 10 allenamenti', '🔥'),
  ('thirty_workouts', 'Atleta', 'Completa 30 allenamenti', '🏆'),
  ('hundred_workouts', 'Centurione', 'Completa 100 allenamenti', '⭐'),
  ('seven_streak', 'Settimana Perfetta', '7 allenamenti consecutivi', '⚡'),
  ('thirty_streak', 'Inarrestabile', '30 allenamenti consecutivi', '👑'),
  ('top_ten', 'Top 10', 'Entra nella Top 10 della classifica', '🏅');

-- 8. Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard;

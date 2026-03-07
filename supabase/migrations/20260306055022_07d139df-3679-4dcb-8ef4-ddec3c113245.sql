
-- Measurements table for progress tracking
CREATE TABLE public.measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  data text NOT NULL,
  peso text NOT NULL,
  vita text NOT NULL DEFAULT '-',
  fianchi text NOT NULL DEFAULT '-',
  coscia text NOT NULL DEFAULT '-',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own measurements" ON public.measurements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own measurements" ON public.measurements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own measurements" ON public.measurements FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Food diary table
CREATE TABLE public.food_diary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tipo text NOT NULL,
  descrizione text NOT NULL,
  mood text NOT NULL,
  data text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.food_diary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own food" ON public.food_diary FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own food" ON public.food_diary FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own food" ON public.food_diary FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Water tracking table
CREATE TABLE public.water_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  data text NOT NULL,
  bicchieri integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, data)
);
ALTER TABLE public.water_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own water" ON public.water_tracking FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own water" ON public.water_tracking FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own water" ON public.water_tracking FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Challenges table
CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome text NOT NULL,
  streak integer NOT NULL DEFAULT 0,
  ultima_data text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own challenges" ON public.challenges FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own challenges" ON public.challenges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own challenges" ON public.challenges FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own challenges" ON public.challenges FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add update trigger for challenges
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

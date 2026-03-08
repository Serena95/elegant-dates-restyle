
-- Cycle tracking table
CREATE TABLE public.cycle_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  data TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'mestruazione',
  sintomi TEXT[] DEFAULT '{}',
  note TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cycle_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cycle data" ON public.cycle_tracking FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cycle data" ON public.cycle_tracking FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cycle data" ON public.cycle_tracking FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cycle data" ON public.cycle_tracking FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add pregnancy mode and cycle settings to user_settings
ALTER TABLE public.user_settings 
  ADD COLUMN IF NOT EXISTS modalita_gravidanza BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS settimana_gestazionale INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS durata_ciclo INTEGER DEFAULT 28,
  ADD COLUMN IF NOT EXISTS durata_mestruazione INTEGER DEFAULT 5;

ALTER TABLE public.user_settings 
  ADD COLUMN IF NOT EXISTS peso numeric NULL,
  ADD COLUMN IF NOT EXISTS altezza numeric NULL,
  ADD COLUMN IF NOT EXISTS eta integer NULL,
  ADD COLUMN IF NOT EXISTS attivita_livello text NULL DEFAULT 'moderata',
  ADD COLUMN IF NOT EXISTS obiettivo_nutrizionale text NULL DEFAULT 'mantenimento',
  ADD COLUMN IF NOT EXISTS calorie_target integer NULL;
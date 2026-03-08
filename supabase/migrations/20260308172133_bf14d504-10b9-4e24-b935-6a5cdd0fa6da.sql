
-- Add premium fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS premium boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_expires timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_customer_id text DEFAULT NULL;

-- Update handle_new_user to make first user admin + premium
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_count integer;
  user_role app_role;
  is_premium boolean;
BEGIN
  -- Count existing users to determine if this is the first user
  SELECT count(*) INTO user_count FROM public.profiles;
  
  IF user_count = 0 THEN
    user_role := 'admin';
    is_premium := true;
  ELSE
    user_role := 'user';
    is_premium := false;
  END IF;

  INSERT INTO public.profiles (user_id, display_name, avatar_url, premium)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    is_premium
  );
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  RETURN NEW;
END;
$$;

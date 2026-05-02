
-- Remove self-insert on user_badges (badges must be granted by trusted server code only)
DROP POLICY IF EXISTS "Users can insert own badges" ON public.user_badges;

-- Only admins can directly insert badges; the server (service role) bypasses RLS
CREATE POLICY "Only admins can insert badges"
ON public.user_badges
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Helper: check if a user is premium (active subscription) or admin
CREATE OR REPLACE FUNCTION public.is_premium_or_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(_user_id, 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = _user_id
        AND premium = true
        AND (premium_expires IS NULL OR premium_expires > now())
    );
$$;

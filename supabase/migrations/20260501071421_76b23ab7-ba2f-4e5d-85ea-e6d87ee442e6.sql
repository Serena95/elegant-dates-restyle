
-- Lock down user_roles: only admins can insert/update/delete roles
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Tighten realtime.messages: drop overly permissive public:% policy if exists,
-- and restrict subscriptions to the user's own user:<uid> topic only.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'realtime' AND tablename = 'messages'
      AND policyname = 'Users can subscribe to own channels'
  ) THEN
    EXECUTE 'DROP POLICY "Users can subscribe to own channels" ON realtime.messages';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'realtime' AND tablename = 'messages'
      AND policyname = 'Users subscribe to own user channel'
  ) THEN
    EXECUTE 'DROP POLICY "Users subscribe to own user channel" ON realtime.messages';
  END IF;
END $$;

CREATE POLICY "Users subscribe to own user channel"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = ('user:' || auth.uid()::text)
);

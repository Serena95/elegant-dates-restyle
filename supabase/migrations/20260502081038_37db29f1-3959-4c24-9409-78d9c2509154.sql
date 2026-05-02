-- Add UPDATE policies for food_diary and measurements
CREATE POLICY "Users can update own food"
ON public.food_diary FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own measurements"
ON public.measurements FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Remove community_notifications from Realtime publication.
-- Notifications are read on-demand via fetchNotifications(); table-level
-- broadcast would let any subscriber receive notifications for other users.
ALTER PUBLICATION supabase_realtime DROP TABLE public.community_notifications;
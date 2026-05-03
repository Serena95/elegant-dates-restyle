
-- Allow users to delete their own community notifications
CREATE POLICY "Users can delete own notifications"
ON public.community_notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Remove leaderboard from realtime publication to prevent broadcast of all users' rows
ALTER PUBLICATION supabase_realtime DROP TABLE public.leaderboard;

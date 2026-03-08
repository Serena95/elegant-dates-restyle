import { supabase } from "@/integrations/supabase/client";

export async function fetchPosts(userId?: string) {
  const { data: postsData } = await supabase
    .from("community_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (!postsData) return [];

  const userIds = [...new Set(postsData.map(p => p.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, display_name, avatar_url, level, xp")
    .in("user_id", userIds);

  const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

  let myLikes = new Set<string>();
  if (userId) {
    const { data: likes } = await supabase
      .from("community_likes")
      .select("post_id")
      .eq("user_id", userId);
    myLikes = new Set(likes?.map(l => l.post_id) || []);
  }

  const postIds = postsData.map(p => p.id);
  const { data: commentCounts } = await supabase
    .from("community_comments")
    .select("post_id")
    .in("post_id", postIds);

  const commentCountMap = new Map<string, number>();
  commentCounts?.forEach(c => {
    commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) || 0) + 1);
  });

  return postsData.map(p => ({
    ...p,
    display_name: profileMap.get(p.user_id)?.display_name || "Utente",
    avatar_url: profileMap.get(p.user_id)?.avatar_url,
    user_level: profileMap.get(p.user_id)?.level || 1,
    liked_by_me: myLikes.has(p.id),
    comments_count: commentCountMap.get(p.id) || 0,
  }));
}

export async function createPost(userId: string, text: string, workoutData?: { type?: string; focus?: string; duration?: number }) {
  return supabase.from("community_posts").insert({
    user_id: userId,
    text: text.trim(),
    workout_type: workoutData?.type || null,
    workout_focus: workoutData?.focus || null,
    workout_duration_min: workoutData?.duration || null,
  });
}

export async function deletePost(postId: string) {
  return supabase.from("community_posts").delete().eq("id", postId);
}

export async function toggleLike(postId: string, userId: string, currentlyLiked: boolean, currentCount: number) {
  if (currentlyLiked) {
    await supabase.from("community_likes").delete().eq("post_id", postId).eq("user_id", userId);
    await supabase.from("community_posts").update({ likes_count: Math.max(0, currentCount - 1) }).eq("id", postId);
  } else {
    await supabase.from("community_likes").insert({ post_id: postId, user_id: userId });
    await supabase.from("community_posts").update({ likes_count: currentCount + 1 }).eq("id", postId);
  }
}

export async function fetchComments(postId: string) {
  const { data } = await supabase
    .from("community_comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (!data) return [];
  const userIds = [...new Set(data.map(c => c.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, display_name")
    .in("user_id", userIds);
  const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

  return data.map(c => ({
    ...c,
    display_name: profileMap.get(c.user_id)?.display_name || "Utente",
  }));
}

export async function addComment(postId: string, userId: string, text: string) {
  return supabase.from("community_comments").insert({
    post_id: postId,
    user_id: userId,
    text: text.trim(),
  });
}

export async function sendNotification(toUserId: string, fromUserId: string, type: string, postId?: string) {
  if (toUserId === fromUserId) return; // Don't notify self
  return supabase.from("community_notifications").insert({
    user_id: toUserId,
    from_user_id: fromUserId,
    type,
    post_id: postId || null,
  });
}

export async function fetchNotifications(userId: string) {
  const { data } = await supabase
    .from("community_notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);
  
  if (!data) return [];
  
  const fromIds = [...new Set(data.map(n => n.from_user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, display_name")
    .in("user_id", fromIds);
  const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

  return data.map(n => ({
    ...n,
    from_display_name: profileMap.get(n.from_user_id)?.display_name || "Utente",
  }));
}

export async function markNotificationsRead(userId: string) {
  return supabase
    .from("community_notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
}

export async function getUnreadNotificationCount(userId: string) {
  const { count } = await supabase
    .from("community_notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);
  return count || 0;
}

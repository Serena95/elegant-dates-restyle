import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Send, Trash2, Loader2, Bell, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import {
  fetchPosts, createPost, deletePost as deletePostService,
  toggleLike as toggleLikeService, fetchComments, addComment,
  sendNotification, getUnreadNotificationCount,
} from "@/services/supabase/communityService";
import { supabase } from "@/integrations/supabase/client";
import { getLevelInfo } from "@/services/xpService";

interface CommunityViewProps {
  onBack?: () => void;
  onViewProfile?: (userId: string) => void;
  onViewLeaderboard?: () => void;
  onViewNotifications?: () => void;
}

export function CommunityView({ onBack, onViewProfile, onViewLeaderboard, onViewNotifications }: CommunityViewProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [newComment, setNewComment] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const loadPosts = useCallback(async () => {
    const data = await fetchPosts(user?.id);
    setPosts(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadPosts();
    if (user) {
      getUnreadNotificationCount(user.id).then(setUnreadCount);
    }

    const channel = supabase
      .channel("community-posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts" }, () => loadPosts())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadPosts, user]);

  const submitPost = async () => {
    if (!user || !newPost.trim()) return;
    setPosting(true);
    const { error } = await createPost(user.id, newPost);
    if (error) toast.error("Errore nella pubblicazione");
    else { setNewPost(""); loadPosts(); }
    setPosting(false);
  };

  const handleToggleLike = async (post: any) => {
    if (!user) return;
    await toggleLikeService(post.id, user.id, post.liked_by_me, post.likes_count);
    if (!post.liked_by_me && post.user_id !== user.id) {
      sendNotification(post.user_id, user.id, "like", post.id);
    }
    loadPosts();
  };

  const handleDeletePost = async (postId: string) => {
    await deletePostService(postId);
    loadPosts();
  };

  const loadCommentsFn = async (postId: string) => {
    const data = await fetchComments(postId);
    setComments(prev => ({ ...prev, [postId]: data }));
  };

  const submitComment = async (postId: string) => {
    if (!user || !newComment.trim()) return;
    await addComment(postId, user.id, newComment);
    const post = posts.find(p => p.id === postId);
    if (post && post.user_id !== user.id) {
      sendNotification(post.user_id, user.id, "comment", postId);
    }
    setNewComment("");
    loadCommentsFn(postId);
    loadPosts();
  };

  const toggleComments = (postId: string) => {
    if (expandedComments === postId) {
      setExpandedComments(null);
    } else {
      setExpandedComments(postId);
      loadCommentsFn(postId);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Community</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onViewLeaderboard} className="gap-1">
            <Trophy size={16} className="text-amber-500" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onViewNotifications} className="relative gap-1">
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[10px] flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </Button>
          {onBack && <Button variant="ghost" size="sm" onClick={onBack}>Indietro</Button>}
        </div>
      </div>

      {/* New post */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <Textarea
            placeholder="Condividi il tuo allenamento o un pensiero..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="min-h-[60px] resize-none"
          />
          <Button size="sm" onClick={submitPost} disabled={posting || !newPost.trim()} className="w-full">
            {posting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
            Pubblica
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-10">
          Nessun post ancora. Sii il primo a condividere! 🎉
        </p>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {posts.map((post, i) => {
              const postLevelInfo = getLevelInfo(0); // display level from post data
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <button
                          className="flex items-center gap-2 text-left"
                          onClick={() => onViewProfile?.(post.user_id)}
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary overflow-hidden">
                            {post.avatar_url ? (
                              <img src={post.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              post.display_name?.charAt(0).toUpperCase() || "U"
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{post.display_name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              Lv.{post.user_level || 1} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: it })}
                            </p>
                          </div>
                        </button>
                        {post.user_id === user?.id && (
                          <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)}>
                            <Trash2 className="w-3 h-3 text-muted-foreground" />
                          </Button>
                        )}
                      </div>

                      <p className="text-sm text-foreground">{post.text}</p>

                      {post.workout_type && (
                        <div className="bg-muted/50 rounded-lg px-3 py-2 text-xs text-muted-foreground">
                          🏋️ {post.workout_type}
                          {post.workout_focus && ` · ${post.workout_focus}`}
                          {post.workout_duration_min && ` · ${post.workout_duration_min} min`}
                        </div>
                      )}

                      <div className="flex items-center gap-4 pt-1">
                        <button
                          onClick={() => handleToggleLike(post)}
                          className={`flex items-center gap-1 text-xs transition ${post.liked_by_me ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
                        >
                          <Heart className={`w-4 h-4 ${post.liked_by_me ? "fill-current" : ""}`} />
                          {post.likes_count > 0 && post.likes_count}
                        </button>
                        <button
                          onClick={() => toggleComments(post.id)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition"
                        >
                          <MessageCircle className="w-4 h-4" />
                          {(post.comments_count || 0) > 0 && post.comments_count}
                        </button>
                      </div>

                      <AnimatePresence>
                        {expandedComments === post.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden space-y-2 pt-2 border-t border-border"
                          >
                            {comments[post.id]?.map(c => (
                              <div key={c.id} className="text-xs space-y-0.5 pl-2 border-l-2 border-muted">
                                <span className="font-semibold text-foreground">{c.display_name}</span>
                                <p className="text-muted-foreground">{c.text}</p>
                              </div>
                            ))}
                            <div className="flex gap-2">
                              <input
                                className="flex-1 text-xs bg-muted/50 rounded px-2 py-1.5 border border-border text-foreground placeholder:text-muted-foreground"
                                placeholder="Scrivi un commento..."
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && submitComment(post.id)}
                              />
                              <Button size="sm" variant="ghost" onClick={() => submitComment(post.id)}>
                                <Send className="w-3 h-3" />
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

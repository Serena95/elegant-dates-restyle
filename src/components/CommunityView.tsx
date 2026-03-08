import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Send, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface Post {
  id: string;
  user_id: string;
  text: string;
  workout_type: string | null;
  workout_focus: string | null;
  workout_duration_min: number | null;
  likes_count: number;
  created_at: string;
  display_name?: string;
  avatar_url?: string;
  liked_by_me?: boolean;
  comments_count?: number;
}

interface Comment {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
  display_name?: string;
}

interface CommunityViewProps {
  onBack?: () => void;
}

export function CommunityView({ onBack }: CommunityViewProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState("");

  const loadPosts = useCallback(async () => {
    const { data: postsData } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!postsData) return;

    // Get user display names
    const userIds = [...new Set(postsData.map(p => p.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", userIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    // Get my likes
    let myLikes = new Set<string>();
    if (user) {
      const { data: likes } = await supabase
        .from("community_likes")
        .select("post_id")
        .eq("user_id", user.id);
      myLikes = new Set(likes?.map(l => l.post_id) || []);
    }

    // Get comment counts
    const postIds = postsData.map(p => p.id);
    const { data: commentCounts } = await supabase
      .from("community_comments")
      .select("post_id")
      .in("post_id", postIds);

    const commentCountMap = new Map<string, number>();
    commentCounts?.forEach(c => {
      commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) || 0) + 1);
    });

    setPosts(postsData.map(p => ({
      ...p,
      display_name: profileMap.get(p.user_id)?.display_name || "Utente",
      avatar_url: profileMap.get(p.user_id)?.avatar_url,
      liked_by_me: myLikes.has(p.id),
      comments_count: commentCountMap.get(p.id) || 0,
    })));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadPosts();

    // Realtime subscription
    const channel = supabase
      .channel("community-posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts" }, () => {
        loadPosts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadPosts]);

  const submitPost = async () => {
    if (!user || !newPost.trim()) return;
    setPosting(true);
    const { error } = await supabase.from("community_posts").insert({
      user_id: user.id,
      text: newPost.trim(),
    });
    if (error) {
      toast.error("Errore nella pubblicazione");
    } else {
      setNewPost("");
      loadPosts();
    }
    setPosting(false);
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.liked_by_me) {
      await supabase.from("community_likes").delete().eq("post_id", postId).eq("user_id", user.id);
      await supabase.from("community_posts").update({ likes_count: Math.max(0, post.likes_count - 1) }).eq("id", postId);
    } else {
      await supabase.from("community_likes").insert({ post_id: postId, user_id: user.id });
      await supabase.from("community_posts").update({ likes_count: post.likes_count + 1 }).eq("id", postId);
    }
    loadPosts();
  };

  const deletePost = async (postId: string) => {
    await supabase.from("community_posts").delete().eq("id", postId);
    loadPosts();
  };

  const loadComments = async (postId: string) => {
    const { data } = await supabase
      .from("community_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (!data) return;
    const userIds = [...new Set(data.map(c => c.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", userIds);
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    setComments(prev => ({
      ...prev,
      [postId]: data.map(c => ({
        ...c,
        display_name: profileMap.get(c.user_id)?.display_name || "Utente",
      })),
    }));
  };

  const submitComment = async (postId: string) => {
    if (!user || !newComment.trim()) return;
    await supabase.from("community_comments").insert({
      post_id: postId,
      user_id: user.id,
      text: newComment.trim(),
    });
    setNewComment("");
    loadComments(postId);
    loadPosts();
  };

  const toggleComments = (postId: string) => {
    if (expandedComments === postId) {
      setExpandedComments(null);
    } else {
      setExpandedComments(postId);
      loadComments(postId);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Community</h2>
        {onBack && <Button variant="ghost" size="sm" onClick={onBack}>Indietro</Button>}
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
          <Button
            size="sm"
            onClick={submitPost}
            disabled={posting || !newPost.trim()}
            className="w-full"
          >
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
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {post.display_name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{post.display_name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: it })}
                          </p>
                        </div>
                      </div>
                      {post.user_id === user?.id && (
                        <Button variant="ghost" size="sm" onClick={() => deletePost(post.id)}>
                          <Trash2 className="w-3 h-3 text-muted-foreground" />
                        </Button>
                      )}
                    </div>

                    <p className="text-sm">{post.text}</p>

                    {post.workout_type && (
                      <div className="bg-muted/50 rounded-lg px-3 py-2 text-xs">
                        🏋️ {post.workout_type}
                        {post.workout_focus && ` · ${post.workout_focus}`}
                        {post.workout_duration_min && ` · ${post.workout_duration_min} min`}
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-1">
                      <button
                        onClick={() => toggleLike(post.id)}
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

                    {/* Comments section */}
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
                              <span className="font-semibold">{c.display_name}</span>
                              <p className="text-muted-foreground">{c.text}</p>
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <input
                              className="flex-1 text-xs bg-muted/50 rounded px-2 py-1.5 border border-border"
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
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

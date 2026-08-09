import { getSupabase } from "@/lib/supabase/client";
import type { Comment } from "@/types";

export async function addComment(articleId: string, content: string): Promise<Comment> {
  const supabase = getSupabase();
  const comment: Comment = {
    id: `new-${Date.now()}`,
    articleId,
    author: "আপনি",
    avatar: "",
    content,
    createdAt: new Date().toISOString(),
    likes: 0,
    replies: [],
  };
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({ article_id: articleId, author: comment.author, avatar: "", content, created_at: comment.createdAt, likes: 0, status: "published" })
        .select("id")
        .single();
      if (error) throw error;
      if (data?.id) comment.id = String(data.id);
    } catch (err) {
      console.error("Failed to save comment:", err);
    }
  }
  return comment;
}

import { getFirebaseDb } from "@/lib/firebase/client";
import { addDoc, collection } from "firebase/firestore";
import type { Comment } from "@/types";

export async function addComment(articleId: string, content: string): Promise<Comment> {
  const db = getFirebaseDb();
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
  if (db) {
    try {
      const ref = await addDoc(collection(db, "comments"), {
        articleId,
        author: comment.author,
        avatar: "",
        content,
        createdAt: comment.createdAt,
        likes: 0,
      });
      comment.id = ref.id;
    } catch (err) {
      console.error("Failed to save comment:", err);
    }
  }
  return comment;
}

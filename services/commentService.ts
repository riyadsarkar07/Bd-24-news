import { getSupabase } from "@/lib/supabase/client";
import { getVisitorId } from "@/services/viewService";
import type { Comment, CommentStatus } from "@/types";

export interface CommentSubmitInput {
  author: string;
  content: string;
  parentId?: string | null;
}

export interface CommentSubmitResult {
  comment: Comment;
  status: CommentStatus;
  /** True when the moderated submission function is not deployed yet. */
  legacy: boolean;
}

export class CommentError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "CommentError";
  }
}

const ERROR_MESSAGES: Record<string, { bn: string; en: string }> = {
  article_not_found: {
    bn: "খবরটি পাওয়া যায়নি।",
    en: "This article could not be found.",
  },
  comments_disabled: {
    bn: "এই খবরে মন্তব্য বন্ধ রয়েছে।",
    en: "Comments are closed for this article.",
  },
  invalid_author: {
    bn: "অনুগ্রহ করে আপনার নাম লিখুন।",
    en: "Please enter your name.",
  },
  invalid_content: {
    bn: "অনুগ্রহ করে একটি মন্তব্য লিখুন।",
    en: "Please write a comment.",
  },
  rate_limited: {
    bn: "আপনি খুব দ্রুত মন্তব্য করছেন। একটু অপেক্ষা করুন।",
    en: "You are commenting too quickly. Please wait a moment.",
  },
  invalid_parent: {
    bn: "যে মন্তব্যের উত্তর দিচ্ছেন সেটি পাওয়া যায়নি।",
    en: "The comment you are replying to is no longer available.",
  },
  not_authorized: {
    bn: "এই কাজটি করার অনুমতি নেই।",
    en: "You are not allowed to do that.",
  },
  upgrade_pending: {
    bn: "মন্তব্য সেবা হালনাগাদ হচ্ছে। একটু পরে আবার চেষ্টা করুন।",
    en: "The comment service is being upgraded. Please try again shortly.",
  },
};

export function localizedCommentError(err: unknown, lang: "bn" | "en"): string {
  const code = err instanceof CommentError ? err.code : "";
  const message = ERROR_MESSAGES[code];
  if (message) return message[lang];
  return lang === "bn" ? "মন্তব্য পাঠানো যায়নি। আবার চেষ্টা করুন।" : "Could not post your comment. Please try again.";
}

function isMissingFunction(message: string | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return m.includes("could not find the function") || m.includes("schema cache");
}

export function isCommentsUnavailable(err: unknown): boolean {
  return err instanceof CommentError && err.code === "upgrade_pending";
}

function normalizeError(message: string | undefined): CommentError {
  const raw = (message ?? "").trim();
  const known = Object.keys(ERROR_MESSAGES).find((code) => raw.toLowerCase().includes(code));
  return new CommentError(known ?? "unknown", raw || "comment_failed");
}

/**
 * Submits a comment through the moderated RPC. New comments are stored as
 * `pending` unless the administrator has enabled instant publishing, and
 * rate limiting is enforced on the server. Falls back to a direct pending
 * insert only while the migration has not yet been applied.
 */
export async function addComment(articleId: string, input: CommentSubmitInput): Promise<CommentSubmitResult> {
  const supabase = getSupabase();
  const author = input.author.trim();
  const content = input.content.trim();

  if (!author || author.length < 2) throw new CommentError("invalid_author", "invalid_author");
  if (!content || content.length < 2) throw new CommentError("invalid_content", "invalid_content");

  const base: Comment = {
    id: `new-${Date.now()}`,
    articleId,
    author,
    avatar: "",
    content,
    createdAt: new Date().toISOString(),
    likes: 0,
    replies: [],
    status: "pending",
    isOfficial: false,
    parentId: input.parentId ?? null,
  };

  if (!supabase) return { comment: base, status: "pending", legacy: true };

  const { data, error } = await supabase.rpc("submit_comment", {
    p_article_id: articleId,
    p_author: author,
    p_content: content,
    p_visitor_id: getVisitorId(),
    p_parent_id: input.parentId ?? null,
  });

  if (!error && data && typeof data === "object") {
    const row = data as { id?: string; status?: string };
    const status: CommentStatus = row.status === "published" ? "published" : "pending";
    return {
      comment: { ...base, id: row.id ? String(row.id) : base.id, status },
      status,
      legacy: false,
    };
  }

  if (error) {
    if (!isMissingFunction(error.message)) throw normalizeError(error.message);

    // Migration not applied yet: keep comments usable, but still hold them
    // for moderation. The public site only renders `published` comments.
    const insert = {
      article_id: articleId,
      author,
      content,
      status: "pending",
      created_at: base.createdAt,
      likes: 0,
    };
    const { data: legacyRow, error: legacyError } = await supabase
      .from("comments")
      .insert(insert)
      .select("id")
      .single();
    if (legacyError) throw normalizeError(legacyError.message);
    return {
      comment: { ...base, id: legacyRow?.id ? String(legacyRow.id) : base.id },
      status: "pending",
      legacy: true,
    };
  }

  return { comment: base, status: "pending", legacy: false };
}

"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ThumbsUp, MessageSquare, UserRound, Send, ShieldCheck, Loader2, CornerDownRight, Lock } from "lucide-react";
import { useComments, useAddComment } from "@/hooks/useNews";
import { useLanguage } from "@/providers/language-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo, toBanglaNumerals } from "@/lib/utils";
import { localizedCommentError } from "@/services/commentService";
import { buildCommentTree } from "@/services/newsService";
import type { Comment } from "@/types";

const MAX_LENGTH = 2000;
const NAME_KEY = "bd24news.comment_name";

export function CommentSection({
  articleId,
  commentsEnabled = true,
}: {
  articleId: string;
  commentsEnabled?: boolean;
}) {
  const { data: comments, isLoading } = useComments(articleId);
  const addComment = useAddComment(articleId);
  const { lang } = useLanguage();
  const [name, setName] = React.useState("");
  const [content, setContent] = React.useState("");
  const [replyTo, setReplyTo] = React.useState<Comment | null>(null);
  const [notice, setNotice] = React.useState<{ kind: "success" | "error"; text: string } | null>(null);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(NAME_KEY);
      if (stored) setName(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const visible = React.useMemo(
    () => (comments ?? []).filter((c) => (c.status ?? "published") === "published"),
    [comments],
  );
  const tree = React.useMemo(() => buildCommentTree(visible), [visible]);
  const total = visible.filter((c) => !c.isOfficial).length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    if (!name.trim() || !content.trim()) return;
    if (content.trim().length > MAX_LENGTH) {
      setNotice({
        kind: "error",
        text: lang === "bn" ? `মন্তব্য ${MAX_LENGTH} অক্ষরের মধ্যে রাখুন।` : `Keep your comment under ${MAX_LENGTH} characters.`,
      });
      return;
    }
    addComment.mutate(
      { author: name.trim(), content: content.trim(), parentId: replyTo?.id ?? null },
      {
        onSuccess: (result) => {
          try {
            window.localStorage.setItem(NAME_KEY, name.trim());
          } catch {
            /* ignore */
          }
          setContent("");
          setReplyTo(null);
          setNotice({
            kind: "success",
            text:
              result.status === "published"
                ? lang === "bn"
                  ? "আপনার মন্তব্য প্রকাশিত হয়েছে।"
                  : "Your comment has been published."
                : lang === "bn"
                  ? "ধন্যবাদ! মন্তব্য পর্যালোচনার পর প্রকাশিত হবে।"
                  : "Thank you! Your comment will appear after review.",
          });
        },
        onError: (err) => setNotice({ kind: "error", text: localizedCommentError(err, lang) }),
      },
    );
  };

  const count = toBanglaNumerals(total);

  return (
    <section className="mt-10" aria-label={lang === "bn" ? "মন্তব্য" : "Comments"}>
      <h3 className="flex items-center gap-2 font-bengali text-xl font-bold">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10">
          <MessageSquare className="h-4 w-4 text-brand" />
        </span>
        {lang === "bn" ? "মন্তব্য" : "Comments"}
        <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-bold text-brand">{count}</span>
      </h3>

      {!commentsEnabled ? (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          {lang === "bn" ? "এই খবরে মন্তব্য বন্ধ রয়েছে।" : "Comments are closed for this article."}
        </div>
      ) : (
        <form onSubmit={submit} className="glass-card mt-4 space-y-3 rounded-2xl p-5">
          {replyTo && (
            <div className="flex items-start gap-2 rounded-xl border border-brand/20 bg-brand/5 px-3 py-2 text-xs">
              <CornerDownRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
              <span className="min-w-0 flex-1">
                <span className="font-semibold text-brand">{replyTo.author}</span>
                <span className="ml-1 line-clamp-1 text-muted-foreground">{replyTo.content}</span>
              </span>
              <button type="button" onClick={() => setReplyTo(null)} className="shrink-0 text-muted-foreground hover:text-foreground">
                {lang === "bn" ? "বাতিল" : "Cancel"}
              </button>
            </div>
          )}
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={lang === "bn" ? "আপনার নাম" : "Your name"}
            maxLength={60}
            required
            className="max-w-xs"
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              replyTo
                ? lang === "bn" ? `${replyTo.author} কে উত্তর দিন...` : `Reply to ${replyTo.author}...`
                : lang === "bn" ? "আপনার মন্তব্য লিখুন..." : "Write your comment..."
            }
            maxLength={MAX_LENGTH}
            required
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground">
              {toBanglaNumerals(content.length)}/{toBanglaNumerals(MAX_LENGTH)}
            </span>
            <Button type="submit" disabled={addComment.isPending || !content.trim() || !name.trim()}>
              {addComment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {lang === "bn" ? "মন্তব্য করুন" : "Post comment"}
            </Button>
          </div>
          {notice && (
            <p
              className={
                notice.kind === "success"
                  ? "rounded-lg bg-success/10 px-3 py-2 text-xs font-medium text-success"
                  : "rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger"
              }
            >
              {notice.text}
            </p>
          )}
        </form>
      )}

      <div className="mt-6 space-y-5">
        {isLoading &&
          [0, 1].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}

        {!isLoading && tree.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            {lang === "bn" ? "এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনার হোক!" : "No comments yet. Be the first to share your thoughts!"}
          </p>
        )}

        {tree.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            lang={lang}
            commentsEnabled={commentsEnabled}
            onReply={setReplyTo}
          />
        ))}
      </div>
    </section>
  );
}

function CommentItem({
  comment,
  lang,
  commentsEnabled,
  onReply,
}: {
  comment: Comment;
  lang: "bn" | "en";
  commentsEnabled: boolean;
  onReply: (c: Comment) => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
      <Avatar className="h-10 w-10 border">
        <AvatarFallback
          className={
            comment.isOfficial
              ? "bg-brand text-sm font-bold text-white"
              : "bg-brand/10 font-bengali text-sm font-bold text-brand"
          }
        >
          {comment.author.slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 rounded-2xl border border-border/50 bg-card p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-sm font-bold">
            {comment.author}
            {comment.isOfficial && (
              <span className="flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
                <ShieldCheck className="h-3 w-3" />
                {lang === "bn" ? "অফিসিয়াল" : "Official"}
              </span>
            )}
          </p>
          <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(comment.createdAt, lang)}</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-foreground/85">{comment.content}</p>
        {commentsEnabled && (
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <button className="flex items-center gap-1 transition-colors hover:text-brand">
              <ThumbsUp className="h-3.5 w-3.5" />
              {toBanglaNumerals(comment.likes)}
            </button>
            {!comment.isOfficial && (
              <button
                type="button"
                onClick={() => onReply(comment)}
                className="flex items-center gap-1 transition-colors hover:text-brand"
              >
                <UserRound className="h-3.5 w-3.5" />
                {lang === "bn" ? "উত্তর" : "Reply"}
              </button>
            )}
          </div>
        )}
        {comment.replies?.map((r) => (
          <div key={r.id} className="mt-4 flex gap-3 border-t border-border/40 pt-4">
            <Avatar className="h-8 w-8 border">
              <AvatarFallback
                className={
                  r.isOfficial
                    ? "bg-brand text-[10px] font-bold text-white"
                    : "bg-navy-900 text-[10px] font-bold text-white"
                }
              >
                {r.author.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-xs font-bold">
                  {r.author}
                  {r.isOfficial && (
                    <span className="flex items-center gap-1 rounded-full bg-brand/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand">
                      <ShieldCheck className="h-2.5 w-2.5" />
                      {lang === "bn" ? "অফিসিয়াল" : "Official"}
                    </span>
                  )}
                </p>
                <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(r.createdAt, lang)}</span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-foreground/85">{r.content}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

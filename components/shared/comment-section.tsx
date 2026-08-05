"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ThumbsUp, MessageSquare, UserRound } from "lucide-react";
import { useComments, useAddComment } from "@/hooks/useNews";
import { useLanguage } from "@/providers/language-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo, toBanglaNumerals } from "@/lib/utils";

export function CommentSection({ articleId }: { articleId: string }) {
  const { data: comments, isLoading } = useComments(articleId);
  const addComment = useAddComment(articleId);
  const { lang } = useLanguage();
  const [name, setName] = React.useState("");
  const [content, setContent] = React.useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addComment.mutate(content.trim(), {
      onSuccess: () => {
        setContent("");
      },
    });
  };

  return (
    <section className="mt-10">
      <h3 className="flex items-center gap-2 font-bengali text-xl font-bold">
        <MessageSquare className="h-5 w-5 text-brand" />
        {lang === "bn" ? "মন্তব্য" : "Comments"}
        <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-bold text-brand">
          {toBanglaNumerals(comments?.length ?? 0)}
        </span>
      </h3>

      <form onSubmit={submit} className="glass-card mt-4 space-y-3 rounded-2xl p-5">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={lang === "bn" ? "আপনার নাম" : "Your name"}
          className="max-w-xs"
        />
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={lang === "bn" ? "আপনার মন্তব্য লিখুন..." : "Write your comment..."}
          required
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={addComment.isPending}>
            {lang === "bn" ? "মন্তব্য করুন" : "Post comment"}
          </Button>
        </div>
      </form>

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

        {comments?.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <Avatar className="h-10 w-10 border">
              <AvatarFallback className="bg-brand/10 font-bengali text-sm font-bold text-brand">
                {c.author.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 rounded-2xl border border-border/50 bg-card p-4 shadow-card">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">{c.author}</p>
                <span className="text-[11px] text-muted-foreground">{timeAgo(c.createdAt, lang)}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">{c.content}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <button className="flex items-center gap-1 transition-colors hover:text-brand">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {toBanglaNumerals(c.likes)}
                </button>
                <button className="flex items-center gap-1 transition-colors hover:text-brand">
                  <UserRound className="h-3.5 w-3.5" />
                  {lang === "bn" ? "উত্তর" : "Reply"}
                </button>
              </div>
              {c.replies?.map((r) => (
                <div key={r.id} className="mt-4 flex gap-3 border-t border-border/40 pt-4">
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback className="bg-navy-900 text-[10px] font-bold text-white">{r.author.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-bold">{r.author}</p>
                    <p className="mt-1 text-sm text-foreground/85">{r.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

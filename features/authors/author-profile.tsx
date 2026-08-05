"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { BadgeCheck, Users, Newspaper, MapPin, Mail, UserPlus, Check } from "lucide-react";
import { useAuthor, useAuthorArticles } from "@/hooks/useNews";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { ArticleCard } from "@/components/shared/article-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";
import { formatNumber } from "@/lib/utils";

export function AuthorProfile({ slug }: { slug: string }) {
  const { data: author, isLoading } = useAuthor(slug);
  const { data: articles } = useAuthorArticles(slug);
  const { lang } = useLanguage();
  const [following, setFollowing] = React.useState(false);

  if (isLoading || !author) {
    return (
      <div className="container-page py-8">
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="mt-6 h-8 w-64" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: lang === "bn" ? "লেখকবৃন্দ" : "Authors", href: "/authors" }, { label: author.nameBn }]} />

      <div className="relative mt-6 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft-lg">
        <div className="relative h-40 overflow-hidden sm:h-48">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={author.cover} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>
        <div className="relative -mt-14 flex flex-col items-start gap-4 px-6 pb-6 sm:flex-row sm:items-end">
          <Avatar className="h-28 w-28 border-4 border-background shadow-2xl">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback className="bg-brand text-3xl text-white">{author.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="flex items-center gap-2 font-bengali text-2xl font-black">
              {author.nameBn}
              {author.verified && <BadgeCheck className="h-5 w-5 text-accentblue" />}
            </h1>
            <p className="text-sm font-bold text-brand">{author.role}</p>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{author.bio}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Newspaper className="h-3.5 w-3.5" />{formatNumber(author.articlesCount, lang)} {lang === "bn" ? "লেখা" : "stories"}</span>
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{formatNumber(author.followers, lang)} {lang === "bn" ? "অনুসারী" : "followers"}</span>
              <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{author.email}</span>
            </div>
          </div>
          <Button
            variant={following ? "outline" : "default"}
            onClick={() => {
              setFollowing((v) => !v);
              toast.success(following ? lang === "bn" ? "অনুসরণ বন্ধ" : "Unfollowed" : lang === "bn" ? "অনুসরণ করছেন" : "Following");
            }}
          >
            {following ? <Check className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {following ? (lang === "bn" ? "অনুসরণ করছেন" : "Following") : lang === "bn" ? "অনুসরণ করুন" : "Follow"}
          </Button>
        </div>
      </div>

      <div className="mt-10">
        <SectionHeading title="Articles by Author" titleBn={`${author.nameBn} এর লেখা`} color="#7C3AED" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles?.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.05 }}
            >
              <ArticleCard article={a} />
            </motion.div>
          ))}
        </div>
        {(!articles || articles.length === 0) && (
          <p className="py-10 text-center text-muted-foreground">{lang === "bn" ? "কোনো লেখা পাওয়া যায়নি" : "No articles found"}</p>
        )}
      </div>
    </div>
  );
}

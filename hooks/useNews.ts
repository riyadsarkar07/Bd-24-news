import { useQuery, useQueryClient, useMutation, type UseQueryResult } from "@tanstack/react-query";
import * as React from "react";
import {
  getArticles,
  getArticleBySlug,
  getRelatedArticles,
  getMostRead,
  getTrending,
  getEditorPicks,
  searchNews,
  getAuthorBySlug,
  getAuthorArticles,
  getComments,
  subscribeArticles,
  subscribeComments,
  filterAndSort,
  type ArticleQueryOptions,
} from "@/services/newsService";
import { addComment, type CommentSubmitInput } from "@/services/commentService";
import type { Article, Comment } from "@/types";

export const newsKeys = {
  all: ["news"] as const,
  articles: (opts?: unknown) => ["news", "articles", opts] as const,
  article: (slug: string) => ["news", "article", slug] as const,
  related: (slug: string) => ["news", "related", slug] as const,
  mostRead: ["news", "most-read"] as const,
  trending: ["news", "trending"] as const,
  editorPicks: ["news", "editor-picks"] as const,
  search: (q: string) => ["news", "search", q] as const,
  author: (slug: string) => ["news", "author", slug] as const,
  comments: (id: string) => ["news", "comments", id] as const,
};

function useRealtimeArticles(queryKey: readonly unknown[], options: ArticleQueryOptions = {}) {
  const queryClient = useQueryClient();
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    return subscribeArticles((all) => {
      const next = filterAndSort(all, options);
      if (next.length === 0) return;
      queryClient.setQueryData(queryKey, next);
    });
  }, [queryClient, JSON.stringify(queryKey), JSON.stringify(options)]);
}

function useRealtimeArticle(queryKey: readonly unknown[], slug: string) {
  const queryClient = useQueryClient();
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    return subscribeArticles((all) => {
      queryClient.setQueryData(queryKey, all.find((a) => a.slug === slug));
    });
  }, [queryClient, JSON.stringify(queryKey), slug]);
}

function useRealtimeRelated(queryKey: readonly unknown[], slug: string) {
  const queryClient = useQueryClient();
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    return subscribeArticles((all) => {
      const article = all.find((a) => a.slug === slug);
      if (!article) return;
      const limit = 6;
      const sameCategory = all
        .filter((a) => a.category === article.category && a.id !== article.id)
        .slice(0, limit);
      if (sameCategory.length >= limit) {
        queryClient.setQueryData(queryKey, sameCategory);
        return;
      }
      const others = all.filter((a) => a.category !== article.category && a.id !== article.id).slice(0, limit - sameCategory.length);
      queryClient.setQueryData(queryKey, [...sameCategory, ...others]);
    });
  }, [queryClient, JSON.stringify(queryKey), slug]);
}

export function useArticles(options?: ArticleQueryOptions & { initialData?: Article[] }): UseQueryResult<Article[], Error> {
  const { initialData, ...queryOptions } = options ?? {};
  const queryKey = newsKeys.articles(queryOptions);
  useRealtimeArticles(queryKey, queryOptions);
  const hasInitial = Array.isArray(initialData) && initialData.length > 0;
  return useQuery({
    queryKey,
    queryFn: () => getArticles(queryOptions),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    initialData: hasInitial ? initialData : undefined,
    refetchOnMount: hasInitial ? false : "always",
    refetchOnWindowFocus: false,
    retry: 1,
  }) as UseQueryResult<Article[], Error>;
}

export function useArticle(slug: string, initialData?: Article | undefined) {
  const queryKey = newsKeys.article(slug);
  useRealtimeArticle(queryKey, slug);
  return useQuery({
    queryKey,
    queryFn: () => getArticleBySlug(slug),
    staleTime: 5 * 60 * 1000,
    ...(initialData ? { initialData, placeholderData: initialData } : {}),
    refetchOnMount: initialData ? false : "always",
    refetchOnWindowFocus: false,
  });
}

export function useRelatedArticles(slug: string, initialData?: Article[]) {
  const queryKey = newsKeys.related(slug);
  useRealtimeRelated(queryKey, slug);
  return useQuery({
    queryKey,
    queryFn: async () => {
      const article = await getArticleBySlug(slug);
      if (!article) return [];
      return getRelatedArticles(article);
    },
    staleTime: 5 * 60 * 1000,
    ...(initialData?.length ? { initialData, placeholderData: initialData } : {}),
    refetchOnMount: initialData?.length ? false : "always",
    refetchOnWindowFocus: false,
  });
}

export function useMostRead(limit?: number, initialData?: Article[]): UseQueryResult<Article[], Error> {
  const queryKey = [...newsKeys.mostRead, limit];
  useRealtimeArticles(queryKey, { sort: "popular", limit });
  const hasInitial = Array.isArray(initialData) && initialData.length > 0;
  return useQuery({
    queryKey,
    queryFn: () => getMostRead(limit),
    staleTime: 5 * 60 * 1000,
    initialData: hasInitial ? initialData : undefined,
    refetchOnMount: hasInitial ? false : "always",
    refetchOnWindowFocus: false,
  });
}

export function useTrending(limit?: number, initialData?: Article[]): UseQueryResult<Article[], Error> {
  const queryKey = [...newsKeys.trending, limit];
  useRealtimeArticles(queryKey, { trending: true, limit });
  const hasInitial = Array.isArray(initialData) && initialData.length > 0;
  return useQuery({
    queryKey,
    queryFn: () => getTrending(limit),
    staleTime: 5 * 60 * 1000,
    initialData: hasInitial ? initialData : undefined,
    refetchOnMount: hasInitial ? false : "always",
    refetchOnWindowFocus: false,
  });
}

export function useEditorPicks(limit?: number, initialData?: Article[]): UseQueryResult<Article[], Error> {
  const queryKey = [...newsKeys.editorPicks, limit];
  useRealtimeArticles(queryKey, { editorPick: true, limit });
  const hasInitial = Array.isArray(initialData) && initialData.length > 0;
  return useQuery({
    queryKey,
    queryFn: () => getEditorPicks(limit),
    staleTime: 5 * 60 * 1000,
    initialData: hasInitial ? initialData : undefined,
    refetchOnMount: hasInitial ? false : "always",
    refetchOnWindowFocus: false,
  });
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: newsKeys.search(query),
    queryFn: () => searchNews(query),
    enabled: query.trim().length > 1,
    staleTime: 30 * 1000,
  });
}

export function useAuthor(slug: string) {
  return useQuery({
    queryKey: newsKeys.author(slug),
    queryFn: () => getAuthorBySlug(slug),
  });
}

export function useAuthorArticles(slug: string) {
  const queryKey = [...newsKeys.author(slug), "articles"];
  useRealtimeArticles(queryKey);
  return useQuery({
    queryKey,
    queryFn: () => getAuthorArticles(slug),
  });
}

export function useComments(articleId: string) {
  const queryClient = useQueryClient();
  const queryKey = newsKeys.comments(articleId);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    return subscribeComments(articleId, (comments) => {
      queryClient.setQueryData(queryKey, comments);
    });
  }, [queryClient, JSON.stringify(queryKey), articleId]);
  return useQuery({
    queryKey,
    queryFn: () => getComments(articleId),
  });
}

export function useAddComment(articleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CommentSubmitInput) => addComment(articleId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.comments(articleId) });
    },
  });
}

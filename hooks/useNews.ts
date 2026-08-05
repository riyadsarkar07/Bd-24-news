import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
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
} from "@/services/newsService";
import type { Article, Comment } from "@/types";

export const newsKeys = {
  all: ["news"] as const,
  articles: (opts?: Record<string, unknown>) => ["news", "articles", opts] as const,
  article: (slug: string) => ["news", "article", slug] as const,
  related: (slug: string) => ["news", "related", slug] as const,
  mostRead: ["news", "most-read"] as const,
  trending: ["news", "trending"] as const,
  editorPicks: ["news", "editor-picks"] as const,
  search: (q: string) => ["news", "search", q] as const,
  author: (slug: string) => ["news", "author", slug] as const,
  comments: (id: string) => ["news", "comments", id] as const,
};

export function useArticles(options?: Parameters<typeof getArticles>[0] & { initialData?: Article[] }) {
  const { initialData, ...queryOptions } = options ?? {};
  return useQuery({
    queryKey: newsKeys.articles(options ?? {}),
    queryFn: () => getArticles(queryOptions),
    staleTime: 60 * 1000,
    initialData,
  });
}

export function useArticle(slug: string, initialData?: Article | undefined) {
  return useQuery({
    queryKey: newsKeys.article(slug),
    queryFn: () => getArticleBySlug(slug),
    staleTime: 5 * 60 * 1000,
    initialData,
  });
}

export function useRelatedArticles(slug: string, initialData?: Article[]) {
  return useQuery({
    queryKey: newsKeys.related(slug),
    queryFn: async () => {
      const article = await getArticleBySlug(slug);
      if (!article) return [];
      return getRelatedArticles(article);
    },
    staleTime: 5 * 60 * 1000,
    initialData,
  });
}

export function useMostRead(limit?: number, initialData?: Article[]) {
  return useQuery({
    queryKey: [...newsKeys.mostRead, limit],
    queryFn: () => getMostRead(limit),
    staleTime: 60 * 1000,
    initialData,
  });
}

export function useTrending(limit?: number, initialData?: Article[]) {
  return useQuery({
    queryKey: [...newsKeys.trending, limit],
    queryFn: () => getTrending(limit),
    staleTime: 60 * 1000,
    initialData,
  });
}

export function useEditorPicks(limit?: number, initialData?: Article[]) {
  return useQuery({
    queryKey: [...newsKeys.editorPicks, limit],
    queryFn: () => getEditorPicks(limit),
    staleTime: 60 * 1000,
    initialData,
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
  return useQuery({
    queryKey: [...newsKeys.author(slug), "articles"],
    queryFn: () => getAuthorArticles(slug),
  });
}

export function useComments(articleId: string) {
  return useQuery({
    queryKey: newsKeys.comments(articleId),
    queryFn: () => getComments(articleId),
  });
}

export function useAddComment(articleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      await new Promise((resolve) => setTimeout(resolve, 400));
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
      return comment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.comments(articleId) });
    },
  });
}

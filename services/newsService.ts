import { articles } from "@/data/articles";
import { authors } from "@/data/authors";
import type { Article, Author, Comment, SearchResult } from "@/types";

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const slugify = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

const enrich = (a: Article): Article => ({ ...a, authorSlug: slugify(a.author) });

export async function getArticles(options?: {
  category?: string;
  limit?: number;
  featured?: boolean;
  breaking?: boolean;
  trending?: boolean;
  editorPick?: boolean;
  tag?: string;
  search?: string;
  sort?: "latest" | "popular" | "oldest";
}): Promise<Article[]> {
  await wait();
  let result = [...articles];
  if (options?.category) {
    result = result.filter((a) => a.category === options.category);
  }
  if (options?.featured !== undefined) {
    result = result.filter((a) => a.featured === options.featured);
  }
  if (options?.breaking !== undefined) {
    result = result.filter((a) => a.breaking === options.breaking);
  }
  if (options?.trending !== undefined) {
    result = result.filter((a) => a.trending === options.trending);
  }
  if (options?.editorPick !== undefined) {
    result = result.filter((a) => a.editorPick === options.editorPick);
  }
  if (options?.tag) {
    result = result.filter((a) => a.tags.includes(options.tag as string));
  }
  if (options?.search) {
    const q = options.search.toLowerCase();
    result = result.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.titleBn.includes(options.search as string) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }
  switch (options?.sort) {
    case "popular":
      result = result.sort((a, b) => b.views - a.views);
      break;
    case "oldest":
      result = result.sort((a, b) => +new Date(a.publishedAt) - +new Date(b.publishedAt));
      break;
    default:
      result = result.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
  }
  if (options?.limit) {
    result = result.slice(0, options.limit);
  }
  return result.map(enrich);
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  await wait(150);
  const found = articles.find((a) => a.slug === slug);
  return found ? enrich(found) : undefined;
}

export async function getRelatedArticles(article: Article, limit = 6): Promise<Article[]> {
  await wait(100);
  const sameCategory = articles
    .filter((a) => a.category === article.category && a.id !== article.id)
    .slice(0, limit);
  if (sameCategory.length >= limit) return sameCategory;
  const others = articles.filter((a) => a.category !== article.category && a.id !== article.id).slice(0, limit - sameCategory.length);
  return [...sameCategory, ...others].map(enrich);
}

export async function getMostRead(limit = 6): Promise<Article[]> {
  await wait(100);
  return [...articles].sort((a, b) => b.views - a.views).slice(0, limit).map(enrich);
}

export async function getTrending(limit = 6): Promise<Article[]> {
  await wait(100);
  return articles.filter((a) => a.trending).slice(0, limit).map(enrich);
}

export async function getEditorPicks(limit = 6): Promise<Article[]> {
  await wait(100);
  return articles.filter((a) => a.editorPick).slice(0, limit).map(enrich);
}

export async function searchNews(query: string, limit = 10): Promise<SearchResult[]> {
  await wait(200);
  const results = await getArticles({ search: query, limit });
  return results.map((a) => ({
    id: a.id,
    title: a.titleBn,
    category: a.category,
    categoryColor: a.categoryColor,
    image: a.coverImage,
    slug: a.slug,
    publishedAt: a.publishedAt,
  }));
}

export async function getAuthorBySlug(slug: string): Promise<Author | undefined> {
  await wait(100);
  return authors.find((a) => a.slug === slug);
}

export async function getAuthorArticles(slug: string): Promise<Article[]> {
  await wait(100);
  return articles
    .filter((a) => slugify(a.author) === slug)
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .map(enrich);
}

export async function getComments(articleId: string): Promise<Comment[]> {
  await wait(200);
  return [
    {
      id: `${articleId}-c1`,
      articleId,
      author: "সুমন আহমেদ",
      avatar: "",
      content:
        "খুবই তথ্যবহুল এবং সময়োপযোগী প্রতিবেদন। এমন গঠনমূলক সাংবাদিকতা দেশের জন্য দরকার। ধন্যবাদ বিডি২৪নিউজকে।",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      likes: 24,
      replies: [
        {
          id: `${articleId}-c1r1`,
          articleId,
          author: "নাফিসা ইসলাম",
          avatar: "",
          content: "একমত। আশা করি বিষয়টি নিয়ে আরও বিস্তারিত প্রতিবেদন আসবে।",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          likes: 8,
          replies: [],
        },
      ],
    },
    {
      id: `${articleId}-c2`,
      articleId,
      author: "Rafiul Kabir",
      avatar: "",
      content: "Great reporting as always. The data and sources cited here are credible.",
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      likes: 12,
      replies: [],
    },
  ];
}

export async function getArchiveYears(): Promise<number[]> {
  await wait(50);
  return [2026, 2025, 2024, 2023, 2022];
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/services/newsService";
import { ArticlePage } from "@/features/article/article-page";
import { getCategoryBySlug } from "@/constants/categories";
import { siteConfig } from "@/config/site";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const category = getCategoryBySlug(article.category);
  const url = `${siteConfig.url}/article/${slug}`;

  return {
    title: article.seoTitle ?? article.titleBn,
    description: article.seoDescription ?? article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: article.titleBn,
      description: article.excerpt,
      url,
      images: [{ url: article.coverImage, width: 1200, height: 630, alt: article.titleBn }],
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author],
      section: category.name,
      tags: article.tags,
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title: article.titleBn,
      description: article.excerpt,
      images: [article.coverImage],
    },
    keywords: article.tags,
  };
}

export default async function ArticleRoute({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const category = getCategoryBySlug(article.category);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.titleBn,
    description: article.excerpt,
    image: [article.coverImage],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Person",
      name: article.author,
      url: `${siteConfig.url}/authors/${article.authorSlug}`,
    },
    publisher: {
      "@type": "NewsMediaOrganization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/icons/favicon.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteConfig.url}/article/${slug}` },
    articleSection: category.name,
    keywords: article.tags.join(", "),
    wordCount: article.body.split(/\s+/).length,
    inLanguage: "bn",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      {
        "@type": "ListItem",
        position: 2,
        name: category.nameBn,
        item: `${siteConfig.url}/category/${article.category}`,
      },
      { "@type": "ListItem", position: 3, name: article.titleBn },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ArticlePage article={article} />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, categories } from "@/constants/categories";
import { getArticles } from "@/services/newsService";
import { CategoryPage } from "@/features/category/category-page";
import { siteConfig } from "@/config/site";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!categories.some((c) => c.slug === slug)) return {};
  return {
    title: `${category.nameBn} — ${category.name} News`,
    description: `${category.description}। সত্যের সাথে সবসময় — ${siteConfig.name}।`,
    alternates: { canonical: `${siteConfig.url}/category/${slug}` },
    openGraph: {
      title: `${category.nameBn} খবর`,
      description: category.description,
      url: `${siteConfig.url}/category/${slug}`,
    },
  };
}

export default async function CategoryPageRoute({ params }: Props) {
  const { slug } = await params;
  if (!categories.some((c) => c.slug === slug)) notFound();
  const initialData = await getArticles({ category: slug, sort: "latest", limit: 12 });
  return <CategoryPage slug={slug} initialData={initialData} />;
}

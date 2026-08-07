import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuthorBySlug } from "@/services/newsService";
import { AuthorProfile } from "@/features/authors/author-profile";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return {};
  return {
    title: `${author.nameBn} — ${author.role}`,
    description: author.bio,
    alternates: { canonical: `${siteConfig.url}/authors/${slug}` },
    openGraph: {
      title: author.nameBn,
      description: author.bio,
      images: [{ url: author.avatar }],
    },
  };
}

export default async function AuthorProfileRoute({ params }: Props) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) notFound();
  return <AuthorProfile slug={slug} />;
}

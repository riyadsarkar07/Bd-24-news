import type { Metadata } from "next";
import { NewsEditor } from "@/features/admin/news-editor";
import { articles } from "@/data/articles";

export const metadata: Metadata = {
  title: "Edit Article — BD24News",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return articles.slice(0, 40).map((a) => ({ id: a.id }));
}

export default function AdminNewsEditPage({ params }: { params: Promise<{ id: string }> }) {
  return <NewsEditorWrapper params={params} />;
}

async function NewsEditorWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NewsEditor id={id} />;
}

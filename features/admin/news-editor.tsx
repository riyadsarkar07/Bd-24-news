"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { ArrowLeft, Bold, Italic, List, ListOrdered, Quote, Link2, Image as ImageIcon, Loader2, Save, Send, Eye, Hash } from "lucide-react";
import { PageHeader } from "@/features/admin/admin-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { categories } from "@/constants/categories";
import { articles } from "@/data/articles";

const schema = z.object({
  titleBn: z.string().min(5, "Title is too short"),
  titleEn: z.string().min(5, "English title is too short"),
  category: z.string().min(1, "Select a category"),
  excerpt: z.string().min(20, "Excerpt must be at least 20 characters"),
  body: z.string().min(40, "Body must be at least 40 characters"),
  tags: z.string().optional(),
});

type Schema = z.infer<typeof schema>;

const richActions = [
  { icon: Bold, label: "Bold" },
  { icon: Italic, label: "Italic" },
  { icon: List, label: "Bullet list" },
  { icon: ListOrdered, label: "Numbered list" },
  { icon: Quote, label: "Quote" },
  { icon: Link2, label: "Link" },
  { icon: ImageIcon, label: "Image" },
];

export function NewsEditor({ id }: { id?: string }) {
  const router = useRouter();
  const existing = id ? articles.find((a) => a.id === id) : undefined;
  const [saving, setSaving] = React.useState<"draft" | "publish" | null>(null);
  const [tagInput, setTagInput] = React.useState("");
  const [tags, setTags] = React.useState<string[]>(existing?.tags ?? []);
  const [metaOpen, setMetaOpen] = React.useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      titleBn: existing?.titleBn ?? "",
      titleEn: existing?.title ?? "",
      category: existing?.category ?? "bangladesh",
      excerpt: existing?.excerpt ?? "",
      body: existing?.body.slice(0, 600) ?? "",
      tags: existing?.tags.join(", ") ?? "",
    },
  });

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags((p) => [...p, t]);
    setTagInput("");
  };

  const onSubmit = async (values: Schema) => {
    setSaving("publish");
    await new Promise((r) => setTimeout(r, 900));
    setSaving(null);
    toast.success(id ? "Article updated" : "Article published");
    router.push("/admin/news");
  };

  const onDraft = async (values: Schema) => {
    setSaving("draft");
    await new Promise((r) => setTimeout(r, 700));
    setSaving(null);
    toast.success("Saved as draft");
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/news" className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-brand">
          <ArrowLeft className="h-4 w-4" /> Back to news
        </Link>
        <PageHeader
          title={id ? "Edit Article" : "Write New Article"}
          description={id ? "Update the article content" : "Create and publish a new article"}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-2xl border bg-background p-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titleBn">Bengali title *</Label>
                <Input id="titleBn" placeholder="বাংলা শিরোনাম লিখুন…" {...register("titleBn")} />
                {errors.titleBn && <p className="text-xs font-medium text-danger">{errors.titleBn.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="titleEn">English title *</Label>
                <Input id="titleEn" placeholder="Enter English title…" {...register("titleEn")} />
                {errors.titleEn && <p className="text-xs font-medium text-danger">{errors.titleEn.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt *</Label>
                <Textarea id="excerpt" rows={3} placeholder="Short summary shown in cards…" {...register("excerpt")} />
                {errors.excerpt && <p className="text-xs font-medium text-danger">{errors.excerpt.message}</p>}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <Label>Content *</Label>
              <div className="flex gap-1">
                {richActions.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    title={a.label}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <a.icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              id="body"
              rows={16}
              placeholder="Write the full article content…"
              className="font-sans text-[15px] leading-relaxed"
              {...register("body")}
            />
            {errors.body && <p className="mt-1 text-xs font-medium text-danger">{errors.body.message}</p>}
          </div>

          <div className="rounded-2xl border bg-background p-5">
            <button type="button" onClick={() => setMetaOpen((v) => !v)} className="flex w-full items-center justify-between">
              <span className="text-sm font-bold">SEO & Metadata</span>
              <span className="text-xs text-muted-foreground">{metaOpen ? "Hide" : "Show"}</span>
            </button>
            {metaOpen && (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">SEO title</Label>
                  <Input id="seoTitle" placeholder="Custom SEO title (optional)" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoDesc">Meta description</Label>
                  <Textarea id="seoDesc" rows={2} placeholder="Custom meta description (optional)" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL slug</Label>
                    <Input id="slug" placeholder="auto-generated" defaultValue={existing?.slug} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="Dhaka" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border bg-background p-5">
            <Label className="mb-2 block">Publish settings</Label>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.slug} value={c.slug}>
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                              {c.nameBn}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && <p className="text-xs font-medium text-danger">{errors.category.message}</p>}
              </div>

              <div className="space-y-3">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <Badge key={t} variant="secondary" className="gap-1">
                      <Hash className="h-3 w-3" />
                      {t}
                      <button type="button" onClick={() => setTags((p) => p.filter((x) => x !== t))} className="ml-0.5 text-muted-foreground hover:text-danger" aria-label={`Remove ${t}`}>
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Add tag" />
                  <Button type="button" variant="outline" onClick={addTag}>Add</Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured</Label>
                <Switch id="featured" defaultChecked={existing?.featured} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="breaking">Breaking</Label>
                <Switch id="breaking" defaultChecked={existing?.breaking} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="trending">Trending</Label>
                <Switch id="trending" defaultChecked={existing?.trending} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-background p-5">
            <Label className="mb-3 block">Cover image</Label>
            <button
              type="button"
              className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-muted-foreground transition-colors hover:border-brand hover:text-brand"
            >
              <ImageIcon className="h-8 w-8" />
              <span className="text-xs font-semibold">Upload or choose from media library</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" disabled={!!saving} onClick={() => { toast("Opening preview…"); router.push(`/article/${existing?.slug ?? "placeholder"}`); }}>
              <Eye className="h-4 w-4" /> Preview
            </Button>
            <Button type="button" variant="secondary" disabled={!!saving} onClick={handleSubmit(onDraft)}>
              {saving === "draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Draft
            </Button>
          </div>
          <Button type="submit" disabled={!!saving} className="w-full">
            {saving === "publish" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {id ? "Update article" : "Publish article"}
          </Button>
        </div>
      </form>
    </div>
  );
}

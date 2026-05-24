import { createSupabaseClient } from "./supabase";
import { withTimeout } from "./security";
import type { BlogPost, BlogPostSummary } from "@/types/blog";

const BLOG_FIELDS = "id, slug, title, excerpt, content, cover_image_url, cover_image_alt, tags, created_at, updated_at, is_published" as const;

export const normalizeSearch = (value: string) =>
  value.trim().toLowerCase();

export const matchesSearch = (post: BlogPostSummary, search: string) => {
  const normalizedSearch = normalizeSearch(search);
  if (!normalizedSearch) return true;
  return [post.title, post.excerpt, post.slug]
    .filter(Boolean)
    .some((v) => v?.toLowerCase().includes(normalizedSearch));
};

export const matchesTag = (post: BlogPostSummary, tag: string) => {
  const normalizedTag = normalizeSearch(tag);
  if (!normalizedTag) return true;
  const postTags = Array.isArray(post.tags) ? post.tags : [];
  return postTags.some((t) => typeof t === "string" && t.toLowerCase() === normalizedTag);
};

export const getAllTags = (posts: BlogPostSummary[]) =>
  Array.from(
    new Set(
      posts
        .flatMap((p) => (Array.isArray(p.tags) ? p.tags : []))
        .filter((t): t is string => typeof t === "string")
    )
  ).sort((a, b) => a.localeCompare(b));

export async function getPublishedBlogPosts(limit = 50): Promise<BlogPost[]> {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await withTimeout(
      supabase
        .from("blog_posts")
        .select(BLOG_FIELDS)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(limit),
      5000,
      "Blog posts fetch"
    );
    if (error) {
      console.warn("Unable to load blog posts:", error.message);
      return [];
    }
    return (data ?? []) as BlogPost[];
  } catch (err) {
    console.warn("Unable to load blog posts:", err instanceof Error ? err.message : "Unknown error");
    return [];
  }
}

export function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await withTimeout(
      supabase
        .from("blog_posts")
        .select(BLOG_FIELDS)
        .eq("slug", slug)
        .eq("is_published", true)
        .single(),
      5000,
      "Blog post fetch"
    );
    if (error || !data) {
      console.warn("Blog post not found:", error?.message || slug);
      return null;
    }
    return data as BlogPost;
  } catch (err) {
    console.warn("Blog post fetch failed:", err instanceof Error ? err.message : "Unknown error");
    return null;
  }
}

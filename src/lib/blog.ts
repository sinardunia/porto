import { createSupabaseClient } from "./supabase";
import { withTimeout } from "./security";
import type { BlogPost, BlogPostSummary } from "@/types/blog";

const BLOG_FIELDS = "id, slug, title, excerpt, content, cover_image_url, cover_image_alt, tags, created_at, updated_at, is_published" as const;
const BLOG_SUMMARY_FIELDS = "id, slug, title, excerpt, cover_image_url, cover_image_alt, tags, created_at, updated_at, is_published" as const;

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

export async function getPublishedBlogPostSummaries(limit = 50): Promise<BlogPostSummary[]> {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await withTimeout(
      supabase
        .from("blog_posts")
        .select(BLOG_SUMMARY_FIELDS)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(limit),
      5000,
      "Blog summaries fetch"
    );
    if (error) {
      console.warn("Unable to load blog summaries:", error.message);
      return [];
    }
    return (data ?? []) as BlogPostSummary[];
  } catch (err) {
    console.warn("Unable to load blog summaries:", err instanceof Error ? err.message : "Unknown error");
    return [];
  }
}

export function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/* Safe date helpers — never crash on invalid/missing dates */
export const safeDate = (value: string | null | undefined): Date | null => {
  if (!value || typeof value !== "string") return null;
  const d = new Date(value.trim());
  return Number.isNaN(d.getTime()) ? null : d;
};

export const safeIsoDate = (value: string | null | undefined): string => {
  const d = safeDate(value);
  return d ? d.toISOString() : "";
};

export const safeLocaleDate = (
  value: string | null | undefined,
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" }
): string => {
  const d = safeDate(value);
  return d ? new Intl.DateTimeFormat(locale, options).format(d) : "";
};

/**
 * Enhanced related posts algorithm with multi-factor relevance scoring:
 * 1. Tag overlap (highest weight) - posts sharing common tags
 * 2. Content similarity - title/excerpt keyword matching
 * 3. Recency (tie-breaker) - newer posts preferred
 * 4. Category inference - posts with similar tag patterns
 * Falls back to recent posts if no strong matches found.
 */
export function getRelatedPosts(
  currentPost: BlogPost,
  allPosts: BlogPostSummary[],
  limit = 3
): BlogPostSummary[] {
  const currentSlug = currentPost?.slug;
  if (!currentSlug) return [];

  // Normalize current post data
  const currentTags = new Set(
    (currentPost.tags ?? [])
      .map((t) => (typeof t === "string" ? t.toLowerCase().trim() : ""))
      .filter(Boolean)
  );
  
  // Extract keywords from title and excerpt
  const currentText = `${currentPost.title} ${currentPost.excerpt || ""}`.toLowerCase();
  const currentKeywords = currentText
    .split(/\s+/)
    .filter(w => w.length > 3 && !['dengan','dalam','untuk','pada','yang','dari','oleh'].includes(w));

  const scored = allPosts
    .filter((p) => p && p.slug !== currentSlug)
    .map((p) => {
      const postTags = (p.tags ?? [])
        .map((t) => (typeof t === "string" ? t.toLowerCase().trim() : ""))
        .filter(Boolean);

      // Score 1: Tag overlap (weight: 10 points per shared tag)
      const tagOverlap = currentTags.size > 0
        ? postTags.filter((t) => currentTags.has(t)).length
        : 0;
      const tagScore = tagOverlap * 10;

      // Score 2: Text similarity (weight: 2 points per shared keyword)
      const postText = `${p.title} ${p.excerpt || ""}`.toLowerCase();
      const keywordMatches = currentKeywords.filter(kw => postText.includes(kw)).length;
      const textScore = Math.min(keywordMatches * 2, 10); // Cap at 10

      // Score 3: Category affinity (posts with similar tag count/patterns)
      const categoryScore = (postTags.length > 0 && currentTags.size > 0) 
        ? Math.min(Math.abs(postTags.length - currentTags.size), 3) // Smaller difference = better
        : 0;

      // Score 4: Recency boost (0-5 points for posts within 90 days)
      const createdAt = safeDate(p.created_at);
      const currentDate = safeDate(currentPost.created_at);
      let recencyScore = 0;
      if (createdAt && currentDate) {
        const daysDiff = Math.abs(currentDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff < 30) recencyScore = 5;
        else if (daysDiff < 90) recencyScore = 3;
        else if (daysDiff < 180) recencyScore = 1;
      }

      // Total score (max ~35 points)
      const totalScore = tagScore + textScore + recencyScore - categoryScore;

      return {
        post: p,
        score: totalScore,
        tagOverlap,
        createdAt: createdAt ? createdAt.getTime() : 0,
      };
    })
    .sort((a, b) => {
      // Primary: relevance score
      if (b.score !== a.score) return b.score - a.score;
      // Secondary: tag overlap count
      if (b.tagOverlap !== a.tagOverlap) return b.tagOverlap - a.tagOverlap;
      // Tertiary: recency
      return b.createdAt - a.createdAt;
    });

  // If no strong matches (all scores < 5), fall back to recent posts
  const strongMatches = scored.filter(s => s.score >= 5);
  const finalResults = strongMatches.length >= limit 
    ? strongMatches 
    : scored;

  return finalResults.slice(0, limit).map((s) => s.post);
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

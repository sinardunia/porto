import { createSupabaseClient } from "./supabase";
import { withTimeout } from "./security";
import type { BlogPost, BlogPostSummary } from "@/types/blog";

const BLOG_FIELDS = "id, slug, title, excerpt, content, cover_image_url, cover_image_alt, tags, created_at, updated_at, is_published" as const;
// Optimized fields for homepage - excludes heavy 'content' field to save bandwidth
const BLOG_SUMMARY_FIELDS = "id, slug, title, excerpt, cover_image_url, cover_image_alt, tags, created_at" as const;

export const normalizeSearch = (value: string) =>
  value.trim().toLowerCase();

/**
 * Generate URL-safe slug from title
 * - Normalize accents (é → e, ñ → n)
 * - Lowercase
 * - Replace spaces with hyphens
 * - Remove special characters
 * - Max 120 chars
 * - Fallback timestamp if empty
 */
export const slugify = (title: string): string => {
  let slug = title
    .normalize("NFD") // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove combining diacritics
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, "") // Trim leading/trailing hyphens
    .slice(0, 120);
  
  // Fallback: if slug is empty after cleaning, use timestamp
  if (!slug || slug.length === 0) {
    slug = `post-${Date.now()}`;
  }
  
  return slug;
};

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
  const supabase = createSupabaseClient();
  const { data, error } = await withTimeout(
    supabase
      .from("blog_posts")
      .select(BLOG_FIELDS)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(limit),
    15000,
    "Blog posts fetch"
  );
  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }
  return (data ?? []) as BlogPost[];
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

// Humanize timestamp: "2 hours ago", "Yesterday", "3 days ago", etc
export const humanizeTimestamp = (value: string | null | undefined, locale = "id-ID"): string => {
  const d = safeDate(value);
  if (!d) return "";

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  // Indonesian humanize
  if (locale === "id-ID") {
    if (diffSecs < 60) return "baru saja";
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays === 1) return "kemarin";
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    if (diffWeeks < 4) return `${diffWeeks} minggu yang lalu`;
    if (diffMonths < 12) return `${diffMonths} bulan yang lalu`;
    return `${diffYears} tahun yang lalu`;
  }

  // English fallback
  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
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

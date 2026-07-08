import { getCollection, type CollectionEntry } from "astro:content";
import type { BlogPost, BlogPostSummary, PostsByYear } from "@/types/blog";
import { normalizePostTags, tagKey } from "@/lib/tags";
import { AI_TAGS } from "@/data/config";

type BlogEntry = CollectionEntry<"blog">;

const getSlug = (entry: BlogEntry) => entry.id;

const toIsoString = (date: Date) => date.toISOString();

const isAIGenerated = (tags: string[]): boolean => {
  if (!tags || tags.length === 0) return false;
  // Simple detection: check if any tag contains "ai" (case-insensitive)
  // This handles "ai-generated", "Ai Generated", "ai", etc.
  return tags.some((tag) => tag.toLowerCase().includes('ai'));
};

const entryToPost = (entry: BlogEntry): BlogPost => ({
  id: entry.id,
  slug: getSlug(entry),
  title: entry.data.title,
  description: entry.data.description ?? null,
  content: entry.body ?? "",
  coverImage: entry.data.coverImage ?? null,
  tags: normalizePostTags(entry.data.tags),
  pubDatetime: toIsoString(entry.data.pubDatetime),
  modDatetime: entry.data.modDatetime ? toIsoString(entry.data.modDatetime) : null,
  draft: entry.data.draft,
  featured: entry.data.featured,
  aiGenerated: isAIGenerated(normalizePostTags(entry.data.tags)),
});

const entryToSummary = (entry: BlogEntry): BlogPostSummary => {
  const post = entryToPost(entry);
  const { content: _content, ...summary } = post;
  summary.readTime = post.content ? estimateReadTime(post.content) : 0;
  summary.preview = post.content
    ? post.content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 120) + "…"
    : undefined;
  return summary;
};

const sortByPubDate = (a: BlogEntry, b: BlogEntry) =>
  b.data.pubDatetime.getTime() - a.data.pubDatetime.getTime();

export async function getPublishedBlogEntries(): Promise<BlogEntry[]> {
  const entries = await getCollection("blog", ({ data }) => !data.draft);
  return entries.sort(sortByPubDate);
}

export async function getPublishedBlogPosts(limit = 50): Promise<BlogPost[]> {
  return (await getPublishedBlogEntries()).slice(0, limit).map(entryToPost);
}

export async function getAllPublishedBlogPostSummaries(): Promise<BlogPostSummary[]> {
  return (await getPublishedBlogEntries()).map(entryToSummary);
}

export async function getPublishedBlogPostSummaries(limit?: number): Promise<BlogPostSummary[]> {
  const all = await getAllPublishedBlogPostSummaries();
  return limit === undefined ? all : all.slice(0, limit);
}

export async function getBlogEntryBySlug(slug: string): Promise<BlogEntry | null> {
  const entries = await getPublishedBlogEntries();
  return entries.find((entry) => getSlug(entry) === slug) ?? null;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const entry = await getBlogEntryBySlug(slug);
  return entry ? entryToPost(entry) : null;
}

export const normalizeSearch = (value: string) => value.trim().toLowerCase();

export const matchesSearch = (post: BlogPostSummary, search: string) => {
  const normalizedSearch = normalizeSearch(search);
  if (!normalizedSearch) return true;
  const tags = Array.isArray(post.tags) ? post.tags : [];
  return [post.title, post.description, post.slug, ...tags]
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(normalizedSearch));
};

export const matchesTag = (post: BlogPostSummary, tag: string) => {
  const key = tagKey(tag);
  if (!key) return true;
  return post.tags.some((t) => tagKey(t) === key);
};

export { collectTagCounts, getPopularTags, filterPostsByTag, findTagBySlug, tagToSlug } from "@/lib/tags";

export function groupPostsByYear(posts: BlogPostSummary[]): PostsByYear[] {
  const byYear = new Map<number, BlogPostSummary[]>();

  for (const post of posts) {
    const year = new Date(post.pubDatetime).getFullYear();
    const group = byYear.get(year) ?? [];
    group.push(post);
    byYear.set(year, group);
  }

  return [...byYear.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, yearPosts]) => ({ year, posts: yearPosts }));
}

export function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

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
  locale = "id-ID",
  options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" }
): string => {
  const d = safeDate(value);
  return d ? new Intl.DateTimeFormat(locale, options).format(d) : "";
};

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

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
};

export function getRelatedPosts(
  currentPost: BlogPost,
  allPosts: BlogPostSummary[],
  limit = 3
): BlogPostSummary[] {
  const currentSlug = currentPost?.slug;
  if (!currentSlug) return [];

  const currentTags = new Set(
    (currentPost.tags ?? []).map((t) => t.toLowerCase().trim()).filter(Boolean)
  );

  const currentText = `${currentPost.title} ${currentPost.description || ""}`.toLowerCase();
  const stopWords = new Set(["dengan", "dalam", "untuk", "pada", "yang", "dari", "oleh"]);
  const currentKeywords = currentText
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));

  const scored = allPosts
    .filter((p) => p.slug !== currentSlug && !p.aiGenerated)
    .map((p) => {
      const postTags = p.tags.map((t) => t.toLowerCase().trim()).filter(Boolean);
      const tagOverlap =
        currentTags.size > 0 ? postTags.filter((t) => currentTags.has(t)).length : 0;
      const tagScore = tagOverlap * 10;

      const postText = `${p.title} ${p.description || ""}`.toLowerCase();
      const keywordMatches = currentKeywords.filter((kw) => postText.includes(kw)).length;
      const textScore = Math.min(keywordMatches * 2, 10);

      const createdAt = safeDate(p.pubDatetime);
      const currentDate = safeDate(currentPost.pubDatetime);
      let recencyScore = 0;
      if (createdAt && currentDate) {
        const daysDiff =
          Math.abs(currentDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff < 30) recencyScore = 5;
        else if (daysDiff < 90) recencyScore = 3;
        else if (daysDiff < 180) recencyScore = 1;
      }

      return {
        post: p,
        score: tagScore + textScore + recencyScore,
        tagOverlap,
        createdAt: createdAt ? createdAt.getTime() : 0,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.tagOverlap !== a.tagOverlap) return b.tagOverlap - a.tagOverlap;
      return b.createdAt - a.createdAt;
    });

  const strongMatches = scored.filter((s) => s.score >= 5);
  const finalResults = strongMatches.length >= limit ? strongMatches : scored;

  return finalResults.slice(0, limit).map((s) => s.post);
}

export function toTitleCase(str: string): string {
  return str.replace(/\b\w+\b/g, (word) => {
    if (word === word.toUpperCase() && word.length > 1) return word;
    if (word !== word.toLowerCase()) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
}

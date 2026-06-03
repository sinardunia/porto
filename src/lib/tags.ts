import type { BlogPostSummary, TagCount } from "@/types/blog";

/** Stable URL slug and dedupe key for a tag. */
export function tagKey(tag: string): string {
  return tag.trim().toLowerCase();
}

/** Display label: title-case words, trimmed. */
export function formatTagName(tag: string): string {
  const trimmed = tag.trim();
  if (!trimmed) return "";

  return trimmed
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function tagToSlug(tag: string): string {
  return tagKey(tag);
}

/** Normalize and dedupe tags on a single post (case-insensitive). */
export function normalizePostTags(tags: string[] | undefined | null): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of tags ?? []) {
    const key = tagKey(raw);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const name = formatTagName(raw);
    if (name) result.push(name);
  }

  return result;
}

/** Collect tag usage from all published posts; sort by count desc, then name. */
export function collectTagCounts(posts: BlogPostSummary[]): TagCount[] {
  const counts = new Map<string, TagCount>();

  for (const post of posts) {
    for (const name of post.tags) {
      const slug = tagToSlug(name);
      if (!slug) continue;

      const existing = counts.get(slug);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(slug, { name, slug, count: 1 });
      }
    }
  }

  return [...counts.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
}

export function getPopularTags(posts: BlogPostSummary[], limit = 8): TagCount[] {
  return collectTagCounts(posts).slice(0, limit);
}

export function findTagBySlug(posts: BlogPostSummary[], slug: string): TagCount | undefined {
  const key = tagKey(slug);
  if (!key) return undefined;
  return collectTagCounts(posts).find((t) => t.slug === key);
}

export function filterPostsByTag(posts: BlogPostSummary[], slug: string): BlogPostSummary[] {
  const key = tagKey(slug);
  if (!key) return [];
  return posts.filter((post) => post.tags.some((t) => tagKey(t) === key));
}

export function matchesTagSlug(post: BlogPostSummary, slug: string): boolean {
  const key = tagKey(slug);
  if (!key) return true;
  return post.tags.some((t) => tagKey(t) === key);
}

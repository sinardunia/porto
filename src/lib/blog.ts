import type { BlogPostSummary } from "@/types/blog";

export const normalizeSearch = (value: string) =>
  value.trim().toLowerCase();

export const matchesSearch = (post: BlogPostSummary, search: string) => {
  const normalizedSearch = normalizeSearch(search);
  if (!normalizedSearch) return true;

  return [post.title, post.excerpt, post.slug]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(normalizedSearch));
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

import { SITE_URL } from "@/data/config";

/** Resolve a CMS cover image path to a public URL. */
export function resolveImageSrc(src: string | null | undefined): string | null {
  if (!src?.trim()) return null;
  const path = src.trim();
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return path;
  return `/images/${path.replace(/^images\//, "")}`;
}

export function resolveOgImageSrc(
  coverImage: string | null | undefined,
  fallback = "/opengraph-image.jpg"
): string {
  const resolved = resolveImageSrc(coverImage);
  if (!resolved) return new URL(fallback, SITE_URL).toString();
  if (resolved.startsWith("http")) return resolved;
  return new URL(resolved, SITE_URL).toString();
}

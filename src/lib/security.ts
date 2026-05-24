const TEXT_CONTROL_CHARS =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const DANGEROUS_TAGS =
  /<\/?(?:script|iframe|object|embed|form|input|button|textarea|select|option|meta|link|base|style|svg|math|canvas|video|audio|source|track)[^>]*>/gi;

const EVENT_HANDLER_ATTRIBUTES =
  /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

const DANGEROUS_URL_ATTRIBUTES =
  /\s+(href|src)\s*=\s*(["'])\s*(?:javascript|data|vbscript):[^"']*\2/gi;

const UNSAFE_STYLE_ATTRIBUTES =
  /\s+style\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

/* =========================
   MEDIA TYPES (IMAGE + VIDEO)
========================= */

export const ALLOWED_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",

  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-matroska", // mkv (optional tapi sering kepakai)
] as const;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB

/* =========================
   CLEAN TEXT
========================= */

export const cleanText = (
  value: FormDataEntryValue | string | null,
  maxLength: number
) =>
  String(value || "")
    .replace(TEXT_CONTROL_CHARS, "")
    .trim()
    .slice(0, maxLength);

/* =========================
   SLUG
========================= */

export const normalizeSlug = (slug: string) =>
  slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);

/* =========================
   MEDIA EXTENSION
========================= */

export const normalizeMediaExtension = (file: File) => {
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";

  if (file.type === "video/mp4") return "mp4";
  if (file.type === "video/quicktime") return "mov";
  if (file.type === "video/webm") return "webm";

  return "bin";
};

/* =========================
   VALIDATE MEDIA (IMAGE + VIDEO)
========================= */

export const validateMediaFile = (file: File) => {
  const isAllowed = (ALLOWED_MEDIA_TYPES as readonly string[]).includes(
    file.type
  );

  if (!isAllowed) {
    return "Only images (JPEG, PNG, WebP) and videos (MP4, MOV, WebM) are allowed.";
  }

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return "Image must be smaller than 5MB.";
  }

  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    return "Video must be smaller than 20MB.";
  }

  if (!isImage && !isVideo) {
    return "Unsupported media type.";
  }

  return null;
};

/* =========================
   YOUTUBE EMBED
========================= */

const YOUTUBE_PATTERNS = [
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
];

export const extractYouTubeId = (url: string): string | null => {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export const convertYouTubeLinks = (html: string): string => {
  // Protect content inside <pre>, <code>, <script>, <style>, <textarea>
  const protectedBlocks: string[] = [];
  let protectedIndex = 0;
  const protectedHtml = html.replace(
    /<(pre|code|script|style|textarea)\b[^>]*>[\s\S]*?<\/\1>/gi,
    (match) => {
      const placeholder = `__PROTECTED_${protectedIndex}__`;
      protectedBlocks[protectedIndex++] = match;
      return placeholder;
    }
  );

  // Step 1: Replace <a> tags that are plain YouTube links
  let result = protectedHtml.replace(
    /<a\s+href="([^"]+)"[^>]*>([^<]*)<\/a>/g,
    (match, href: string, text: string) => {
      const id = extractYouTubeId(href);
      if (!id) return match;
      if (text.trim() !== href.trim()) return match;
      return `<div class="youtube-embed" data-id="${id}"><div class="youtube-placeholder"></div></div>`;
    }
  );

  // Step 2: Replace standalone plain-text YouTube URLs
  result = result.replace(
    /(^|>|\s)((?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}|youtu\.be\/[a-zA-Z0-9_-]{11}|youtube\.com\/embed\/[a-zA-Z0-9_-]{11}|youtube\.com\/shorts\/[a-zA-Z0-9_-]{11})[^"'<>\s]*)(?=[\s<.,;:!?)\]"']|$)/g,
    (match, before: string, url: string) => {
      const id = extractYouTubeId(url);
      if (!id) return match;
      return `${before}<div class="youtube-embed" data-id="${id}"><div class="youtube-placeholder"></div></div>`;
    }
  );

  // Restore protected blocks
  protectedBlocks.forEach((block, i) => {
    result = result.split(`__PROTECTED_${i}__`).join(block);
  });

  return result;
};

/* =========================
   SANITIZER
========================= */

export const sanitizeRenderedHtml = async (html: string): Promise<string> => {
  const DOMPurify = (await import("isomorphic-dompurify")).default;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "code", "pre", "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "blockquote", "a", "img", "span", "div", "iframe"
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "id", "target", "allowfullscreen", "frameborder", "data-id", "loading", "decoding"]
  });
};

/* =========================
   TIMEOUT WRAPPER
========================= */

export const withTimeout = async <T>(
  promise: PromiseLike<T>,
  milliseconds: number,
  label: string
) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out.`));
    }, milliseconds);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};
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
   SANITIZER
========================= */

export const sanitizeRenderedHtml = (html: string) =>
  html
    .replace(DANGEROUS_TAGS, "")
    .replace(EVENT_HANDLER_ATTRIBUTES, "")
    .replace(DANGEROUS_URL_ATTRIBUTES, "")
    .replace(UNSAFE_STYLE_ATTRIBUTES, "")
    .replace(/<!--([\s\S]*?)-->/g, "");

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
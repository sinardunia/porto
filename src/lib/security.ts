const TEXT_CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const DANGEROUS_TAGS = /<\/?(?:script|iframe|object|embed|form|input|button|textarea|select|option|meta|link|base|style|svg|math|canvas|video|audio|source|track)[^>]*>/gi;
const EVENT_HANDLER_ATTRIBUTES = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const DANGEROUS_URL_ATTRIBUTES = /\s+(href|src)\s*=\s*(["'])\s*(?:javascript|data|vbscript):[^"']*\2/gi;
const UNSAFE_STYLE_ATTRIBUTES = /\s+style\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const cleanText = (value: FormDataEntryValue | string | null, maxLength: number) =>
  String(value || "")
    .replace(TEXT_CONTROL_CHARS, "")
    .trim()
    .slice(0, maxLength);

export const normalizeSlug = (slug: string) =>
  slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);

export const normalizeImageExtension = (file: File) => {
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
};

export const validateImageFile = (file: File) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return "Only JPEG, PNG, and WebP images are allowed.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Image must be smaller than 5MB.";
  }

  return null;
};

export const sanitizeRenderedHtml = (html: string) =>
  html
    .replace(DANGEROUS_TAGS, "")
    .replace(EVENT_HANDLER_ATTRIBUTES, "")
    .replace(DANGEROUS_URL_ATTRIBUTES, "")
    .replace(UNSAFE_STYLE_ATTRIBUTES, "")
    .replace(/<!--([\s\S]*?)-->/g, "");

export const withTimeout = async <T>(promise: PromiseLike<T>, milliseconds: number, label: string) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} timed out.`)), milliseconds);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

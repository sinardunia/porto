import { defineMiddleware } from "astro:middleware";

const securityHeaders = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",

    // 🔥 FIX INI PENTING
    "img-src 'self' data: https: blob:",
    "media-src 'self' data: https: blob:",

    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",

    "script-src 'self' 'unsafe-inline' https://utteranc.es",

    // 🔥 FIX INI JUGA (fetch + dev tools + preview system)
    "connect-src 'self' https: blob:",

    "frame-src https://utteranc.es https://*.cbox.ws https://www.youtube.com https://www.youtube-nocookie.com",
    "form-action 'self'",
  ].join("; "),
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
};

export const onRequest = defineMiddleware(async (_, next) => {
  const response = await next();

  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  return response;
});

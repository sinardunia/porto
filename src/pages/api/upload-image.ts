import type { APIRoute } from "astro";
import { json, verifyAdminSecret } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { validateMediaFile, withTimeout, normalizeMediaExtension } from "@/lib/security";

export const prerender = false;

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};

const BLOG_IMAGES_BUCKET = "blog-images";

const getStoragePath = (file: File) => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const id = crypto.randomUUID();
  const extension = normalizeMediaExtension(file);
  return `inline/${year}/${month}/${id}.${extension}`;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const auth = verifyAdminSecret(request);
    if (!auth.ok) return auth.response;

    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File) || file.size === 0) {
      return json({ message: "No image file provided." }, 400);
    }

    const validationError = validateMediaFile(file);
    if (validationError) {
      return json({ message: validationError }, 400);
    }

    const supabase = createSupabaseAdminClient();
    const path = getStoragePath(file);
    const buffer = await file.arrayBuffer();

    const { error } = await withTimeout(
      supabase.storage.from(BLOG_IMAGES_BUCKET).upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      }),
      15000,
      "Inline image upload"
    );

    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from(BLOG_IMAGES_BUCKET).getPublicUrl(path);

    return json({ ok: true, url: data.publicUrl }, 200);
  } catch (err) {
    console.error("[UPLOAD_IMAGE] Error:", err);
    return json(
      { message: err instanceof Error ? err.message : "Upload failed." },
      500
    );
  }
};

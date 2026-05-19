import type { APIRoute } from "astro";
import { json, verifyAdminSecret } from "@/lib/api";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { cleanText, normalizeImageExtension, validateImageFile, withTimeout } from "@/lib/security";

export const prerender = false;

const THOUGHT_IMAGES_BUCKET = "thought-images";

const getStoragePath = (file: File) => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const id = crypto.randomUUID();
  const extension = normalizeImageExtension(file);

  return `thoughts/${year}/${month}/${id}.${extension}`;
};

const uploadImage = async (file: File) => {
  const supabase = createSupabaseAdminClient();
  const path = getStoragePath(file);
  const buffer = await file.arrayBuffer();

  const { error } = await withTimeout(
    supabase.storage
      .from(THOUGHT_IMAGES_BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      }),
    15000,
    "Thought image upload"
  );

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data } = supabase.storage
    .from(THOUGHT_IMAGES_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const auth = verifyAdminSecret(request);
    if (!auth.ok) return auth.response;

    const formData = await request.formData();
    const content = cleanText(formData.get("content"), 5000);
    const imageAlt = cleanText(formData.get("imageAlt"), 300);
    const image = formData.get("image");

    if (!content) {
      return json({ message: "Thought content is required." }, 400);
    }

    let imageUrl: string | null = null;

    if (image instanceof File && image.size > 0) {
      const imageError = validateImageFile(image);
      if (imageError) return json({ message: imageError }, 400);

      try {
        imageUrl = await uploadImage(image);
      } catch (error) {
        console.error("Thought image upload failed:", error instanceof Error ? error.message : error);
        return json({ message: "Image upload failed." }, 502);
      }
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await withTimeout(
      supabase
        .from("thoughts")
        .insert({
          content,
          image_url: imageUrl,
          image_alt: imageAlt || null,
          is_published: true,
        })
        .select("id")
        .single(),
      10000,
      "Thought insert"
    );

    if (error) {
      console.error("Thought insert failed:", error.message);
      return json({ message: "Thought insert failed." }, 500);
    }

    return json({ id: data.id, message: "Thought published." }, 201);
  } catch (error) {
    console.error("Failed to publish thought:", error instanceof Error ? error.message : error);
    return json({ message: "Failed to publish thought." }, 500);
  }
};

export const ALL: APIRoute = async () =>
  json({ message: "Method not allowed." }, 405);

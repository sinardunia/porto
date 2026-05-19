import type { APIRoute } from "astro";
import { createSupabaseAdminClient } from "@/lib/supabase";

export const prerender = false;

const THOUGHT_IMAGES_BUCKET = "thought-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });

const getBearerToken = (request: Request) => {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  return authorization.slice("Bearer ".length).trim();
};

const getFileExtension = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension) return extension.replace(/[^a-z0-9]/g, "");

  const mimeExtension = file.type.split("/").pop()?.toLowerCase();
  return mimeExtension?.replace(/[^a-z0-9]/g, "") || "jpg";
};

const getStoragePath = (file: File) => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const id = crypto.randomUUID();
  const extension = getFileExtension(file);

  return `thoughts/${year}/${month}/${id}.${extension}`;
};

const uploadImage = async (file: File) => {
  const supabase = createSupabaseAdminClient();
  const path = getStoragePath(file);
  const buffer = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from(THOUGHT_IMAGES_BUCKET)
    .upload(path, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data } = supabase.storage
    .from(THOUGHT_IMAGES_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const expectedSecret = import.meta.env.THOUGHTS_ADMIN_SECRET;
    const providedSecret = getBearerToken(request);

    if (!expectedSecret) {
      return json({ message: "THOUGHTS_ADMIN_SECRET is not configured." }, 500);
    }

    if (!providedSecret || providedSecret !== expectedSecret) {
      return json({ message: "Unauthorized." }, 401);
    }

    const formData = await request.formData();
    const content = String(formData.get("content") || "").trim();
    const imageAlt = String(formData.get("imageAlt") || "").trim();
    const image = formData.get("image");

    if (!content) {
      return json({ message: "Thought content is required." }, 400);
    }

    let imageUrl: string | null = null;

    if (image instanceof File && image.size > 0) {
      if (!image.type.startsWith("image/")) {
        return json({ message: "Uploaded file must be an image." }, 400);
      }

      if (image.size > MAX_IMAGE_SIZE) {
        return json({ message: "Image must be smaller than 5MB." }, 400);
      }

      imageUrl = await uploadImage(image);
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("thoughts")
      .insert({
        content,
        image_url: imageUrl,
        image_alt: imageAlt || null,
        is_published: true,
      })
      .select("id")
      .single();

    if (error) {
      return json({ message: `Thought insert failed: ${error.message}` }, 500);
    }

    return json({ id: data.id, message: "Thought published." }, 201);
  } catch (error) {
    return json(
      {
        message: error instanceof Error ? error.message : "Failed to publish thought.",
      },
      500
    );
  }
};

export const ALL: APIRoute = async () =>
  json({ message: "Method not allowed." }, 405);

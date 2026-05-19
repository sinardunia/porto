import type { APIRoute } from "astro";
import { createSupabaseAdminClient } from "@/lib/supabase";

export const prerender = false;

const BLOG_IMAGES_BUCKET = "blog-images";
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

const normalizeSlug = (slug: string) =>
  slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

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

  return `blog/${year}/${month}/${id}.${extension}`;
};

const uploadCoverImage = async (file: File) => {
  const supabase = createSupabaseAdminClient();
  const path = getStoragePath(file);
  const buffer = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from(BLOG_IMAGES_BUCKET)
    .upload(path, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (error) throw new Error(`Cover image upload failed: ${error.message}`);

  const { data } = supabase.storage
    .from(BLOG_IMAGES_BUCKET)
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
    const title = String(formData.get("title") || "").trim();
    const slug = normalizeSlug(String(formData.get("slug") || ""));
    const excerpt = String(formData.get("excerpt") || "").trim();
    const content = String(formData.get("content") || "").trim();
    const coverImageAlt = String(formData.get("coverImageAlt") || "").trim();
    const coverImage = formData.get("coverImage");
    const isPublished = formData.get("isPublished") === "on";

    if (!title) {
      return json({ message: "Title is required." }, 400);
    }

    if (!slug) {
      return json({ message: "Slug is required." }, 400);
    }

    if (!content) {
      return json({ message: "Blog post content is required." }, 400);
    }

    let coverImageUrl: string | null = null;

    if (coverImage instanceof File && coverImage.size > 0) {
      if (!coverImage.type.startsWith("image/")) {
        return json({ message: "Uploaded file must be an image." }, 400);
      }

      if (coverImage.size > MAX_IMAGE_SIZE) {
        return json({ message: "Image must be smaller than 5MB." }, 400);
      }

      coverImageUrl = await uploadCoverImage(coverImage);
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        slug,
        title,
        excerpt: excerpt || null,
        content,
        cover_image_url: coverImageUrl,
        cover_image_alt: coverImageAlt || null,
        is_published: isPublished,
      })
      .select("id, slug, is_published")
      .single();

    if (error) {
      return json({ message: `Blog post insert failed: ${error.message}` }, 500);
    }

    return json(
      {
        id: data.id,
        slug: data.slug,
        isPublished: data.is_published,
        message: data.is_published ? "Blog post published." : "Blog post saved as draft.",
      },
      201
    );
  } catch (error) {
    return json(
      {
        message: error instanceof Error ? error.message : "Failed to save blog post.",
      },
      500
    );
  }
};

export const ALL: APIRoute = async () =>
  json({ message: "Method not allowed." }, 405);

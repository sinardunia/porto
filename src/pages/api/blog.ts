import type { APIRoute } from "astro";

import {
  json,
  verifyAdminSecret,
} from "@/lib/api";

import {
  createSupabaseAdminClient,
} from "@/lib/supabase";

import {
  cleanText,
  normalizeMediaExtension,
  normalizeSlug,
  validateMediaFile,
  withTimeout,
} from "@/lib/security";

export const prerender = false;

const BLOG_IMAGES_BUCKET =
  "blog-images";

/* ---------------------------------
   STORAGE HELPERS
---------------------------------- */

const getStoragePath = (
  file: File
) => {
  const now = new Date();

  const year =
    now.getUTCFullYear();

  const month = String(
    now.getUTCMonth() + 1
  ).padStart(2, "0");

  const id = crypto.randomUUID();

  const extension =
    normalizeMediaExtension(file);

  return `blog/${year}/${month}/${id}.${extension}`;
};

const uploadCoverImage =
  async (file: File) => {
    const supabase =
      createSupabaseAdminClient();

    const path =
      getStoragePath(file);

    const buffer =
      await file.arrayBuffer();

    const { error } =
      await withTimeout(
        supabase.storage
          .from(BLOG_IMAGES_BUCKET)
          .upload(path, buffer, {
            contentType:
              file.type,

            upsert: false,
          }),

        15000,

        "Blog cover image upload"
      );

    if (error) {
      throw new Error(
        error.message
      );
    }

    const { data } =
      supabase.storage
        .from(
          BLOG_IMAGES_BUCKET
        )
        .getPublicUrl(path);

    return data.publicUrl;
  };

/* ---------------------------------
   GET
---------------------------------- */

export const GET: APIRoute =
  async () => {
    return json({
      ok: true,

      message:
        "Blog API running",
    });
  };

/* ---------------------------------
   OPTIONS
---------------------------------- */

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,

    headers: {
      "Access-Control-Allow-Origin": "*",

      "Access-Control-Allow-Methods":
        "GET, POST, OPTIONS",

      "Access-Control-Allow-Headers":
        "Content-Type, Authorization",
    },
  });
};

/* ---------------------------------
   POST
---------------------------------- */

export const POST: APIRoute =
  async ({ request }) => {
    try {
      console.log(
        "[BLOG_API] Incoming POST"
      );

      const auth =
        verifyAdminSecret(
          request
        );

      if (!auth.ok) {
        return auth.response;
      }

      const formData =
        await request.formData();

      const title = cleanText(
        formData.get("title"),
        180
      );

      const slug =
        normalizeSlug(
          cleanText(
            formData.get("slug"),
            160
          )
        );

      const excerpt =
        cleanText(
          formData.get(
            "excerpt"
          ),
          500
        );

      const content =
        cleanText(
          formData.get(
            "content"
          ),
          200000
        );

      const coverImageAlt =
        cleanText(
          formData.get(
            "coverImageAlt"
          ),
          300
        );

      const coverImage =
        formData.get(
          "coverImage"
        );

      /* -------------------------
         TAGS
      -------------------------- */

      const rawTags = cleanText(
        formData.get("tags"),
        500
      );

      const tags = rawTags
        ? rawTags
            .split(",")
            .map((t) =>
              t
                .trim()
                .toLowerCase()
                .replace(
                  /[^a-z0-9\s-]/g,
                  ""
                )
                .replace(
                  /\s+/g,
                  " "
                )
                .trim()
            )
            .filter(
              (t) => t.length > 0 && t.length <= 30
            )
        : [];

      /* -------------------------
         VALIDATION
      -------------------------- */

      if (!title) {
        return json(
          {
            message:
              "Title is required.",
          },
          400
        );
      }

      if (!slug) {
        return json(
          {
            message:
              "Slug is required.",
          },
          400
        );
      }

      if (!content) {
        return json(
          {
            message:
              "Blog post content is required.",
          },
          400
        );
      }

      if (content.length > 200000) {
        return json(
          {
            message:
              "Content is too long (max 200,000 characters).",
          },
          400
        );
      }

      if (!/^[a-z0-9-]+$/.test(slug)) {
        return json(
          {
            message:
              "Slug can only contain lowercase letters, numbers, and hyphens.",
          },
          400
        );
      }

      const supabase = createSupabaseAdminClient();

      /* -------------------------
         CHECK SLUG EXISTS
      -------------------------- */
      const { data: existingSlug } = await withTimeout(
        supabase.from("blog_posts").select("id").eq("slug", slug).single(),
        5000,
        "Slug check"
      );

      if (existingSlug) {
        return json(
          {
            message: "Slug already exists.",
          },
          409
        );
      }

      /* -------------------------
         UPLOAD COVER IMAGE
      -------------------------- */

      let coverImageUrl:
        | string
        | null = null;

      if (
        coverImage instanceof
          File &&
        coverImage.size > 0
      ) {
        const imageError =
          validateMediaFile(
            coverImage
          );

        if (imageError) {
          return json(
            {
              message:
                imageError,
            },
            400
          );
        }

        try {
          coverImageUrl =
            await uploadCoverImage(
              coverImage
            );
        } catch (error) {
          console.error(
            "[BLOG_API] Cover upload failed:",
            error
          );

          return json(
            {
              message:
                "Cover image upload failed.",
            },
            502
          );
        }
      }

      /* -------------------------
         INSERT BLOG POST
      -------------------------- */

      const { data, error } =
        await withTimeout(
          supabase
            .from(
              "blog_posts"
            )
            .insert({
              slug,

              title,

              excerpt:
                excerpt ||
                null,

              content,

              cover_image_url:
                coverImageUrl,

              cover_image_alt:
                coverImageAlt ||
                null,

              tags,

              is_published:
                true,
            })

            .select(
              "id, slug, is_published"
            )

            .single(),

          5000,

          "Blog insert"
        );

      if (error) {
        console.error(
          "[BLOG_API] Insert failed:",
          error
        );

        if (
          error.code ===
          "23505"
        ) {
          return json(
            {
              message:
                "Slug already exists.",
            },
            409
          );
        }

        return json(
          {
            message:
              "Blog insert failed.",
          },
          500
        );
      }

      return json(
        {
          ok: true,

          id: data.id,

          slug: data.slug,

          message:
            "Blog published.",
        },

        201
      );
    } catch (error) {
      console.error(
        "[BLOG_API] Fatal error:",
        error
      );

      return json(
        {
          message:
            "Server error.",
        },
        500
      );
    }
  };
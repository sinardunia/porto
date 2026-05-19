import type { APIRoute } from "astro";

import { json, verifyAdminSecret } from "@/lib/api";

import { createSupabaseAdminClient } from "@/lib/supabase";

import {
  cleanText,
  normalizeImageExtension,
  validateImageFile,
  withTimeout,
} from "@/lib/security";

export const prerender = false;

const THOUGHT_IMAGES_BUCKET = "thought-images";

/* ---------------------------------
   STORAGE HELPERS
---------------------------------- */

const getStoragePath = (file: File) => {
  const now = new Date();

  const year = now.getUTCFullYear();

  const month = String(
    now.getUTCMonth() + 1
  ).padStart(2, "0");

  const id = crypto.randomUUID();

  const extension =
    normalizeImageExtension(file);

  return `thoughts/${year}/${month}/${id}.${extension}`;
};

const uploadImage = async (
  file: File
) => {
  const supabase =
    createSupabaseAdminClient();

  const path = getStoragePath(file);

  const buffer =
    await file.arrayBuffer();

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

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from(THOUGHT_IMAGES_BUCKET)
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
      message: "Thoughts API running",
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
        "[THOUGHTS_API] Incoming POST"
      );

      const auth =
        verifyAdminSecret(request);

      if (!auth.ok) {
        return auth.response;
      }

      const formData =
        await request.formData();

      const content = cleanText(
        formData.get("content"),
        5000
      );

      const imageAlt = cleanText(
        formData.get("imageAlt"),
        300
      );

      const images = formData
        .getAll("image")
        .filter(
          (
            img
          ): img is File =>
            img instanceof File &&
            img.size > 0
        )
        .slice(0, 6);

      if (!content) {
        return json(
          {
            message:
              "Thought content is required.",
          },
          400
        );
      }

      /* -------------------------
         UPLOAD IMAGES
      -------------------------- */

      const uploadedImages: {
        image_url: string;
        image_alt: string | null;
        position: number;
      }[] = [];

      for (const [
        position,
        image,
      ] of images.entries()) {
        const imageError =
          validateImageFile(image);

        if (imageError) {
          return json(
            {
              message: imageError,
            },
            400
          );
        }

        try {
          const imageUrl =
            await uploadImage(image);

          uploadedImages.push({
            image_url: imageUrl,
            image_alt:
              imageAlt || null,
            position,
          });
        } catch (error) {
          console.error(
            "[THOUGHTS_API] Upload failed:",
            error
          );

          return json(
            {
              message:
                "Image upload failed.",
            },
            502
          );
        }
      }

      /* -------------------------
         INSERT THOUGHT
      -------------------------- */

      const supabase =
        createSupabaseAdminClient();

      const { data, error } =
        await withTimeout(
          supabase
            .from("thoughts")
            .insert({
              content,

              image_url:
                uploadedImages[0]
                  ?.image_url || null,

              image_alt:
                uploadedImages[0]
                  ?.image_alt || null,

              is_published: true,
            })
            .select("id")
            .single(),

          10000,

          "Thought insert"
        );

      if (error) {
        console.error(
          "[THOUGHTS_API] Insert failed:",
          error
        );

        return json(
          {
            message:
              "Thought insert failed.",
          },
          500
        );
      }

      /* -------------------------
         INSERT IMAGE METADATA
      -------------------------- */

      if (uploadedImages.length > 0) {
        const {
          error: imageInsertError,
        } = await withTimeout(
          supabase
            .from("thought_images")
            .insert(
              uploadedImages.map(
                (img) => ({
                  ...img,
                  thought_id:
                    data.id,
                })
              )
            ),

          10000,

          "Thought images insert"
        );

        if (imageInsertError) {
          console.error(
            "[THOUGHTS_API] Image metadata insert failed:",
            imageInsertError
          );

          return json(
            {
              message:
                "Thought saved but image metadata failed.",
            },
            500
          );
        }
      }

      return json(
        {
          ok: true,
          id: data.id,
          message:
            "Thought published.",
        },
        201
      );
    } catch (error) {
      console.error(
        "[THOUGHTS_API] Fatal error:",
        error
      );

      return json(
        {
          message: "Server error.",
        },
        500
      );
    }
  };
import type { APIRoute } from "astro";

import { json, verifyAdminSecret } from "@/lib/api";

import { createSupabaseAdminClient } from "@/lib/supabase";

import {
  cleanText,
  normalizeMediaExtension,
  validateMediaFile,
  withTimeout,
} from "@/lib/security";

export const prerender = false;

const THOUGHT_MEDIA_BUCKET =
  "thought-media";

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

  const id =
    crypto.randomUUID();

  const extension =
    normalizeMediaExtension(
      file
    );

  return `thoughts/${year}/${month}/${id}.${extension}`;
};

const getMediaType = (
  file: File
) => {
  if (
    file.type.startsWith(
      "image/"
    )
  ) {
    return "image";
  }

  if (
    file.type.startsWith(
      "video/"
    )
  ) {
    return "video";
  }

  return null;
};

const uploadMedia = async (
  file: File
) => {
  const supabase =
    createSupabaseAdminClient();

  const path =
    getStoragePath(file);

  const buffer =
    await file.arrayBuffer();

  const { error } =
    await withTimeout(
      supabase.storage
        .from(
          THOUGHT_MEDIA_BUCKET
        )
        .upload(path, buffer, {
          contentType:
            file.type,

          upsert: false,
        }),

      15000,

      "Thought media upload"
    );

  if (error) {
    throw new Error(
      error.message
    );
  }

  const { data } =
    supabase.storage
      .from(
        THOUGHT_MEDIA_BUCKET
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
        "Thoughts API running",
    });
  };

/* ---------------------------------
   OPTIONS
---------------------------------- */

export const OPTIONS: APIRoute =
  async () => {
    return new Response(null, {
      status: 204,

      headers: {
        "Access-Control-Allow-Origin":
          "*",

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
        verifyAdminSecret(
          request
        );

      if (!auth.ok) {
        return auth.response;
      }

      let formData;
      try {
        formData = await request.formData();
      } catch {
        return json(
          { message: "Invalid form data." },
          400
        );
      }

      const content =
        cleanText(
          formData.get(
            "content"
          ),
          5000
        );

      const mediaAlt =
        cleanText(
          formData.get(
            "mediaAlt"
          ),
          300
        );

      const mediaFiles =
        formData
          .getAll("media")
          .filter(
            (
              file
            ): file is File =>
              file instanceof
                File &&
              file.size > 0
          )
          .slice(0, 6);

      if (!content) {
        return json(
          { message: "Thought content is required." },
          400
        );
      }

      if (content.length > 5000) {
        return json(
          { message: "Content is too long (max 5,000 characters)." },
          400
        );
      }

      /* -------------------------
         UPLOAD MEDIA
      -------------------------- */

      const uploadedMedia: {
        media_type: string;

        media_url: string;

        media_alt: string | null;

        position: number;
      }[] = [];

      for (const [
        position,
        file,
      ] of mediaFiles.entries()) {
        const mediaType =
          getMediaType(file);

        if (!mediaType) {
          return json(
            {
              message:
                "Unsupported media type.",
            },
            400
          );
        }

        /*
          IMAGE RULES
        */

        if (
          mediaType ===
          "image"
        ) {
          const imageError =
            validateMediaFile(
              file
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
        }

        /*
          VIDEO RULES
        */

        if (
          mediaType ===
          "video"
        ) {
          const maxVideoSize =
            50 *
            1024 *
            1024;

          if (
            file.size >
            maxVideoSize
          ) {
            return json(
              {
                message:
                  "Video max size is 50MB.",
              },
              400
            );
          }

          const allowedVideos =
            [
              "video/mp4",
              "video/webm",
              "video/quicktime",
            ];

          if (
            !allowedVideos.includes(
              file.type
            )
          ) {
            return json(
              {
                message:
                  "Only MP4, WEBM, and MOV videos are allowed.",
              },
              400
            );
          }
        }

        try {
          const mediaUrl =
            await uploadMedia(
              file
            );

          uploadedMedia.push(
            {
              media_type:
                mediaType,

              media_url:
                mediaUrl,

              media_alt:
                mediaAlt ||
                null,

              position,
            }
          );
        } catch (error) {
          console.error(
            "[THOUGHTS_API] Media upload failed:",
            error
          );

          return json(
            {
              message:
                "Media upload failed.",
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

const { data, error } = await withTimeout(
  supabase
    .from("thoughts")
    .insert({ content })
    .select("id")
    .single(),

  10000,
  "Thought insert"
);

if (error || !data) {
  console.error("[THOUGHTS_API] Insert failed:", error);
  return json(
    {
      message: error?.message
        ? `Thought insert failed: ${error.message}`
        : "Thought insert failed.",
    },
    500
  );
}

      /* -------------------------
         INSERT MEDIA METADATA
      -------------------------- */

      if (
        uploadedMedia.length >
        0
      ) {
        const {
          error:
            mediaInsertError,
        } =
          await withTimeout(
            supabase
              .from(
                "thought_media"
              )
              .insert(
                uploadedMedia.map(
                  (
                    media
                  ) => ({
                    ...media,

                    thought_id:
                      data.id,
                  })
                )
              ),

            10000,

            "Thought media insert"
          );

        if (mediaInsertError) {
          console.error(
            "[THOUGHTS_API] Media metadata insert failed:",
            mediaInsertError
          );

          return json(
            { message: "Thought saved but media metadata failed." },
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
          message:
            "Server error.",
        },
        500
      );
    }
  };
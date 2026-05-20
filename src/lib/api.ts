export const json = (
  body: Record<string, unknown>,
  status = 200
) =>
  new Response(
    JSON.stringify(body),
    {
      status,

      headers: {
        "Content-Type":
          "application/json",

        "Cache-Control":
          "no-store",

        "Access-Control-Allow-Origin":
          "*",

        "Access-Control-Allow-Headers":
          "Content-Type, Authorization",

        "Access-Control-Allow-Methods":
          "GET, POST, OPTIONS",
      },
    }
  );

export const getBearerToken = (
  request: Request
) => {
  const authorization =
    request.headers.get(
      "Authorization"
    );

  if (
    !authorization ||
    !authorization.startsWith(
      "Bearer "
    )
  ) {
    return null;
  }

  return authorization
    .slice("Bearer ".length)
    .trim();
};

export const verifyAdminSecret = (
  request: Request
) => {
  /*
    IMPORTANT:
    Astro + Vercel server runtime
    should use import.meta.env
    instead of process.env
  */

  const expectedSecret =
    import.meta.env
      .THOUGHTS_ADMIN_SECRET?.trim();

  const providedSecret =
    getBearerToken(
      request
    )?.trim();

  console.log(
    "[ADMIN AUTH]",
    {
      hasExpectedSecret:
        Boolean(expectedSecret),

      expectedLength:
        expectedSecret?.length,

      providedLength:
        providedSecret?.length,

      match:
        expectedSecret ===
        providedSecret,
    }
  );

  if (!expectedSecret) {
    console.error(
      "[ADMIN AUTH] THOUGHTS_ADMIN_SECRET missing."
    );

    return {
      ok: false as const,

      response: json(
        {
          message:
            "Admin secret is not configured.",
        },
        500
      ),
    };
  }

  if (
    !providedSecret ||
    providedSecret !==
      expectedSecret
  ) {
    console.warn(
      "[ADMIN AUTH] Unauthorized attempt."
    );

    return {
      ok: false as const,

      response: json(
        {
          message:
            "Unauthorized.",
        },
        401
      ),
    };
  }

  return {
    ok: true as const,
  };
};
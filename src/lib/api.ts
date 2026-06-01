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

        // Restrict CORS to same origin for admin endpoints
        "Access-Control-Allow-Origin":
          import.meta.env.SITE_URL || "*",

        "Access-Control-Allow-Headers":
          "Content-Type, Authorization",

        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, OPTIONS",
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

export const getAdminSecretFromCookie = (
  request: Request
): string | null => {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const adminCookie = cookies.find((c) =>
    c.startsWith("admin_secret=")
  );

  if (!adminCookie) return null;

  return decodeURIComponent(
    adminCookie.slice("admin_secret=".length)
  );
};

export const verifyAdminSecret = (
  request: Request
) => {
  const expectedSecret =
    import.meta.env
      .THOUGHTS_ADMIN_SECRET?.trim();

  // Try Authorization header first, fallback to cookie
  const providedSecret =
    (getBearerToken(request) ??
      getAdminSecretFromCookie(request))?.trim();

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
export const json = (
  body: Record<string, unknown>,
  status = 200
) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });

export const getBearerToken = (request: Request) => {
  const authorization =
    request.headers.get("authorization") ||
    request.headers.get("Authorization");

  console.log("AUTH HEADER:", authorization);

  if (!authorization?.startsWith("Bearer ")) {
    console.log("INVALID AUTH FORMAT");
    return null;
  }

  const token = authorization
    .slice("Bearer ".length)
    .trim();

  console.log("TOKEN:", token);

  return token;
};

export const verifyAdminSecret = (
  request: Request
) => {
  const expectedSecret =
    import.meta.env.THOUGHTS_ADMIN_SECRET;

  const providedSecret =
    getBearerToken(request);

  console.log("EXPECTED SECRET:", expectedSecret);
  console.log("PROVIDED SECRET:", providedSecret);

  if (!expectedSecret) {
    console.log("ENV NOT FOUND");

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
    providedSecret.trim() !==
      expectedSecret.trim()
  ) {
    console.log("SECRET MISMATCH");

    return {
      ok: false as const,
      response: json(
        {
          message: "Unauthorized.",
          expectedSecret,
          providedSecret,
          authHeader:
            request.headers.get(
              "authorization"
            ) ||
            request.headers.get(
              "Authorization"
            ),
        },
        401
      ),
    };
  }

  console.log("AUTH SUCCESS");

  return {
    ok: true as const,
  };
};
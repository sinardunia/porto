export const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });

export const getBearerToken = (request: Request) => {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  return authorization.slice("Bearer ".length).trim();
};

export const verifyAdminSecret = (request: Request) => {
  const expectedSecret = import.meta.env.THOUGHTS_ADMIN_SECRET;
  const providedSecret = getBearerToken(request);

  if (!expectedSecret) {
    return { ok: false as const, response: json({ message: "Admin secret is not configured." }, 500) };
  }

  if (!providedSecret || providedSecret !== expectedSecret) {
    console.warn("Failed admin auth attempt.");
    return { ok: false as const, response: json({ message: "Unauthorized." }, 401) };
  }

  return { ok: true as const };
};

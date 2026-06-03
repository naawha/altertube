import type { NextApiRequest, NextApiResponse } from "next"

/** POST /api/v1/auth/logout — выход. */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    res.status(405).end()
    return
  }

  const isHttps =
    req.headers["x-forwarded-proto"] === "https" ||
    process.env.FORCE_SECURE_COOKIES === "1"
  const secure = isHttps ? "; Secure" : ""
  const base = `Path=/; Max-Age=0; SameSite=Lax${secure}`

  res.appendHeader("Set-Cookie", `SID=; ${base}; HttpOnly`)
  res.appendHeader("Set-Cookie", `PREFS=; ${base}`)
  res.appendHeader("Set-Cookie", `token=; ${base}`)
  res.appendHeader("Set-Cookie", `authToken=; ${base}; HttpOnly`)

  res.status(204).end()
}

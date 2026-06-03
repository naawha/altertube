import type { NextApiRequest, NextApiResponse } from "next"

import { getBackend, getBackendInternalUrl } from "@/shared/config/backend"

/** POST /api/v1/auth/login — вход { username, password }. */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    res.status(405).end()
    return
  }

  const parsed = parseLoginBody(req.body)

  if ("error" in parsed) {
    res.status(400).json({ error: parsed.error })
    return
  }

  const isHttps = isHttpsRequest(req)

  console.log("getBackend()")
  console.log(getBackend())
  try {
    if (getBackend() === "piped") {
      await loginPiped(req, res, parsed, isHttps)
      return
    }
    await loginInvidious(req, res, parsed, isHttps)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ошибка входа"
    res.status(500).json({ error: message })
  }
}

async function loginInvidious(
  _req: NextApiRequest,
  res: NextApiResponse,
  credentials: { username: string; password: string },
  isHttps: boolean,
): Promise<void> {
  const base = getBackendInternalUrl()
  const body = new URLSearchParams({
    email: credentials.username,
    password: credentials.password,
  }).toString()

  const upstream = await fetch(new URL("/login", `${base}/`).href, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
    },
    body,
    redirect: "manual",
  })

  const setCookies = extractSetCookies(upstream.headers).map((c) =>
    normalizeSetCookieForProxy(c, isHttps),
  )

  const status = upstream.status
  const contentType = upstream.headers.get("content-type") ?? ""

  if (status >= 300 && status < 400) {
    await upstream.text()
    if (setCookies.length > 0) {
      appendSetCookies(res, setCookies)
      res.status(204).end()
      return
    }
    res.status(401).json({ error: "Неверный логин или пароль" })
    return
  }

  if (status === 401) {
    await upstream.text()
    res.status(401).json({ error: "Неверный логин или пароль" })
    return
  }

  if (status === 403) {
    await upstream.text()
    res.status(403).json({
      error:
        "Вход отключён на инстансе (login_enabled). Проверьте конфигурацию Invidious.",
    })
    return
  }

  if (contentType.includes("text/html")) {
    await upstream.text()
    if (
      extractSetCookies(upstream.headers).some((c) => c.startsWith("SID=")) &&
      status >= 200 &&
      status < 300
    ) {
      appendSetCookies(res, setCookies)
      res.status(204).end()
      return
    }
    res.status(409).json({
      error:
        "Invidious вернул HTML без сессии (часто капча: включите captcha_enabled: false в dev или пройдите вход через веб-интерфейс инстанса).",
    })
    return
  }

  await upstream.text()
  if (setCookies.length > 0) {
    appendSetCookies(res, setCookies)
    res.status(204).end()
    return
  }

  res.status(409).json({ error: "Invidious не установил сессию." })
}

async function loginPiped(
  _req: NextApiRequest,
  res: NextApiResponse,
  credentials: { username: string; password: string },
  isHttps: boolean,
): Promise<void> {
  const base = getBackendInternalUrl()

  const upstream = await fetch(new URL("/login", `${base}/`).href, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.password,
    }),
    redirect: "manual",
  })

  const status = upstream.status
  const contentType = upstream.headers.get("content-type") ?? ""

  if (status === 401 || status === 403) {
    await upstream.text()
    res.status(401).json({ error: "Неверный логин или пароль" })
    return
  }

  if (contentType.includes("application/json")) {
    const data = (await upstream.json()) as { token?: string; authToken?: string }
    console.log("data")
    console.log(data)
    const token = data.token ?? data.authToken
    if (token) {
      const secure = isHttps ? "; Secure" : ""
      res.appendHeader(
        "Set-Cookie",
        `authToken=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax${secure}`,
      )
      res.status(204).end()
      return
    }
  }

  await upstream.text()
  res.status(409).json({
    error: "Piped не вернул authToken. Проверьте URL инстанса и учётные данные.",
  })
}

function parseLoginBody(
  body: unknown,
): { username: string; password: string } | { error: string } {
  let parsed = body
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed) as unknown
    } catch {
      return { error: "Неверный JSON" }
    }
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { error: 'Ожидается JSON: { "username", "password" }' }
  }

  const username = String((parsed as { username?: unknown }).username ?? "")
    .trim()
    .toLowerCase()
    .slice(0, 254)
  const password = String((parsed as { password?: unknown }).password ?? "")

  if (!username || !password) {
    return { error: "Укажите username и пароль" }
  }

  return { username, password }
}

function isHttpsRequest(req: NextApiRequest): boolean {
  const proto = req.headers["x-forwarded-proto"]
  return (
    proto === "https" ||
    (Array.isArray(proto) && proto.includes("https")) ||
    process.env.FORCE_SECURE_COOKIES === "1"
  )
}

function extractSetCookies(headers: Headers): string[] {
  const h = headers as Headers & { getSetCookie?: () => string[] }
  if (typeof h.getSetCookie === "function") {
    return h.getSetCookie()
  }
  const one = headers.get("set-cookie")
  return one ? [one] : []
}

function normalizeSetCookieForProxy(setCookie: string, isHttps: boolean): string {
  let c = setCookie.replace(/\s*;\s*Domain=[^;]*/gi, "")
  if (/\bPath=/i.test(c)) {
    c = c.replace(/\bPath=\s*[^;]*/gi, "Path=/")
  } else {
    c = `${c.trimEnd().replace(/;+\s*$/, "")}; Path=/`
  }
  if (!isHttps) {
    c = c.replace(/\s*;\s*Secure\b/gi, "")
  }
  return c
}

function appendSetCookies(
  res: NextApiResponse,
  cookies: string[],
): void {
  for (const cookie of cookies) {
    res.appendHeader("Set-Cookie", cookie)
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
}

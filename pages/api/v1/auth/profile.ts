import type { NextApiRequest, NextApiResponse } from "next"

import { getBackend, getBackendInternalUrl } from "@/shared/config/backend"

/** GET /api/v1/auth/profile — статус сессии. */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    res.status(405).end()
    return
  }

  const cookieHeader =
    typeof req.headers.cookie === "string" ? req.headers.cookie : undefined

  try {
    const session =
      getBackend() === "piped"
        ? await checkPipedSession(cookieHeader)
        : await checkInvidiousSession(cookieHeader)

    if (session.authenticated) {
      res.status(200).json({ authenticated: true })
      return
    }
    res.status(403).json({ authenticated: false })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ошибка проверки сессии"
    res.status(500).json({ error: message })
  }
}

async function checkInvidiousSession(
  cookieHeader: string | undefined,
): Promise<{ authenticated: boolean }> {
  const sid = readCookie(cookieHeader, "SID")
  if (!sid) {
    return { authenticated: false }
  }

  const base = getBackendInternalUrl()
  const upstream = await fetch(
    new URL("/api/v1/auth/preferences", `${base}/`).href,
    {
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader ?? "",
      },
      redirect: "manual",
    },
  )

  await upstream.text()
  return { authenticated: upstream.status === 200 }
}

async function checkPipedSession(
  cookieHeader: string | undefined,
): Promise<{ authenticated: boolean }> {
  const token = readCookie(cookieHeader, "authToken")
  if (!token) {
    return { authenticated: false }
  }

  const base = getBackendInternalUrl()
  const url = new URL("/feed", `${base}/`)
  url.searchParams.set("authToken", token)

  const upstream = await fetch(url.href, {
    headers: { Accept: "application/json" },
    redirect: "manual",
  })

  await upstream.text()
  return { authenticated: upstream.status === 200 }
}

function readCookie(
  cookieHeader: string | undefined,
  name: string,
): string | undefined {
  if (!cookieHeader) {
    return undefined
  }
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
  if (!match) {
    return undefined
  }
  return decodeURIComponent(match[1])
}

import type { NextApiRequest, NextApiResponse } from "next"

import { getBackend, getBackendInternalUrl } from "@/shared/config/backend"

type InvidiousSubscriptionRow = {
  author: string
  authorId: string
}

type PipedSubscriptionRow = {
  url?: string
  name?: string
  avatar?: string
  verified?: boolean
}

/** GET /api/v1/subscriptions — список подписок. */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    res.status(405).json({ error: "Метод не поддерживается. Используйте GET." })
    return
  }

  const cookieHeader =
    typeof req.headers.cookie === "string" ? req.headers.cookie : undefined

  try {
    if (getBackend() === "piped") {
      await fetchPipedSubscriptions(res, cookieHeader)
      return
    }
    await fetchInvidiousSubscriptions(res, cookieHeader)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Не удалось получить подписки"
    res.status(500).json({ error: message })
  }
}

async function fetchInvidiousSubscriptions(
  res: NextApiResponse,
  cookieHeader: string | undefined,
): Promise<void> {
  const sid = readCookie(cookieHeader, "SID")
  if (!sid) {
    res.status(403).json({ error: "Требуется авторизация" })
    return
  }

  const base = getBackendInternalUrl()
  const upstream = await fetch(
    new URL("/api/v1/auth/subscriptions", `${base}/`).href,
    {
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader ?? "",
      },
      redirect: "manual",
    },
  )

  await proxySubscriptionList(res, upstream)
}

async function fetchPipedSubscriptions(
  res: NextApiResponse,
  cookieHeader: string | undefined,
): Promise<void> {
  const token = readCookie(cookieHeader, "authToken")
  if (!token) {
    res.status(403).json({ error: "Требуется авторизация" })
    return
  }

  const base = getBackendInternalUrl()
  const upstream = await fetch(new URL("/subscriptions", `${base}/`).href, {
    headers: {
      Accept: "application/json",
      Authorization: token,
    },
    redirect: "manual",
  })

  if (upstream.status === 401 || upstream.status === 403) {
    await upstream.text()
    res.status(upstream.status).json({ error: "Требуется авторизация" })
    return
  }

  const contentType = upstream.headers.get("content-type") ?? ""
  const text = await upstream.text()

  if (!upstream.ok) {
    res.status(upstream.status).json({ error: "Не удалось получить подписки" })
    return
  }

  if (!contentType.includes("application/json")) {
    res.status(502).json({ error: "Piped вернул не-JSON ответ" })
    return
  }

  let rows: PipedSubscriptionRow[]
  try {
    const parsed = JSON.parse(text) as unknown
    if (!Array.isArray(parsed)) {
      res.status(502).json({ error: "Piped вернул неожиданный формат подписок" })
      return
    }
    rows = parsed as PipedSubscriptionRow[]
  } catch {
    res.status(502).json({ error: "Некорректный JSON от Piped" })
    return
  }

  const normalized: InvidiousSubscriptionRow[] = rows
    .map(mapPipedSubscription)
    .filter((row): row is InvidiousSubscriptionRow => row !== null)

  res.status(200).json(normalized)
}

async function proxySubscriptionList(
  res: NextApiResponse,
  upstream: Response,
): Promise<void> {
  const contentType = upstream.headers.get("content-type") ?? ""
  const text = await upstream.text()

  if (upstream.status === 401 || upstream.status === 403) {
    res.status(upstream.status).json({ error: "Требуется авторизация" })
    return
  }

  if (!contentType.includes("application/json")) {
    res.status(upstream.ok ? 502 : upstream.status).json({
      error: "Upstream вернул не-JSON ответ",
    })
    return
  }

  let body: unknown
  try {
    body = JSON.parse(text) as unknown
  } catch {
    res.status(502).json({ error: "Некорректный JSON от upstream" })
    return
  }

  res.status(upstream.status).json(body)
}

function mapPipedSubscription(
  item: PipedSubscriptionRow,
): InvidiousSubscriptionRow | null {
  const authorId = parseChannelIdFromUrl(item.url ?? "")
  if (!authorId || !item.name) {
    return null
  }
  return {
    author: item.name,
    authorId,
  }
}

function parseChannelIdFromUrl(url: string): string | null {
  const match = url.match(/\/channel\/([^/?]+)/)
  return match?.[1] ?? null
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

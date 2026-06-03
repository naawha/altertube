import type { NextApiRequest, NextApiResponse } from "next"

import { getBackend, getBackendInternalUrl } from "@/shared/config/backend"

/**
 * POST   /api/v1/subscriptions/:channelId — подписаться
 * DELETE /api/v1/subscriptions/:channelId — отписаться
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const channelId = parseChannelId(req.query.channelId)
  if (!channelId) {
    res.status(400).json({ error: "Некорректный channelId" })
    return
  }

  const cookieHeader =
    typeof req.headers.cookie === "string" ? req.headers.cookie : undefined

  try {
    if (req.method === "POST") {
      if (getBackend() === "piped") {
        await subscribePiped(res, cookieHeader, channelId)
      } else {
        await subscribeInvidious(res, cookieHeader, channelId)
      }
      return
    }

    if (req.method === "DELETE") {
      if (getBackend() === "piped") {
        await unsubscribePiped(res, cookieHeader, channelId)
      } else {
        await unsubscribeInvidious(res, cookieHeader, channelId)
      }
      return
    }

    res.setHeader("Allow", "POST, DELETE")
    res.status(405).json({ error: "Метод не поддерживается. Используйте POST или DELETE." })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ошибка подписки"
    res.status(500).json({ error: message })
  }
}

async function subscribeInvidious(
  res: NextApiResponse,
  cookieHeader: string | undefined,
  channelId: string,
): Promise<void> {
  const sid = readCookie(cookieHeader, "SID")
  if (!sid) {
    res.status(403).json({ error: "Требуется авторизация" })
    return
  }

  const base = getBackendInternalUrl()
  const upstream = await fetch(
    new URL(
      `/api/v1/auth/subscriptions/${encodeURIComponent(channelId)}`,
      `${base}/`,
    ).href,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: cookieHeader ?? "",
      },
      body: "{}",
      redirect: "manual",
    },
  )

  await finishMutation(res, upstream)
}

async function unsubscribeInvidious(
  res: NextApiResponse,
  cookieHeader: string | undefined,
  channelId: string,
): Promise<void> {
  const sid = readCookie(cookieHeader, "SID")
  if (!sid) {
    res.status(403).json({ error: "Требуется авторизация" })
    return
  }

  const base = getBackendInternalUrl()
  const upstream = await fetch(
    new URL(
      `/api/v1/auth/subscriptions/${encodeURIComponent(channelId)}`,
      `${base}/`,
    ).href,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader ?? "",
      },
      redirect: "manual",
    },
  )

  await finishMutation(res, upstream)
}

async function subscribePiped(
  res: NextApiResponse,
  cookieHeader: string | undefined,
  channelId: string,
): Promise<void> {
  const token = readCookie(cookieHeader, "authToken")
  if (!token) {
    res.status(403).json({ error: "Требуется авторизация" })
    return
  }

  const base = getBackendInternalUrl()
  const upstream = await fetch(new URL("/subscribe", `${base}/`).href, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ channelId }),
    redirect: "manual",
  })

  await finishMutation(res, upstream)
}

async function unsubscribePiped(
  res: NextApiResponse,
  cookieHeader: string | undefined,
  channelId: string,
): Promise<void> {
  const token = readCookie(cookieHeader, "authToken")
  if (!token) {
    res.status(403).json({ error: "Требуется авторизация" })
    return
  }

  const base = getBackendInternalUrl()
  const upstream = await fetch(new URL("/unsubscribe", `${base}/`).href, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ channelId }),
    redirect: "manual",
  })

  await finishMutation(res, upstream)
}

async function finishMutation(
  res: NextApiResponse,
  upstream: Response,
): Promise<void> {
  await upstream.text()

  if (upstream.status === 401 || upstream.status === 403) {
    res.status(upstream.status).json({ error: "Требуется авторизация" })
    return
  }

  if (upstream.status >= 200 && upstream.status < 300) {
    res.status(204).end()
    return
  }

  res.status(upstream.status).json({ error: "Не удалось изменить подписку" })
}

function parseChannelId(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== "string") {
    return null
  }
  const id = raw.trim()
  if (!/^UC[a-zA-Z0-9_-]{22}$/.test(id)) {
    return null
  }
  return id
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

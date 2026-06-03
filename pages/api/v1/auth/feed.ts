import type { NextApiRequest, NextApiResponse } from "next"

import { getBackend, getBackendInternalUrl } from "@/shared/config/backend"
import type { InvidiousFeedResponse, InvidiousShortVideo } from "@/shared/lib/invidiousFeed"

/** GET /api/v1/auth/feed — лента подписок. */
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
      await fetchPipedFeed(res, cookieHeader)
      return
    }
    await fetchInvidiousFeed(req, res, cookieHeader)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Не удалось получить ленту"
    res.status(500).json({ error: message })
  }
}

async function fetchInvidiousFeed(
  req: NextApiRequest,
  res: NextApiResponse,
  cookieHeader: string | undefined,
): Promise<void> {
  const sid = readCookie(cookieHeader, "SID")
  if (!sid) {
    res.status(403).json({ error: "Требуется авторизация" })
    return
  }

  const base = getBackendInternalUrl()
  const url = new URL("/api/v1/auth/feed?max_results=200", `${base}/`)

  const upstream = await fetch(url.href, {
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader ?? "",
    },
    redirect: "manual",
  })

  const contentType = upstream.headers.get("content-type") ?? ""
  const text = await upstream.text()

  if (!contentType.includes("application/json")) {
    res.status(upstream.status).json({ error: "Invidious вернул не-JSON ответ" })
    return
  }

  let body: unknown
  try {
    body = JSON.parse(text) as unknown
  } catch {
    res.status(502).json({ error: "Некорректный JSON от Invidious" })
    return
  }

  res.status(upstream.status).json(body)
}

async function fetchPipedFeed(
  res: NextApiResponse,
  cookieHeader: string | undefined,
): Promise<void> {
  const token = readCookie(cookieHeader, "authToken")
  if (!token) {
    res.status(403).json({ error: "Требуется авторизация" })
    return
  }

  const base = getBackendInternalUrl()
  const url = new URL("/feed", `${base}/`)
  url.searchParams.set("authToken", token)

  const upstream = await fetch(url.href, {
    headers: { Accept: "application/json" },
    redirect: "manual",
  })

  const contentType = upstream.headers.get("content-type") ?? ""
  const text = await upstream.text()

  if (upstream.status === 401 || upstream.status === 403) {
    res.status(upstream.status).json({ error: "Требуется авторизация" })
    return
  }

  if (!upstream.ok) {
    res.status(upstream.status).json({ error: "Piped не вернул ленту" })
    return
  }

  if (!contentType.includes("application/json")) {
    res.status(502).json({ error: "Piped вернул не-JSON ответ" })
    return
  }

  let rows: PipedStreamItem[]
  try {
    const parsed = JSON.parse(text) as unknown
    if (!Array.isArray(parsed)) {
      res.status(502).json({ error: "Piped вернул неожиданный формат ленты" })
      return
    }
    rows = parsed as PipedStreamItem[]
  } catch {
    res.status(502).json({ error: "Некорректный JSON от Piped" })
    return
  }

  const response = mapPipedFeedToInvidious(rows)
  res.status(200).json(response)
}

type PipedStreamItem = {
  url?: string
  title?: string
  thumbnail?: string
  uploaderName?: string
  uploaderUrl?: string
  uploaderAvatar?: string
  duration?: number
  views?: number
  uploaded?: number
  uploaderVerified?: boolean
  isShort?: boolean
}

function mapPipedFeedToInvidious(rows: PipedStreamItem[]): InvidiousFeedResponse {
  const notifications: InvidiousShortVideo[] = []
  const videos: InvidiousShortVideo[] = []

  for (const item of rows) {
    const mapped = mapPipedStreamItem(item)
    if (!mapped) {
      continue
    }
    if (item.isShort) {
      notifications.push(mapped)
    } else {
      videos.push(mapped)
    }
  }

  return { notifications, videos }
}

function mapPipedStreamItem(item: PipedStreamItem): InvidiousShortVideo | null {
  const url = item.url ?? ""
  const videoId = parseVideoId(url)
  if (!videoId || !item.title) {
    return null
  }

  const authorId = parseChannelId(item.uploaderUrl ?? "")
  const thumb = item.thumbnail ?? ""
  const thumbnails = thumb
    ? [{ quality: "medium", url: thumb, width: 320, height: 180 }]
    : []

  return {
    type: item.isShort ? "shortVideo" : "video",
    title: item.title,
    videoId,
    videoThumbnails: thumbnails,
    lengthSeconds: Number(item.duration) || 0,
    author: item.uploaderName ?? "",
    authorId,
    authorUrl: item.uploaderUrl ?? "",
    authorThumbnails: item.uploaderAvatar
      ? [{ url: item.uploaderAvatar, width: 48, height: 48 }]
      : [],
    published: normalizeUploaded(item.uploaded),
    viewCount: Number(item.views) || 0,
  }
}

function parseVideoId(url: string): string {
  const match = url.match(/[?&]v=([^&]+)/)
  return match?.[1] ?? ""
}

function parseChannelId(url: string): string {
  const match = url.match(/\/channel\/([^/?]+)/)
  return match?.[1] ?? ""
}

/** Piped часто отдаёт ms, Invidious — секунды. */
function normalizeUploaded(value: number | undefined): number {
  const n = Number(value) || 0
  if (n > 1_000_000_000_000) {
    return Math.floor(n / 1000)
  }
  return n
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

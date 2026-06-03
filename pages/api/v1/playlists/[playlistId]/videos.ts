import type { NextApiRequest, NextApiResponse } from "next"

import { getBackend, getBackendInternalUrl } from "@/shared/config/backend"

/** POST /api/v1/playlists/:playlistId/videos — добавить видео { videoId }. */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    res.status(405).json({ error: "Метод не поддерживается. Используйте POST." })
    return
  }

  const playlistId = parsePlaylistId(req.query.playlistId)
  if (!playlistId) {
    res.status(400).json({ error: "Некорректный playlistId" })
    return
  }

  const videoId = parseVideoId(req.body)
  if (!videoId) {
    res.status(400).json({ error: "Укажите videoId" })
    return
  }

  const cookieHeader =
    typeof req.headers.cookie === "string" ? req.headers.cookie : undefined

  try {
    if (getBackend() === "piped") {
      await addPipedVideo(res, cookieHeader, playlistId, videoId)
    } else {
      await addInvidiousVideo(res, cookieHeader, playlistId, videoId)
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Не удалось добавить видео в плейлист"
    res.status(500).json({ error: message })
  }
}

async function addInvidiousVideo(
  res: NextApiResponse,
  cookieHeader: string | undefined,
  playlistId: string,
  videoId: string,
): Promise<void> {
  if (!readCookie(cookieHeader, "SID")) {
    res.status(403).json({ error: "Требуется авторизация" })
    return
  }

  const base = getBackendInternalUrl()
  const upstream = await fetch(
    new URL(
      `/api/v1/auth/playlists/${encodeURIComponent(playlistId)}/videos`,
      `${base}/`,
    ).href,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: cookieHeader ?? "",
      },
      body: JSON.stringify({ videoId }),
      redirect: "manual",
    },
  )

  await finishMutation(res, upstream)
}

async function addPipedVideo(
  res: NextApiResponse,
  cookieHeader: string | undefined,
  playlistId: string,
  videoId: string,
): Promise<void> {
  const token = readCookie(cookieHeader, "authToken")
  if (!token) {
    res.status(403).json({ error: "Требуется авторизация" })
    return
  }

  const base = getBackendInternalUrl()
  const upstream = await fetch(new URL("/user/playlists/add", `${base}/`).href, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ playlistId, videoIds: [videoId] }),
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

  res.status(upstream.status).json({ error: "Не удалось добавить видео" })
}

function parseVideoId(body: unknown): string | null {
  let parsed = body
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed) as unknown
    } catch {
      return null
    }
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null
  }
  const id = String((parsed as { videoId?: unknown }).videoId ?? "").trim()
  if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) {
    return null
  }
  return id
}

function parsePlaylistId(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== "string") {
    return null
  }
  const id = raw.trim()
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ||
    /^PL[\w-]{10,}$/.test(id)
  ) {
    return id
  }
  return null
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

export const config = {
  api: {
    bodyParser: true,
  },
}

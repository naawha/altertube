import type { NextApiRequest, NextApiResponse } from "next"

import { getBackend, getBackendInternalUrl } from "@/shared/config/backend"

type InvidiousPlaylistListItem = {
  type?: string
  title: string
  playlistId: string
  videoCount: number
  authorThumbnails?: { url: string }[]
}

type PipedUserPlaylistRow = {
  id?: string
  name?: string
  shortDescription?: string | null
  thumbnail?: string
  videos?: number
}

/** GET /api/v1/playlists — список плейлистов пользователя. */
/** POST /api/v1/playlists — создать плейлист { name }. */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const cookieHeader =
    typeof req.headers.cookie === "string" ? req.headers.cookie : undefined

  try {
    if (req.method === "GET") {
      if (getBackend() === "piped") {
        await fetchPipedPlaylists(res, cookieHeader)
      } else {
        await fetchInvidiousPlaylists(res, cookieHeader)
      }
      return
    }

    if (req.method === "POST") {
      const name = parsePlaylistName(req.body)
      if (!name) {
        res.status(400).json({ error: "Укажите name" })
        return
      }

      if (getBackend() === "piped") {
        await createPipedPlaylist(res, cookieHeader, name)
      } else {
        await createInvidiousPlaylist(res, cookieHeader, name)
      }
      return
    }

    res.setHeader("Allow", "GET, POST")
    res.status(405).json({ error: "Метод не поддерживается." })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Ошибка работы с плейлистами"
    res.status(500).json({ error: message })
  }
}

async function fetchInvidiousPlaylists(
  res: NextApiResponse,
  cookieHeader: string | undefined,
): Promise<void> {
  if (!readCookie(cookieHeader, "SID")) {
    res.status(403).json({ error: "Требуется авторизация" })
    return
  }

  const base = getBackendInternalUrl()
  const upstream = await fetch(new URL("/api/v1/auth/playlists", `${base}/`).href, {
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader ?? "",
    },
    redirect: "manual",
  })

  await proxyJson(res, upstream)
}

async function fetchPipedPlaylists(
  res: NextApiResponse,
  cookieHeader: string | undefined,
): Promise<void> {
  const token = readCookie(cookieHeader, "authToken")
  if (!token) {
    res.status(403).json({ error: "Требуется авторизация" })
    return
  }

  const base = getBackendInternalUrl()
  const upstream = await fetch(new URL("/user/playlists", `${base}/`).href, {
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

  const text = await upstream.text()
  if (!upstream.ok) {
    res.status(upstream.status).json({ error: "Не удалось получить плейлисты" })
    return
  }

  let rows: PipedUserPlaylistRow[]
  try {
    const parsed = JSON.parse(text) as unknown
    if (!Array.isArray(parsed)) {
      res.status(502).json({ error: "Piped вернул неожиданный формат плейлистов" })
      return
    }
    rows = parsed as PipedUserPlaylistRow[]
  } catch {
    res.status(502).json({ error: "Некорректный JSON от Piped" })
    return
  }

  const normalized: InvidiousPlaylistListItem[] = rows
    .map(mapPipedPlaylist)
    .filter((row): row is InvidiousPlaylistListItem => row !== null)

  res.status(200).json(normalized)
}

async function createInvidiousPlaylist(
  res: NextApiResponse,
  cookieHeader: string | undefined,
  name: string,
): Promise<void> {
  if (!readCookie(cookieHeader, "SID")) {
    res.status(403).json({ error: "Требуется авторизация" })
    return
  }

  const base = getBackendInternalUrl()
  const upstream = await fetch(new URL("/api/v1/auth/playlists", `${base}/`).href, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Cookie: cookieHeader ?? "",
    },
    body: JSON.stringify({ title: name, privacy: "private" }),
    redirect: "manual",
  })

  await proxyJson(res, upstream)
}

async function createPipedPlaylist(
  res: NextApiResponse,
  cookieHeader: string | undefined,
  name: string,
): Promise<void> {
  const token = readCookie(cookieHeader, "authToken")
  if (!token) {
    res.status(403).json({ error: "Требуется авторизация" })
    return
  }

  const base = getBackendInternalUrl()
  const upstream = await fetch(new URL("/user/playlists/create", `${base}/`).href, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ name }),
    redirect: "manual",
  })

  await proxyJson(res, upstream)
}

function mapPipedPlaylist(row: PipedUserPlaylistRow): InvidiousPlaylistListItem | null {
  if (!row.id || !row.name) {
    return null
  }
  return {
    title: row.name,
    playlistId: row.id,
    videoCount: Number(row.videos) || 0,
    authorThumbnails: row.thumbnail ? [{ url: row.thumbnail }] : [],
  }
}

function parsePlaylistName(body: unknown): string | null {
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
  const name = String(
    (parsed as { name?: unknown }).name ??
      (parsed as { title?: unknown }).title ??
      "",
  ).trim()
  if (!name || name.length > 256) {
    return null
  }
  return name
}

async function proxyJson(res: NextApiResponse, upstream: Response): Promise<void> {
  const contentType = upstream.headers.get("content-type") ?? ""
  const text = await upstream.text()

  if (upstream.status === 401 || upstream.status === 403) {
    res.status(upstream.status).json({ error: "Требуется авторизация" })
    return
  }

  if (!contentType.includes("application/json")) {
    if (upstream.status >= 200 && upstream.status < 300) {
      res.status(upstream.status).end()
      return
    }
    res.status(upstream.status).json({ error: "Upstream вернул не-JSON ответ" })
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

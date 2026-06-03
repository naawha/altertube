import type { NextApiRequest, NextApiResponse } from "next"

import { getBackend, getBackendInternalUrl } from "@/shared/config/backend"

/**
 * PATCH  /api/v1/playlists/:playlistId — переименовать { title }
 * DELETE /api/v1/playlists/:playlistId — удалить
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const playlistId = parsePlaylistId(req.query.playlistId)
  if (!playlistId) {
    res.status(400).json({ error: "Некорректный playlistId" })
    return
  }

  const cookieHeader =
    typeof req.headers.cookie === "string" ? req.headers.cookie : undefined

  try {
    if (req.method === "PATCH") {
      const title = parseTitle(req.body)
      if (!title) {
        res.status(400).json({ error: "Укажите title" })
        return
      }

      if (getBackend() === "piped") {
        await renamePipedPlaylist(res, cookieHeader, playlistId, title)
      } else {
        await renameInvidiousPlaylist(res, cookieHeader, playlistId, title)
      }
      return
    }

    if (req.method === "DELETE") {
      if (getBackend() === "piped") {
        await deletePipedPlaylist(res, cookieHeader, playlistId)
      } else {
        await deleteInvidiousPlaylist(res, cookieHeader, playlistId)
      }
      return
    }

    res.setHeader("Allow", "PATCH, DELETE")
    res.status(405).json({ error: "Метод не поддерживается." })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Ошибка работы с плейлистом"
    res.status(500).json({ error: message })
  }
}

async function renameInvidiousPlaylist(
  res: NextApiResponse,
  cookieHeader: string | undefined,
  playlistId: string,
  title: string,
): Promise<void> {
  if (!readCookie(cookieHeader, "SID")) {
    res.status(403).json({ error: "Требуется авторизация" })
    return
  }

  const base = getBackendInternalUrl()
  const upstream = await fetch(
    new URL(
      `/api/v1/auth/playlists/${encodeURIComponent(playlistId)}`,
      `${base}/`,
    ).href,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: cookieHeader ?? "",
      },
      body: JSON.stringify({ title }),
      redirect: "manual",
    },
  )

  await finishMutation(res, upstream)
}

async function deleteInvidiousPlaylist(
  res: NextApiResponse,
  cookieHeader: string | undefined,
  playlistId: string,
): Promise<void> {
  if (!readCookie(cookieHeader, "SID")) {
    res.status(403).json({ error: "Требуется авторизация" })
    return
  }

  const base = getBackendInternalUrl()
  const upstream = await fetch(
    new URL(
      `/api/v1/auth/playlists/${encodeURIComponent(playlistId)}`,
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

async function renamePipedPlaylist(
  res: NextApiResponse,
  cookieHeader: string | undefined,
  playlistId: string,
  title: string,
): Promise<void> {
  const token = readCookie(cookieHeader, "authToken")
  if (!token) {
    res.status(403).json({ error: "Требуется авторизация" })
    return
  }

  const base = getBackendInternalUrl()
  const upstream = await fetch(new URL("/user/playlists/rename", `${base}/`).href, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ playlistId, newName: title }),
    redirect: "manual",
  })

  await finishMutation(res, upstream)
}

async function deletePipedPlaylist(
  res: NextApiResponse,
  cookieHeader: string | undefined,
  playlistId: string,
): Promise<void> {
  const token = readCookie(cookieHeader, "authToken")
  if (!token) {
    res.status(403).json({ error: "Требуется авторизация" })
    return
  }

  const base = getBackendInternalUrl()
  const upstream = await fetch(new URL("/user/playlists/delete", `${base}/`).href, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ playlistId }),
    redirect: "manual",
  })

  await finishMutation(res, upstream)
}

async function finishMutation(
  res: NextApiResponse,
  upstream: Response,
): Promise<void> {
  const contentType = upstream.headers.get("content-type") ?? ""
  const text = await upstream.text()

  if (upstream.status === 401 || upstream.status === 403) {
    res.status(upstream.status).json({ error: "Требуется авторизация" })
    return
  }

  if (upstream.status >= 200 && upstream.status < 300) {
    if (contentType.includes("application/json") && text) {
      try {
        res.status(upstream.status).json(JSON.parse(text) as unknown)
        return
      } catch {
        /* fall through to 204 */
      }
    }
    res.status(204).end()
    return
  }

  if (contentType.includes("application/json") && text) {
    try {
      res.status(upstream.status).json(JSON.parse(text) as unknown)
      return
    } catch {
      /* fall through */
    }
  }

  res.status(upstream.status).json({ error: "Не удалось выполнить операцию" })
}

function parseTitle(body: unknown): string | null {
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
  const title = String((parsed as { title?: unknown }).title ?? "").trim()
  if (!title || title.length > 256) {
    return null
  }
  return title
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

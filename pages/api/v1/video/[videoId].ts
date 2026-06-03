import type { NextApiRequest, NextApiResponse } from "next"

import { getBackend, getBackendInternalUrl } from "@/shared/config/backend"

/** GET /api/v1/video/:videoId — данные ролика и потоки. */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    res.status(405).json({ error: "Метод не поддерживается. Используйте GET." })
    return
  }

  const videoId = parseVideoId(req.query.videoId)
  if (!videoId) {
    res.status(400).json({ error: "Некорректный videoId" })
    return
  }

  try {
    const base = getBackendInternalUrl()
    const upstreamUrl =
      getBackend() === "piped"
        ? new URL(`/streams/${encodeURIComponent(videoId)}`, `${base}/`).href
        : new URL(
            `/api/v1/streams/${encodeURIComponent(videoId)}`,
            `${base}/`,
          ).href

    const upstream = await fetch(upstreamUrl, {
      headers: { Accept: "application/json" },
      redirect: "manual",
    })

    const contentType = upstream.headers.get("content-type") ?? ""
    const text = await upstream.text()

    if (upstream.status === 404) {
      res.status(404).json({ error: "Видео не найдено" })
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
  } catch (err) {
    const message = err instanceof Error ? err.message : "Не удалось получить видео"
    res.status(500).json({ error: message })
  }
}

function parseVideoId(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== "string") {
    return null
  }
  const id = raw.trim()
  if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) {
    return null
  }
  return id
}

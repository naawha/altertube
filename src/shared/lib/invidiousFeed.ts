import type { VideoShortType } from "@/shared/types"

export type InvidiousThumbnail = { quality?: string; url: string; width?: number; height?: number }

export type InvidiousShortVideo = {
  type?: string
  title: string
  videoId: string
  videoThumbnails?: InvidiousThumbnail[]
  lengthSeconds?: number
  author: string
  authorId: string
  authorUrl: string
  authorThumbnails?: { url: string; width?: number; height?: number }[]
  published?: number
  viewCount?: number
}

export type InvidiousFeedResponse = {
  notifications?: InvidiousShortVideo[]
  videos?: InvidiousShortVideo[]
}

function pickThumbnail(thumbnails: InvidiousThumbnail[] | undefined): string {
  if (!thumbnails?.length) return ""
  const medium = thumbnails.find((t) => t.quality === "medium")
  return medium?.url ?? thumbnails[0]?.url ?? ""
}

/**
 * Invidious отдаёт ленту в двух массивах: `notifications` и `videos` (get_subscription_feed).
 * Нужно объединять оба — иначе теряется половина записей (часто длинные ролики в одном, шортсы в другом).
 */
export function mergeInvidiousFeedItems(
  response: InvidiousFeedResponse,
): InvidiousShortVideo[] {
  if (!response) return []

  const merged = [...(response.notifications ?? []), ...(response.videos ?? [])]
  const seen = new Set<string>()
  const out: InvidiousShortVideo[] = []
  for (const v of merged) {
    if (!v.videoId || !v.title || seen.has(v.videoId)) continue
    seen.add(v.videoId)
    out.push(v)
  }
  return out
}

/** Элемент ленты подписок Invidious → карточка сетки (как в поиске). */
export function mapInvidiousFeedVideoToGridItem(v: InvidiousShortVideo): VideoShortType {
  const publishedSec = v.published != null ? Number(v.published) : 0
  const thumbUrl = pickThumbnail(v.videoThumbnails)
  const videoThumbnails: VideoShortType["videoThumbnails"] =
    v.videoThumbnails?.length && v.videoThumbnails.length > 0
      ? (v.videoThumbnails.map((t) => ({
          quality: String(t.quality ?? "medium"),
          url: t.url,
          width: Number(t.width ?? 0),
          height: Number(t.height ?? 0),
        })) as VideoShortType["videoThumbnails"])
      : ([
          {
            quality: "medium",
            url: thumbUrl || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
            width: 320,
            height: 180,
          },
        ] as VideoShortType["videoThumbnails"])

  return {
    type: v.type === "shortVideo" ? "shortVideo" : "video",
    title: v.title,
    videoId: v.videoId,
    author: v.author,
    authorId: v.authorId,
    authorUrl: v.authorUrl,
    videoThumbnails,
    description: "",
    descriptionHtml: "",
    viewCount: Number(v.viewCount) || 0,
    published: publishedSec,
    publishedText: "",
    lengthSeconds: Number(v.lengthSeconds) || 0,
    liveNow: false,
    paid: false,
    premium: false,
  }
}

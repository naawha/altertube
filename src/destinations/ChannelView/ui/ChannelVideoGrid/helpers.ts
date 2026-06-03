import { parseVideoIdFromPipedWatchUrl } from "@/features/video/lib/parseVideoId"
import { PipedRelatedStream } from "@/models/video/api/videoSlice"
import { VideoShortType } from "@/shared/types"

export function pipedRelatedToGridItem(item: PipedRelatedStream): VideoShortType {
  const videoId = parseVideoIdFromPipedWatchUrl(item.url) ?? ""
  const thumb = item.thumbnail || ""
  return {
    type: item.isShort ? "shortVideo" : "video",
    title: item.title,
    videoId,
    author: item.uploaderName,
    authorId: "",
    authorUrl: item.uploaderUrl ?? "",
    videoThumbnails: [
      {
        quality: "medium",
        url: thumb,
        width: 320,
        height: 180,
      },
    ],
    description: "",
    descriptionHtml: "",
    viewCount: item.views ?? 0,
    published: item.uploaded ?? 0,
    publishedText: "",
    lengthSeconds: item.duration ?? 0,
    liveNow: false,
    paid: false,
    premium: false,
  }
}

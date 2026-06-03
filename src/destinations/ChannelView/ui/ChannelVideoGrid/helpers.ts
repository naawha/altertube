import { PipedRelatedStream } from "@/models/video/api/videoSlice"
import { VideoGridItemType } from "@/shared/types"

export function pipedRelatedToGridItem(item: PipedRelatedStream): VideoGridItemType {
  return {
    type: "stream",
    url: item.url,
    title: item.title,
    thumbnail: item.thumbnail,
    duration: item.duration ?? 0,
    isShort: item.isShort ?? false,
    shortDescription: null,
    uploaded: item.uploaded ?? 0,
    uploaderAvatar: item.uploaderAvatar ?? "",
    uploaderName: item.uploaderName,
    uploaderUrl: item.uploaderUrl ?? "",
    uploaderVerified: item.uploaderVerified ?? false,
    views: item.views ?? 0,
  }
}

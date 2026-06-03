import type { VideoGridItemType } from "@/shared/types"

/** Piped `/search` item (subset; API may add fields). */
export type PipedSearchItemType = {
  type: "stream" | "channel" | "playlist"
  url: string
  title: string
  thumbnail: string
  uploaderName: string
  duration: number
}

export type PipedSearchResponseType = {
  corrected: boolean
  items: VideoGridItemType[]
  nextpage: string | null
  suggestion: string | null
}

export type PipedSearchRequestType = { q: string; filter?: string }

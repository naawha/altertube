import type {
  PipedStreamResponse,
  PipedStreamSource,
} from "@/models/video/api/videoSlice"

import { tryBuildPipedDashManifest } from "./pipedDashGenerator"
import {
  pickDefaultQualityUrl,
  shortSidePx,
  filterVideoSourcesFor1080pCap,
} from "./streamPlaybackPolicy"

export type PlaybackQualityOption = {
  label: string
  url: string
  mimeType: string
  /** min(width,height) — для старта на ~720p */
  shortSide?: number
}

export type PickPlaybackResult =
  | {
      kind: "shaka"
      url: string
      mimeType: string
      qualities?: PlaybackQualityOption[]
    }
  | {
      kind: "native"
      url: string
      mimeType: string
      qualities?: PlaybackQualityOption[]
    }
  | {
      kind: "split"
      videoUrl: string
      audioUrl: string
      qualities?: PlaybackQualityOption[]
    }

export type PickPlaybackOptions = {
  /** iOS/iPadOS WebKit: HLS и MP4 через <video>, без Shaka/DASH. */
  preferNative?: boolean
}

function isMp4Compatible(s: PipedStreamSource): boolean {
  const mt = (s.mimeType ?? "").toLowerCase()
  if (mt.includes("webm") || s.format === "WEBM") return false
  return (
    mt.includes("mp4") ||
    mt.includes("mpeg") ||
    s.format === "MPEG_4" ||
    mt.includes("audio/mp4")
  )
}

/** По одному варианту на высоту; при равной высоте предпочитаем MPEG_4; не выше 1080p по площади кадра. */
function collectVideoQualities(
  videos: PipedStreamSource[],
  mp4Only = false,
): PlaybackQualityOption[] {
  let vo = filterVideoSourcesFor1080pCap(videos.filter((s) => s.videoOnly && s.url))
  if (mp4Only) {
    vo = vo.filter(isMp4Compatible)
  }
  const preferMp4 = (s: PipedStreamSource) =>
    Boolean(s.mimeType?.includes("mp4") || s.format === "MPEG_4")

  const byHeight = new Map<number, PipedStreamSource>()
  for (const s of [...vo].sort((a, b) => (b.height ?? 0) - (a.height ?? 0))) {
    const h = s.height ?? 0
    const existing = byHeight.get(h)
    if (!existing) {
      byHeight.set(h, s)
    } else if (preferMp4(s) && !preferMp4(existing)) {
      byHeight.set(h, s)
    }
  }

  return [...byHeight.values()]
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0))
    .map((s) => ({
      label: s.quality ?? `${s.height ?? "?"}p`,
      url: s.url,
      mimeType: s.mimeType ?? "video/mp4",
      shortSide: shortSidePx(s),
    }))
}

function pickProgressivePlayback(
  data: PipedStreamResponse,
  preferNative: boolean,
): PickPlaybackResult | null {
  const mp4Only = preferNative
  const videos = data.videoStreams ?? []
  const audios = data.audioStreams ?? []
  const qualities = collectVideoQualities(videos, mp4Only)
  const audioPool = mp4Only ? audios.filter(isMp4Compatible) : audios
  const hasAudio = audioPool.some((a) => a.url)

  const pickBestAudio = () =>
    [...audioPool]
      .filter((s) => s.url)
      .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0]

  const singleKind = preferNative ? ("native" as const) : ("shaka" as const)

  if (qualities.length >= 2 && hasAudio) {
    const audio = pickBestAudio()
    if (audio?.url) {
      const videoUrl = pickDefaultQualityUrl(qualities) ?? qualities[0].url
      return {
        kind: "split",
        videoUrl,
        audioUrl: audio.url,
        qualities,
      }
    }
  }

  if (qualities.length >= 2 && !hasAudio) {
    const url = pickDefaultQualityUrl(qualities) ?? qualities[0].url
    const meta = qualities.find((q) => q.url === url) ?? qualities[0]
    return {
      kind: singleKind,
      url,
      mimeType: meta.mimeType,
      qualities,
    }
  }

  const muxedPool = mp4Only
    ? videos.filter((s) => s.url && !s.videoOnly && isMp4Compatible(s))
    : videos.filter((s) => s.url && !s.videoOnly)
  const muxed = muxedPool[0]
  if (muxed?.url) {
    return {
      kind: singleKind,
      url: muxed.url,
      mimeType: muxed.mimeType ?? "video/mp4",
    }
  }

  let videoOnlyPool = videos.filter((s) => s.videoOnly && s.url)
  if (mp4Only) {
    videoOnlyPool = videoOnlyPool.filter(isMp4Compatible)
  }
  const videoOnly = [...videoOnlyPool].sort(
    (a, b) => (b.height ?? 0) - (a.height ?? 0),
  )[0]
  const audio = pickBestAudio()

  if (videoOnly?.url && audio?.url) {
    const q = qualities.length >= 2 ? qualities : undefined
    const videoUrl =
      q && q.length >= 2 ? (pickDefaultQualityUrl(q) ?? videoOnly.url) : videoOnly.url
    return {
      kind: "split",
      videoUrl,
      audioUrl: audio.url,
      qualities: q,
    }
  }
  if (videoOnly?.url) {
    return {
      kind: singleKind,
      url: videoOnly.url,
      mimeType: videoOnly.mimeType ?? "video/mp4",
    }
  }
  return null
}

/** Серверный DASH/HLS → Shaka; на iOS — HLS/MP4 через нативный <video>. */
export function pickPlayback(
  data: PipedStreamResponse,
  options?: PickPlaybackOptions,
): PickPlaybackResult | null {
  const preferNative = options?.preferNative ?? false

  if (preferNative) {
    if (data.hls) {
      return {
        kind: "native",
        url: data.hls,
        mimeType: "application/x-mpegURL",
      }
    }
    return pickProgressivePlayback(data, true)
  }

  if (data.dash) {
    return {
      kind: "shaka",
      url: data.dash,
      mimeType: "application/dash+xml",
    }
  }
  if (data.hls) {
    return {
      kind: "shaka",
      url: data.hls,
      mimeType: "application/x-mpegURL",
    }
  }

  const clientDash = tryBuildPipedDashManifest(data)
  if (clientDash) {
    return {
      kind: "shaka",
      url: clientDash,
      mimeType: "application/dash+xml",
    }
  }

  return pickProgressivePlayback(data, false)
}

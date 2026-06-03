/**
 * Клиентский DASH MPD по той же схеме, что TeamPiped/Piped `src/utils/DashUtils.js`
 * (на базе yt-dash-manifest-generator). Нужен Shaka с несколькими Representation и аудио.
 */
import { XMLBuilder } from "fast-xml-parser"

import type {
  PipedStreamResponse,
  PipedStreamSource,
} from "@/models/video/api/videoSlice"

import { filterVideoSourcesFor1080pCap } from "./streamPlaybackPolicy"

function hasDashRanges(s: PipedStreamSource): boolean {
  return (
    s.initStart != null &&
    s.initEnd != null &&
    s.indexStart != null &&
    s.indexEnd != null &&
    s.itag != null &&
    Boolean(s.codec)
  )
}

/** Порт `generate_xmljs_json_from_data` + `generate_dash_file_from_formats` из Piped. */
function generateDashFileFromFormats(
  videoFormatArray: PipedStreamSource[],
  videoLength: number,
): string {
  const generatedJSON = generateXmljsJsonFromData(videoFormatArray, videoLength)
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: "_",
    suppressBooleanAttributes: false,
  })
  return builder.build(generatedJSON) as string
}

function generateXmljsJsonFromData(
  videoFormatArray: PipedStreamSource[],
  videoLength: number,
) {
  return {
    "?xml": {
      _version: "1.0",
      _encoding: "utf-8",
      MPD: {
        _xmlns: "urn:mpeg:dash:schema:mpd:2011",
        _profiles: "urn:mpeg:dash:profile:full:2011",
        _minBufferTime: "PT1.5S",
        _type: "static",
        _mediaPresentationDuration: `PT${videoLength}S`,
        Period: {
          AdaptationSet: generateAdaptationSet(videoFormatArray),
        },
      },
    },
  }
}

function generateAdaptationSet(videoFormatArray: PipedStreamSource[]) {
  const mimeAudioObjs: {
    audioTrackId: string | null | undefined
    mimeType: string
    videoFormats: PipedStreamSource[]
  }[] = []

  videoFormatArray.forEach((videoFormat) => {
    const mt = videoFormat.mimeType ?? ""
    if (
      (mt.includes("video") && !videoFormat.videoOnly) ||
      mt.includes("application")
    ) {
      return
    }

    const audioTrackId = videoFormat.audioTrackId
    const mimeType = videoFormat.mimeType ?? ""

    for (let i = 0; i < mimeAudioObjs.length; i++) {
      const mimeAudioObj = mimeAudioObjs[i]
      if (
        mimeAudioObj.audioTrackId === audioTrackId &&
        mimeAudioObj.mimeType === mimeType
      ) {
        mimeAudioObj.videoFormats.push(videoFormat)
        return
      }
    }

    mimeAudioObjs.push({
      audioTrackId,
      mimeType,
      videoFormats: [videoFormat],
    })
  })

  const adaptationSets: Record<string, unknown>[] = []

  mimeAudioObjs.forEach((mimeAudioObj) => {
    const adapSet: Record<string, unknown> = {
      _id: mimeAudioObj.audioTrackId,
      _lang: mimeAudioObj.audioTrackId?.substring(0, 2),
      _mimeType: mimeAudioObj.mimeType,
      _startWithSAP: "1",
      _subsegmentAlignment: "true",
      Representation: [] as unknown[],
    }

    let isVideoFormat = false

    if (mimeAudioObj.mimeType.includes("video")) {
      isVideoFormat = true
      adapSet._scanType = "progressive"
    }

    for (let i = 0; i < mimeAudioObj.videoFormats.length; i++) {
      const videoFormat = mimeAudioObj.videoFormats[i]
      if (isVideoFormat) {
        ;(adapSet.Representation as unknown[]).push(
          generateRepresentationVideo(videoFormat),
        )
      } else {
        ;(adapSet.Representation as unknown[]).push(
          generateRepresentationAudio(videoFormat),
        )
      }
    }

    adaptationSets.push(adapSet)
  })

  return adaptationSets
}

function generateRepresentationAudio(format: PipedStreamSource) {
  return {
    _id: format.itag,
    _codecs: format.codec,
    _bandwidth: format.bitrate ?? 0,
    AudioChannelConfiguration: {
      _schemeIdUri: "urn:mpeg:dash:23003:3:audio_channel_configuration:2011",
      _value: "2",
    },
    BaseURL: format.url,
    SegmentBase: {
      _indexRange: `${format.indexStart}-${format.indexEnd}`,
      Initialization: {
        _range: `${format.initStart}-${format.initEnd}`,
      },
    },
  }
}

function generateRepresentationVideo(format: PipedStreamSource) {
  const rep: Record<string, unknown> = {
    _id: format.itag,
    _codecs: format.codec,
    _bandwidth: format.bitrate ?? 0,
    _width: format.width,
    _height: format.height,
    _maxPlayoutRate: "1",
    BaseURL: format.url,
    SegmentBase: {
      _indexRange: `${format.indexStart}-${format.indexEnd}`,
      Initialization: {
        _range: `${format.initStart}-${format.initEnd}`,
      },
    },
  }
  if (format.fps != null && format.fps > 0) {
    rep._frameRate = format.fps
  }
  return rep
}

/**
 * Собирает data:-URI MPD для Shaka, если есть video-only с init/index и длительность.
 * Одно семейство видео (предпочтительно mp4), лучший аудио при наличии.
 */
export function tryBuildPipedDashManifest(data: PipedStreamResponse): string | null {
  const duration = data.duration
  if (duration == null || duration <= 0) return null

  const videos = (data.videoStreams ?? []).filter(
    (s) => s.videoOnly && s.url && hasDashRanges(s),
  )
  if (videos.length === 0) return null

  const preferMp4 = videos.some((s) => s.mimeType?.includes("mp4"))
  const ofMime = videos.filter((s) =>
    preferMp4 ? s.mimeType?.includes("mp4") : s.mimeType?.includes("webm"),
  )
  if (ofMime.length === 0) return null

  const cappedMime = filterVideoSourcesFor1080pCap(ofMime)

  const byHeight = new Map<number, PipedStreamSource>()
  for (const s of [...cappedMime].sort((a, b) => (b.height ?? 0) - (a.height ?? 0))) {
    const h = s.height ?? 0
    const existing = byHeight.get(h)
    if (!existing) {
      byHeight.set(h, s)
    } else if ((s.bitrate ?? 0) > (existing.bitrate ?? 0)) {
      byHeight.set(h, s)
    }
  }
  const videoReps = [...byHeight.values()].sort(
    (a, b) => (b.height ?? 0) - (a.height ?? 0),
  )

  const audios = (data.audioStreams ?? []).filter(
    (s) => s.url && hasDashRanges(s) && !(s.mimeType ?? "").includes("video"),
  )
  const bestAudio = [...audios].sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0]

  const formats: PipedStreamSource[] = bestAudio
    ? [...videoReps, bestAudio]
    : [...videoReps]
  if (formats.length === 0) return null

  try {
    const xml = generateDashFileFromFormats(formats, Math.floor(duration))
    return `data:application/dash+xml;charset=utf-8,${encodeURIComponent(xml)}`
  } catch {
    return null
  }
}

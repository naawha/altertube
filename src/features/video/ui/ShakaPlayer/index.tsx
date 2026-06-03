import { useEffect, useRef, useState, type FC } from "react"
import type { PlaybackQualityOption } from "@/models/video/lib/pickPlayback"
import {
  MAX_PIXELS_1080P_TIER,
  PREFERRED_SHORT_SIDE_PX,
  shortSidePx,
} from "@/models/video/lib/streamPlaybackPolicy"
interface ShakaPlayerProps {
  src: string
  mimeType: string
  qualities?: PlaybackQualityOption[]
}

/** Бандл `shaka-player.ui.js`: Player + UI Overlay. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ShakaGlobal = any

function pickVariantClosestToShortSide(
  variants: Array<{ width?: number; height?: number }>,
  targetPx: number,
) {
  const withDims = variants.filter((v) => (v.width ?? 0) > 0 && (v.height ?? 0) > 0)
  if (withDims.length === 0) return null
  let best = withDims[0]
  let bestDiff = Infinity
  for (const v of withDims) {
    const d = Math.abs(shortSidePx(v) - targetPx)
    if (d < bestDiff) {
      bestDiff = d
      best = v
    }
  }
  return best
}

const ShakaPlayer: FC<ShakaPlayerProps> = ({ src, mimeType, qualities }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<ShakaGlobal | null>(null)
  const mountedRef = useRef(true)
  const [playerReady, setPlayerReady] = useState(false)
  const [activeUrl, setActiveUrl] = useState(src)

  useEffect(() => {
    setActiveUrl(src)
  }, [src])

  useEffect(() => {
    mountedRef.current = true
    setPlayerReady(false)
    const container = containerRef.current
    const video = videoRef.current
    if (!container || !video || !src) return

    const instances: {
      ui: { destroy: (forceDisconnect?: boolean) => Promise<unknown> } | null
      player: { destroy: () => Promise<unknown> } | null
    } = { ui: null, player: null }

    void (async () => {
      const mod = await import("shaka-player/dist/shaka-player.ui.js")
      const shaka: ShakaGlobal = (mod as { default?: ShakaGlobal }).default ?? mod
      if (!mountedRef.current) return

      if (!shaka.Player.isBrowserSupported()) return

      shaka.polyfill.installAll()

      const player = new shaka.Player()
      await player.attach(video)
      if (!mountedRef.current) {
        await player.destroy()
        return
      }

      instances.player = player
      playerRef.current = player
      const ui = new shaka.ui.Overlay(player, container, video)
      instances.ui = ui

      ui.configure({
        controlPanelElements: [
          "play_pause",
          "mute",
          "volume",
          "time_and_duration",
          "spacer",
          "quality",
          "overflow_menu",
          "fullscreen",
        ],
        overflowMenuButtons: [
          "language",
          "captions",
          "picture_in_picture",
          "playback_rate",
          "cast",
        ],
        /* Подписи вида «720p» даёт getResolutionLabel_; метки HD/4K не нужны рядом */
        qualityMarks: {
          720: "HD",
          1080: "HD",
          1440: "",
          2160: "",
          4320: "",
        },
      })

      if (!mountedRef.current) {
        await ui.destroy()
        await player.destroy()
        instances.ui = null
        instances.player = null
        playerRef.current = null
        return
      }

      const manualQualityList = qualities && qualities.length > 1

      try {
        if (!manualQualityList) {
          player.configure({
            restrictions: { maxPixels: MAX_PIXELS_1080P_TIER },
            abr: {
              enabled: true,
              restrictions: { maxPixels: MAX_PIXELS_1080P_TIER },
            },
          })
        } else {
          player.configure({ abr: { enabled: true } })
        }
        await player.load(src, 0, mimeType)
        if (!manualQualityList && mountedRef.current) {
          const variants = player.getVariantTracks()
          if (variants?.length) {
            const best = pickVariantClosestToShortSide(variants, PREFERRED_SHORT_SIDE_PX)
            if (best) {
              player.selectVariantTrack(best, false)
            }
          }
        }
      } catch {
        /* ошибка загрузки */
      }
      if (mountedRef.current) {
        setPlayerReady(true)
      }
    })()

    return () => {
      mountedRef.current = false
      setPlayerReady(false)
      playerRef.current = null
      void (async () => {
        if (instances.ui) {
          await instances.ui.destroy()
          instances.ui = null
        }
        if (instances.player) {
          await instances.player.destroy()
          instances.player = null
        }
      })()
    }
  }, [src, mimeType, qualities])

  useEffect(() => {
    const player = playerRef.current
    if (!playerReady || !player) return
    if (!qualities || qualities.length <= 1) return
    if (activeUrl === src) return
    const mt = qualities.find((q) => q.url === activeUrl)?.mimeType ?? mimeType
    void (async () => {
      try {
        await player.load(activeUrl, 0, mt)
      } catch {
        /* ошибка переключения */
      }
    })()
  }, [activeUrl, src, mimeType, qualities, playerReady])

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        ref={containerRef}
        className="shaka-video-container"
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#000",
        }}
      >
        <video
          ref={videoRef}
          playsInline
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  )
}

export default ShakaPlayer
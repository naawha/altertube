import type { PipedStreamSource } from "@/models/video/api/videoSlice"

/** Верхняя граница «1080p» по числу пикселей кадра (учитывает и портрет). */
export const MAX_PIXELS_1080P_TIER = 1920 * 1080

/** Предпочитаемая короткая сторона кадра при старте (типичный «720p»). */
export const PREFERRED_SHORT_SIDE_PX = 720

export function shortSidePx(s: { width?: number; height?: number }): number {
  const w = s.width ?? 0
  const h = s.height ?? 0
  if (w <= 0 && h <= 0) return 0
  return Math.min(w, h)
}

export function pixelCount(s: { width?: number; height?: number }): number {
  const w = s.width ?? 0
  const h = s.height ?? 0
  return Math.max(0, w) * Math.max(0, h)
}

/** Не выше условного 1080p (1920×1080 по площади кадра). */
export function isAtMost1080pTier(s: { width?: number; height?: number }): boolean {
  const p = pixelCount(s)
  if (p <= 0) return true
  return p <= MAX_PIXELS_1080P_TIER
}

/**
 * Сначала только потоки не выше 1080p; если таких нет — оставляем самые «лёгкие»,
 * чтобы не остаться без воспроизведения.
 */
export function filterVideoSourcesFor1080pCap(sources: PipedStreamSource[]): PipedStreamSource[] {
  const capped = sources.filter((s) => isAtMost1080pTier(s))
  if (capped.length > 0) return capped
  return [...sources].sort((a, b) => pixelCount(a) - pixelCount(b))
}

export type QualityPick = {
  url: string
  shortSide?: number
}

/** Стартовое качество: ближе всего к 720p по короткой стороне. */
export function pickDefaultQualityUrl(qualities: QualityPick[]): string | null {
  if (qualities.length === 0) return null
  const withSide = qualities.filter((q) => q.shortSide != null && (q.shortSide ?? 0) > 0)
  if (withSide.length === 0) return qualities[0].url
  let best = withSide[0]
  let bestDiff = Infinity
  for (const q of withSide) {
    const d = Math.abs((q.shortSide ?? 0) - PREFERRED_SHORT_SIDE_PX)
    if (d < bestDiff) {
      bestDiff = d
      best = q
    }
  }
  return best.url
}

import { useSyncExternalStore } from "react"

/** iOS/iPadOS: любой браузер (Safari, Firefox, Chrome) использует WebKit без DASH/MSE. */
export function prefersNativePlayback(): boolean {
  if (typeof navigator === "undefined") return false
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return true
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1
}

export function usePrefersNativePlayback(): boolean {
  return useSyncExternalStore(
    () => () => {},
    prefersNativePlayback,
    () => false,
  )
}

import UrlHelper from "@/shared/helpers/UrlHelper"

export const watchHref = (url: string): string => {
  return UrlHelper.watch(url)
}

export const shareVideoUrl = async (url: string, title: string): Promise<void> => {
  const href = watchHref(url)
  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title, url: href })
    } else if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(href)
    }
  } catch {
    /* отмена или ошибка */
  }
}

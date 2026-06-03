const MS_MIN = 60_000
const MS_HOUR = 3_600_000
const MS_DAY = 86_400_000

export const pluralRu = (
  n: number,
  forms: { one: string; few: string; many: string },
): string => {
  const mod100 = Math.abs(n) % 100
  const mod10 = mod100 % 10
  if (mod100 > 10 && mod100 < 20) return `${n} ${forms.many}`
  if (mod10 === 1) return `${n} ${forms.one}`
  if (mod10 >= 2 && mod10 <= 4) return `${n} ${forms.few}`
  return `${n} ${forms.many}`
}

/** Piped отдаёт Unix time в секундах; если значение уже в мс — не умножаем. */
export const uploadedToMs = (ts: number): number => {
  return ts < 1e12 ? ts * 1000 : ts
}

export const formatUploadedAbsolute = (ts: number): string => {
  return new Intl.DateTimeFormat("ru", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(uploadedToMs(ts)))
}

export const formatUploadedRelative = (
  ts: number | undefined,
  now = new Date(),
): string => {
  if (ts == null || !Number.isFinite(ts)) return "—"
  const ms = uploadedToMs(ts)
  const uploaded = new Date(ms)
  const diffMs = now.getTime() - uploaded.getTime()

  if (diffMs < 0) return formatUploadedAbsolute(ts)
  if (diffMs < MS_MIN) return "только что"

  if (diffMs < MS_HOUR) {
    const m = Math.floor(diffMs / MS_MIN)
    return pluralRu(m, {
      one: "минуту назад",
      few: "минуты назад",
      many: "минут назад",
    })
  }
  if (diffMs < 24 * MS_HOUR) {
    const h = Math.floor(diffMs / MS_HOUR)
    return pluralRu(h, {
      one: "час назад",
      few: "часа назад",
      many: "часов назад",
    })
  }
  if (diffMs < 30 * MS_DAY) {
    const d = Math.floor(diffMs / MS_DAY)
    return pluralRu(d, {
      one: "день назад",
      few: "дня назад",
      many: "дней назад",
    })
  }
  if (diffMs < 365 * MS_DAY) {
    const mo = Math.floor(diffMs / (30 * MS_DAY))
    return pluralRu(mo, {
      one: "месяц назад",
      few: "месяца назад",
      many: "месяцев назад",
    })
  }
  const y = Math.floor(diffMs / (365 * MS_DAY))
  return pluralRu(y, {
    one: "год назад",
    few: "года назад",
    many: "лет назад",
  })
}

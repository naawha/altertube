/** Одна значащая цифра после запятой, если число не целое. */
function formatAbbreviatedUnit(x: number): string {
  const rounded = Math.round(x * 10) / 10
  if (Number.isInteger(rounded)) return String(rounded)
  return rounded.toFixed(1).replace(".", ",")
}

function subscribersPlural(
  n: number,
): "подписчик" | "подписчика" | "подписчиков" {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return "подписчиков"
  if (mod10 === 1) return "подписчик"
  if (mod10 >= 2 && mod10 <= 4) return "подписчика"
  return "подписчиков"
}

/**
 * До 10 000 включительно — полное число и склонение «подписчик»;
 * строго больше 10 тыс. до 1 млн — N тыс.; до 1 млрд — N млн; иначе — N млрд.
 */
export function formatSubscriberCountRu(n: number): string {
  if (!Number.isFinite(n) || n < 0) return ""
  const rounded = Math.floor(n)
  if (rounded <= 10_000) {
    return `${rounded.toLocaleString("ru")} ${subscribersPlural(rounded)}`
  }
  if (rounded < 1_000_000) {
    return `${formatAbbreviatedUnit(rounded / 1000)} тыс. подписчиков`
  }
  if (rounded < 1_000_000_000) {
    return `${formatAbbreviatedUnit(rounded / 1_000_000)} млн подписчиков`
  }
  return `${formatAbbreviatedUnit(rounded / 1_000_000_000)} млрд подписчиков`
}

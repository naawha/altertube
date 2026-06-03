class UrlHelper {
  static index(): string {
    return "/"
  }

  static watch(id: string): string {
    return `/watch/?v=${id}`
  }
}

export default UrlHelper

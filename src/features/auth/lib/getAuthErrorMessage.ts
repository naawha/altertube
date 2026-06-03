export function getAuthErrorMessage(err: unknown, fallback: string): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "data" in err &&
    typeof (err as { data: unknown }).data === "object" &&
    (err as { data: { error?: string } }).data &&
    typeof (err as { data: { error?: string } }).data.error === "string"
  ) {
    return (err as { data: { error: string } }).data.error
  }
  if (err instanceof Error) {
    return err.message
  }
  return fallback
}

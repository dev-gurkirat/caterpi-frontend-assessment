export type DataResult<T> =
  | { status: "ok"; data: T }
  | { status: "empty" }
  | { status: "unauthenticated" }
  | { status: "not_found" }
  | { status: "unavailable"; message: string };

export function unavailable(message: string): DataResult<never> {
  return { status: "unavailable", message };
}

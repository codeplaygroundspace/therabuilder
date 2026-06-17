import type { SiteDocument } from "../schema";

/** A location within the document: object keys (string) and array indices (number). */
export type Path = readonly (string | number)[];

/**
 * Immutably set the value at `path` within `target`, returning a new structure that shares
 * everything off the path. Pure — the input is never mutated, so React sees a fresh document
 * and the preview re-renders. Used for every text edit and the theme swap (path `["theme"]`).
 *
 * Generic over objects and arrays; an empty path replaces the whole value.
 */
export function setByPath<T>(target: T, path: Path, value: unknown): T {
  if (path.length === 0) return value as T;
  const [head, ...rest] = path;

  if (Array.isArray(target)) {
    const index = head as number;
    const copy = target.slice();
    copy[index] = setByPath(target[index], rest, value);
    return copy as T;
  }

  const obj = target as Record<string, unknown>;
  return {
    ...obj,
    [head]: setByPath(obj[head as string], rest, value),
  } as T;
}

/** Read the string value at `path`, or "" if it is missing / not a string. */
export function getString(document: SiteDocument, path: Path): string {
  let current: unknown = document;
  for (const key of path) {
    if (current == null) return "";
    current = (current as Record<string | number, unknown>)[key];
  }
  return typeof current === "string" ? current : "";
}

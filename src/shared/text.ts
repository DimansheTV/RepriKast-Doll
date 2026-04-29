import { decodeMojibakeText } from "./i18n";

export function normalizeText(value: unknown): string {
  return decodeMojibakeText(value).replace(/\s+/g, " ").trim();
}

export function escapeHtml(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

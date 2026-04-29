// @ts-nocheck
import { normalizeText as normalizeSharedText, deepClone as deepCloneShared, escapeHtml as escapeHtmlShared } from "../../../shared/text";

export function normalizeText(value) {
  return normalizeSharedText(value);
}

export function deepClone(value) {
  return deepCloneShared(value);
}

export function sanitizeClassLevel(level) {
  const numeric = Number(level);
  if (!Number.isFinite(numeric)) {
    return 1;
  }

  return Math.min(200, Math.max(1, Math.floor(numeric)));
}

export function escapeHtml(value) {
  return escapeHtmlShared(value ?? "");
}

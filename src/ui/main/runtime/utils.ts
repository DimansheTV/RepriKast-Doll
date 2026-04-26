// @ts-nocheck
export function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function sanitizeClassLevel(level) {
  const numeric = Number(level);
  if (!Number.isFinite(numeric)) {
    return 1;
  }

  return Math.min(200, Math.max(1, Math.floor(numeric)));
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

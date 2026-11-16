const UUID_PREFIX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[-_]?/i;

const FILE_UNITS = ["B", "KB", "MB", "GB", "TB"];

export type DateInput = Date | string | number;

export interface DateFormatOptions {
  locale?: string;
  timeZone?: string;
}

export function formatFileName(fileName: string): string {
  if (!fileName) return "";
  const stripped = fileName.replace(UUID_PREFIX, "").trim();
  return stripped || fileName;
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    FILE_UNITS.length - 1
  );
  const value = bytes / 1024 ** exponent;
  const fractionDigits = exponent === 0 ? 0 : value >= 10 ? 0 : 1;
  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  });
  return `${formatted} ${FILE_UNITS[exponent]}`;
}

const MIME_LABELS: Array<[RegExp, string]> = [
  [/wordprocessingml\.document/, "DOCX"],
  [/spreadsheetml\.sheet/, "XLSX"],
  [/presentationml\.presentation/, "PPTX"],
  [/pdf/, "PDF"],
  [/csv/, "CSV"],
  [/json/, "JSON"],
  [/markdown/, "MD"],
  [/plain/, "TXT"],
];

export function formatMimeType(mimeType: string | null | undefined): string {
  if (!mimeType) return "FILE";
  const normalized = mimeType.toLowerCase();
  const known = MIME_LABELS.find(([pattern]) => pattern.test(normalized));
  if (known) return known[1];

  const subtype = normalized.split("/")[1] || "FILE";
  const label = subtype.toUpperCase();
  return label.length > 10 ? `${label.slice(0, 10)}…` : label;
}

function toDate(value: DateInput): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: DateInput, options: DateFormatOptions = {}): string {
  const date = toDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat(options.locale ?? "en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: options.timeZone,
  }).format(date);
}

export function formatRelative(value: DateInput, now: DateInput = new Date()): string {
  const date = toDate(value);
  const reference = toDate(now);
  if (!date || !reference) return "—";

  const diffSeconds = (date.getTime() - reference.getTime()) / 1000;
  const absolute = Math.abs(diffSeconds);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absolute < 45) return "just now";
  if (absolute < 3600) return formatter.format(Math.round(diffSeconds / 60), "minute");
  if (absolute < 86400) return formatter.format(Math.round(diffSeconds / 3600), "hour");
  if (absolute < 604800) return formatter.format(Math.round(diffSeconds / 86400), "day");
  if (absolute < 2629800) return formatter.format(Math.round(diffSeconds / 604800), "week");
  if (absolute < 31557600) return formatter.format(Math.round(diffSeconds / 2629800), "month");
  return formatter.format(Math.round(diffSeconds / 31557600), "year");
}

export function formatPlanName(value: string | null | undefined): string {
  if (!value) return "";
  const cleaned = value.replace(/[_-]+/g, " ").trim();
  if (!cleaned) return "";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
}

const PROVIDER_LABELS: Record<string, string> = {
  openai: "OpenAI",
  gemini: "Gemini",
  cohere: "Cohere",
  voyage: "Voyage",
  azure: "Azure",
  ollama: "Ollama",
  huggingface: "HuggingFace",
};

export function formatEmbeddingModel(value: string | null | undefined): string {
  if (!value) return "—";

  const providerMatch = value.match(/provider:\s*([^,;]+)/i);
  const dimensionMatch = value.match(/dim(?:ension)?s?:\s*([0-9,_.]+)/i);
  if (!providerMatch && !dimensionMatch) return value;

  const provider = providerMatch?.[1].trim().toLowerCase();
  const providerLabel = provider
    ? PROVIDER_LABELS[provider] ??
      provider.replace(/\b\w/g, (character) => character.toUpperCase())
    : "Unknown provider";
  const dimensions = dimensionMatch?.[1]
    ? Number(dimensionMatch[1].replace(/[,_]/g, ""))
    : NaN;

  if (!Number.isFinite(dimensions) || dimensions <= 0) return providerLabel;
  return `${providerLabel} · ${dimensions.toLocaleString("en-US")} dimensions`;
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase();
}

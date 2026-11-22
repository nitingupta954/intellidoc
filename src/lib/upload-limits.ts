export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export const ACCEPTED_UPLOAD_EXTENSIONS = [
  "pdf",
  "docx",
  "pptx",
  "txt",
  "md",
  "csv",
  "json",
] as const;

export function getUploadExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export function isAcceptedUploadName(fileName: string): boolean {
  return (ACCEPTED_UPLOAD_EXTENSIONS as readonly string[]).includes(
    getUploadExtension(fileName)
  );
}

export function sanitizeUploadName(fileName: string): string {
  const base = fileName.split(/[\\/]/).pop() ?? "document";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_");
}

const UPLOAD_MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain; charset=utf-8",
  md: "text/markdown; charset=utf-8",
  csv: "text/csv; charset=utf-8",
  json: "application/json",
};

export function getUploadMimeType(fileName: string): string {
  return UPLOAD_MIME_TYPES[getUploadExtension(fileName)] ?? "application/octet-stream";
}

export function isInlineSafeMimeType(mimeType: string): boolean {
  return mimeType === "application/pdf";
}

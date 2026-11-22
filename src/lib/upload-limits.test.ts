import { describe, expect, it } from "vitest";

import {
  getUploadExtension,
  getUploadMimeType,
  isAcceptedUploadName,
  isInlineSafeMimeType,
  sanitizeUploadName,
} from "./upload-limits";

describe("upload limits", () => {
  it("accepts supported extensions case-insensitively", () => {
    for (const name of [
      "report.pdf",
      "report.DOCX",
      "slides.pptx",
      "notes.txt",
      "notes.md",
      "data.csv",
      "data.json",
    ]) {
      expect(isAcceptedUploadName(name)).toBe(true);
    }
  });

  it("rejects unsupported or missing extensions", () => {
    for (const name of ["script.exe", "archive.zip", "file", "file.pdf.exe"]) {
      expect(isAcceptedUploadName(name)).toBe(false);
    }
  });

  it("derives the extension from the final path segment", () => {
    expect(getUploadExtension("folder/report.PDF")).toBe("pdf");
    expect(sanitizeUploadName("../../evil name.pdf")).toBe("evil_name.pdf");
    expect(sanitizeUploadName("folder/report.pdf")).toBe("report.pdf");
  });

  it("returns safe MIME types", () => {
    expect(getUploadMimeType("report.pdf")).toBe("application/pdf");
    expect(getUploadMimeType("unknown.bin")).toBe("application/octet-stream");
    expect(isInlineSafeMimeType("application/pdf")).toBe(true);
    expect(isInlineSafeMimeType("text/html")).toBe(false);
  });
});

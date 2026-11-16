import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatEmbeddingModel,
  formatFileName,
  formatFileSize,
  formatMimeType,
  formatPlanName,
  formatRelative,
  getInitials,
} from "./format";

describe("formatFileName", () => {
  it("strips a leading uuid prefix", () => {
    expect(
      formatFileName(
        "550e8400-e29b-41d4-a716-446655440000-quarterly-report.pdf"
      )
    ).toBe("quarterly-report.pdf");
  });

  it("strips a uuid prefix joined with an underscore", () => {
    expect(
      formatFileName(
        "550e8400-e29b-41d4-a716-446655440000_policy.docx"
      )
    ).toBe("policy.docx");
  });

  it("leaves names without a uuid untouched", () => {
    expect(formatFileName("annual-report.pdf")).toBe("annual-report.pdf");
  });

  it("does not strip uuid fragments that are not a full prefix", () => {
    expect(formatFileName("report-550e8400.pdf")).toBe("report-550e8400.pdf");
  });

  it("handles empty input", () => {
    expect(formatFileName("")).toBe("");
  });
});

describe("formatFileSize", () => {
  it("formats bytes", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(512)).toBe("512 B");
  });

  it("promotes to KB instead of showing 0.04 MB", () => {
    expect(formatFileSize(41 * 1024)).toBe("41 KB");
  });

  it("formats fractional KB and MB", () => {
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.5 MB");
  });

  it("rounds large values without decimals", () => {
    expect(formatFileSize(12.4 * 1024 * 1024)).toBe("12 MB");
  });
});

describe("formatMimeType", () => {
  it("maps common document mime types", () => {
    expect(
      formatMimeType(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    ).toBe("DOCX");
    expect(formatMimeType("application/pdf")).toBe("PDF");
    expect(formatMimeType("text/markdown")).toBe("MD");
  });

  it("falls back to a readable subtype", () => {
    expect(formatMimeType("application/octet-stream")).toBe("OCTET-STRE…");
    expect(formatMimeType("image/png")).toBe("PNG");
  });

  it("handles missing values", () => {
    expect(formatMimeType(null)).toBe("FILE");
  });
});

describe("formatDate", () => {
  it("formats a date consistently", () => {
    expect(
      formatDate("2026-11-15T12:00:00Z", { timeZone: "UTC" })
    ).toBe("15 Nov 2026");
  });

  it("returns a placeholder for invalid input", () => {
    expect(formatDate("not-a-date")).toBe("—");
  });
});

describe("formatRelative", () => {
  const now = "2026-11-15T12:00:00Z";

  it("handles very recent timestamps", () => {
    expect(formatRelative("2026-11-15T11:59:40Z", now)).toBe("just now");
  });

  it("formats minutes, hours and days", () => {
    expect(formatRelative("2026-11-15T11:30:00Z", now)).toBe("30 minutes ago");
    expect(formatRelative("2026-11-15T09:00:00Z", now)).toBe("3 hours ago");
    expect(formatRelative("2026-11-13T12:00:00Z", now)).toBe("2 days ago");
  });

  it("formats future timestamps", () => {
    expect(formatRelative("2026-11-15T13:00:00Z", now)).toBe("in 1 hour");
  });
});

describe("formatPlanName", () => {
  it("formats enum values", () => {
    expect(formatPlanName("PRO")).toBe("Pro");
    expect(formatPlanName("ENTERPRISE")).toBe("Enterprise");
    expect(formatPlanName("FREE")).toBe("Free");
  });

  it("formats credit pack ids", () => {
    expect(formatPlanName("starter")).toBe("Starter");
    expect(formatPlanName("starter Pack")).toBe("Starter pack");
  });

  it("returns an empty string for missing values", () => {
    expect(formatPlanName(null)).toBe("");
  });
});

describe("formatEmbeddingModel", () => {
  it("formats provider and dimension metadata", () => {
    expect(formatEmbeddingModel("provider: openai, dim: 1536")).toBe(
      "OpenAI · 1,536 dimensions"
    );
  });

  it("keeps unknown strings untouched", () => {
    expect(formatEmbeddingModel("text-embedding-3-small")).toBe(
      "text-embedding-3-small"
    );
  });

  it("returns a placeholder for missing values", () => {
    expect(formatEmbeddingModel(undefined)).toBe("—");
  });
});

describe("getInitials", () => {
  it("uses first and last words", () => {
    expect(getInitials("Nitin Gupta")).toBe("NG");
    expect(getInitials("Nitin Kumar Gupta")).toBe("NG");
  });

  it("uses a single character for one word", () => {
    expect(getInitials("Nitin")).toBe("N");
  });

  it("falls back for missing names", () => {
    expect(getInitials("")).toBe("?");
    expect(getInitials(null)).toBe("?");
  });
});

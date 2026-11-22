import { NextResponse } from "next/server";

import { sanitizeDownloadName } from "@/lib/authz";
import { db } from "@/lib/db";
import { downloadFile } from "@/lib/storage";
import {
  getUploadMimeType,
  isInlineSafeMimeType,
} from "@/lib/upload-limits";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const sharedLink = await db.sharedLink.findUnique({
      where: { token },
    });

    if (!sharedLink || sharedLink.resourceType !== "DOCUMENT") {
      return new NextResponse("Shared document not found", { status: 404 });
    }

    if (sharedLink.expiresAt && sharedLink.expiresAt < new Date()) {
      return new NextResponse("This shared link has expired", { status: 410 });
    }

    const document = await db.document.findFirst({
      where: {
        id: sharedLink.resourceId,
        workspaceId: sharedLink.workspaceId,
      },
    });

    if (!document) {
      return new NextResponse("Shared document not found", { status: 404 });
    }

    let fileBuffer: Buffer;
    try {
      fileBuffer = await downloadFile(document.storageKey);
    } catch {
      return new NextResponse("File not found on disk", { status: 404 });
    }

    const mimeType = getUploadMimeType(document.filename);
    const disposition = isInlineSafeMimeType(mimeType) ? "inline" : "attachment";
    const safeName = sanitizeDownloadName(document.filename);

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `${disposition}; filename="${safeName}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (error) {
    console.error("[SHARED_DOCUMENT_DOWNLOAD]", error);
    return new NextResponse("Failed to download document", { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getUploadPresignedUrl } from "@/lib/storage";
import { auth } from "@/auth";
import { isWorkspaceMember } from "@/lib/authz";
import {
  getUploadMimeType,
  isAcceptedUploadName,
  MAX_UPLOAD_BYTES,
  sanitizeUploadName,
} from "@/lib/upload-limits";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fileName, fileType, fileSize, workspaceId } = body;

    if (
      typeof fileName !== "string" ||
      typeof fileType !== "string" ||
      typeof fileSize !== "number" ||
      typeof workspaceId !== "string" ||
      !fileName.trim() ||
      !workspaceId.trim()
    ) {
      return NextResponse.json({ error: "Missing file details" }, { status: 400 });
    }

    if (!Number.isFinite(fileSize) || fileSize <= 0) {
      return NextResponse.json({ error: "Invalid file size" }, { status: 400 });
    }

    if (fileSize > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "File size exceeds the 20MB limit." },
        { status: 400 }
      );
    }

    if (!isAcceptedUploadName(fileName)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use PDF, DOCX, PPTX, TXT, MD, CSV, or JSON." },
        { status: 400 }
      );
    }

    if (!(await isWorkspaceMember(session.user.id, workspaceId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const safeMimeType = getUploadMimeType(fileName);
    const uniqueFileName = `${workspaceId}/${crypto.randomUUID()}-${sanitizeUploadName(fileName)}`;

    // Create a presigned URL for direct S3 upload
    const presignedUrl = await getUploadPresignedUrl(uniqueFileName, safeMimeType);

    // Return the presigned URL. Database record will be created in /api/upload/complete
    return NextResponse.json({ 
      success: true, 
      presignedUrl,
      storageKey: uniqueFileName
    });

  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

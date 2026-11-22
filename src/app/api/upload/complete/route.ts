import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDocumentRecord } from "@/actions/documents";
import { publishDocumentJob } from "@/lib/rabbitmq";
import {
  getUploadMimeType,
  isAcceptedUploadName,
  MAX_UPLOAD_BYTES,
} from "@/lib/upload-limits";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      storageKey,
      fileName,
      fileType,
      fileSize,
      workspaceId,
      knowledgeBaseId,
      folderId,
    } = body;

    if (
      typeof storageKey !== "string" ||
      typeof fileName !== "string" ||
      typeof fileType !== "string" ||
      typeof fileSize !== "number" ||
      typeof workspaceId !== "string" ||
      !storageKey ||
      !fileName ||
      !workspaceId
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (
      !isAcceptedUploadName(fileName) ||
      !Number.isFinite(fileSize) ||
      fileSize <= 0 ||
      fileSize > MAX_UPLOAD_BYTES
    ) {
      return NextResponse.json({ error: "Invalid file details" }, { status: 400 });
    }

    if (!storageKey.startsWith(`${workspaceId}/`)) {
      return NextResponse.json({ error: "Invalid storage key" }, { status: 400 });
    }

    const safeFileName = fileName.split(/[\\/]/).pop() || "document";

    // Now that the file is successfully uploaded to S3, we create the database record
    const dbRecord = await createDocumentRecord({
      title: safeFileName.replace(/\.[^.]+$/, ""),
      filename: safeFileName,
      storageKey,
      fileSize,
      mimeType: getUploadMimeType(fileName),
      workspaceId,
      knowledgeBaseId,
      folderId,
    });

    if (!dbRecord.success || !dbRecord.data) {
      return NextResponse.json(
        { error: dbRecord.error || "Failed to create database record" },
        { status: dbRecord.error === "Forbidden." ? 403 : 400 }
      );
    }

    const document = dbRecord.data;

    // Trigger RabbitMQ Job
    try {
      const minioPath = `minio://${process.env.S3_BUCKET_NAME || "intellidoc-documents"}/${document.storageKey}`;
      await publishDocumentJob(
        document.id,
        minioPath,
        session.user.id,
        document.workspaceId,
        document.knowledgeBaseId || null
      );
    } catch (mqError) {
      console.error("Failed to push job to RabbitMQ:", mqError);
      // We don't fail the upload if MQ is temporarily down, but log it.
    }

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error("Upload complete route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

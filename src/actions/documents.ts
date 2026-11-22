"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function getDocuments(workspaceId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return { success: false, error: "Unauthorized." };
    }

    const membership = await db.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
      select: { id: true },
    });

    if (!membership) {
      return { success: false, error: "Forbidden." };
    }

    const docs = await db.document.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: docs };
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return { success: false, error: "Failed to fetch documents." };
  }
}

export async function createDocumentRecord(data: {
  title: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
  workspaceId: string;
  knowledgeBaseId?: string | null;
  folderId?: string | null;
}) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return { success: false, error: "Unauthorized." };
    }

    const membership = await db.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: data.workspaceId, userId } },
      select: { id: true },
    });

    if (!membership) {
      return { success: false, error: "Forbidden." };
    }

    if (data.knowledgeBaseId) {
      const knowledgeBase = await db.knowledgeBase.findFirst({
        where: { id: data.knowledgeBaseId, workspaceId: data.workspaceId },
        select: { id: true },
      });
      if (!knowledgeBase) {
        return { success: false, error: "Knowledge base not found." };
      }
    }

    if (data.folderId) {
      const folder = await db.folder.findFirst({
        where: { id: data.folderId, workspaceId: data.workspaceId },
        select: { id: true },
      });
      if (!folder) {
        return { success: false, error: "Folder not found." };
      }
    }

    const doc = await db.document.create({
      data: {
        title: data.title,
        filename: data.filename,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        uploadedBy: userId,
        storageKey: data.storageKey,
        status: "UPLOADED",
        workspaceId: data.workspaceId,
        knowledgeBaseId: data.knowledgeBaseId || null,
        folderId: data.folderId || null,
      },
    });
    
    revalidatePath("/documents");
    revalidatePath(`/workspaces/${data.workspaceId}`);
    return { success: true, data: doc };
  } catch (error) {
    console.error("Failed to create document record:", error);
    return { success: false, error: "Failed to create record." };
  }
}

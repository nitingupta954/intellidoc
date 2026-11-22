import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

import { auth } from "@/auth";
import { db } from "@/lib/db";

const SHARED_RESOURCE_TYPES = ["DOCUMENT", "CONVERSATION"] as const;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { resourceId, resourceType, workspaceId, expiresInDays } = body;

    if (
      typeof resourceId !== "string" ||
      typeof resourceType !== "string" ||
      typeof workspaceId !== "string" ||
      !resourceId ||
      !workspaceId
    ) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    if (
      !SHARED_RESOURCE_TYPES.includes(
        resourceType as (typeof SHARED_RESOURCE_TYPES)[number]
      )
    ) {
      return new NextResponse("Unsupported resource type", { status: 400 });
    }

    const workspace = await db.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { ownerId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      },
      select: { id: true },
    });

    if (!workspace) {
      return new NextResponse("Workspace not found or access denied", { status: 404 });
    }

    if (resourceType === "DOCUMENT") {
      const document = await db.document.findFirst({
        where: { id: resourceId, workspaceId },
        select: { id: true },
      });

      if (!document) {
        return new NextResponse("Document not found", { status: 404 });
      }
    }

    if (resourceType === "CONVERSATION") {
      const conversation = await db.conversation.findFirst({
        where: { id: resourceId, workspaceId, userId: session.user.id },
        select: { id: true },
      });

      if (!conversation) {
        return new NextResponse("Conversation not found", { status: 404 });
      }
    }

    const requestedDays = Number(expiresInDays);
    const days = Number.isFinite(requestedDays)
      ? Math.min(Math.max(Math.trunc(requestedDays), 1), 365)
      : 7;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    const sharedLink = await db.sharedLink.create({
      data: {
        token: randomBytes(32).toString("hex"),
        resourceId,
        resourceType,
        workspaceId,
        createdBy: session.user.id,
        expiresAt,
      },
    });

    return NextResponse.json(sharedLink);
  } catch (error) {
    console.error("[SHARED_LINKS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

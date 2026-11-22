import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;
    const body = await req.json();
    const { name, parentId } = body;

    const existing = await db.folder.findUnique({
      where: { id: resolvedParams.id },
      select: { id: true, workspaceId: true },
    });

    if (!existing) {
      return new NextResponse("Folder not found", { status: 404 });
    }

    const membership = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: existing.workspaceId,
          userId: session.user.id,
        },
      },
      select: { id: true },
    });

    if (!membership) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (parentId) {
      if (parentId === existing.id) {
        return new NextResponse("A folder cannot contain itself", { status: 400 });
      }

      const parent = await db.folder.findFirst({
        where: { id: parentId, workspaceId: existing.workspaceId },
        select: { id: true },
      });

      if (!parent) {
        return new NextResponse("Parent folder not found", { status: 400 });
      }
    }

    const folder = await db.folder.update({
      where: {
        id: resolvedParams.id,
      },
      data: {
        ...(name && { name }),
        ...(parentId !== undefined && { parentId })
      }
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error("[FOLDER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;

    const existing = await db.folder.findUnique({
      where: { id: resolvedParams.id },
      select: { id: true, workspaceId: true },
    });

    if (!existing) {
      return new NextResponse("Folder not found", { status: 404 });
    }

    const membership = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: existing.workspaceId,
          userId: session.user.id,
        },
      },
      select: { id: true },
    });

    if (!membership) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const folder = await db.folder.delete({
      where: {
        id: resolvedParams.id,
      }
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error("[FOLDER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

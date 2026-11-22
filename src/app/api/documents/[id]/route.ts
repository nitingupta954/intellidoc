import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { isInternalServiceRequest } from '@/lib/authz';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const documentId = resolvedParams.id;

    const document = await db.document.findUnique({
      where: { id: documentId },
      include: {
        workspace: {
          include: {
            members: {
              where: { userId: session.user.id }
            }
          }
        }
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (document.workspace.members.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Strip out the workspace relation before sending to client
    const safeDoc = { ...document };
    delete (safeDoc as { workspace?: unknown }).workspace;
    return NextResponse.json({ document: safeDoc });
  } catch (error: unknown) {
    console.error('Fetch Document Error:', error);
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}


export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const documentId = resolvedParams.id;
    const internalRequest = isInternalServiceRequest(req);
    const session = internalRequest ? null : await auth();
    const userId = session?.user?.id;

    const existing = await db.document.findUnique({
      where: { id: documentId },
      select: { id: true, workspaceId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (!internalRequest) {
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const membership = await db.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: existing.workspaceId,
            userId,
          },
        },
        select: { id: true },
      });

      if (!membership) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const body = await req.json();
    const {
      status,
      chunkCount,
      embeddingModel,
      errorMessage,
      currentStep,
      progress,
      summary,
      suggestedQuestions,
      folderId,
    } = body;

    if (status !== undefined && (typeof status !== 'string' || status.length > 32)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    if (progress !== undefined && (typeof progress !== 'number' || progress < 0 || progress > 100)) {
      return NextResponse.json({ error: 'Invalid progress' }, { status: 400 });
    }
    if (chunkCount !== undefined && (typeof chunkCount !== 'number' || chunkCount < 0)) {
      return NextResponse.json({ error: 'Invalid chunk count' }, { status: 400 });
    }

    if (folderId !== undefined && !internalRequest) {
      if (folderId !== null && typeof folderId !== 'string') {
        return NextResponse.json({ error: 'Invalid folder' }, { status: 400 });
      }

      if (folderId) {
        const folder = await db.folder.findFirst({
          where: { id: folderId, workspaceId: existing.workspaceId },
          select: { id: true },
        });
        if (!folder) {
          return NextResponse.json({ error: 'Folder not found' }, { status: 400 });
        }
      }
    }

    const updateData = {
      ...(internalRequest && typeof status === 'string' && { status }),
      ...(internalRequest && typeof chunkCount === 'number' && { chunkCount }),
      ...(internalRequest && typeof embeddingModel === 'string' && { embeddingModel }),
      ...(internalRequest && typeof errorMessage === 'string' && { errorMessage }),
      ...(internalRequest && typeof currentStep === 'string' && { currentStep }),
      ...(internalRequest && typeof progress === 'number' && { progress }),
      ...(internalRequest && typeof summary === 'string' && { summary }),
      ...(internalRequest && suggestedQuestions !== undefined && { suggestedQuestions }),
      ...(folderId !== undefined && { folderId }),
    };

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const document = await db.document.update({
      where: { id: documentId },
      data: updateData,
    });

    return NextResponse.json({ success: true, document });
  } catch (error: unknown) {
    console.error('Update Document Error:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const documentId = resolvedParams.id;

    // Check if the document belongs to the user
    const document = await db.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (document.uploadedBy !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the document (cascade delete citations etc should be handled by Prisma schema)
    await db.document.delete({
      where: { id: documentId }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Delete Document Error:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}

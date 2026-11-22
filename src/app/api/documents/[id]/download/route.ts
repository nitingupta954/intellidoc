import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { downloadFile } from '@/lib/storage';
import { sanitizeDownloadName } from '@/lib/authz';
import {
  getUploadMimeType,
  isInlineSafeMimeType,
} from '@/lib/upload-limits';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
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
      return new NextResponse('Document not found', { status: 404 });
    }

    if (document.workspace.members.length === 0) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Download the file from S3 / MinIO
    let fileBuffer;
    try {
      fileBuffer = await downloadFile(document.storageKey);
    } catch {
      return new NextResponse('File not found on disk', { status: 404 });
    }

    const mimeType = getUploadMimeType(document.filename);
    const disposition = isInlineSafeMimeType(mimeType) ? 'inline' : 'attachment';
    const safeName = sanitizeDownloadName(document.filename);

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `${disposition}; filename="${safeName}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: unknown) {
    console.error('Download Document Error:', error);
    return new NextResponse('Failed to download document', { status: 500 });
  }
}

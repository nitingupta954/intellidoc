import { timingSafeEqual } from "crypto";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function getSessionUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function isWorkspaceMember(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  const membership = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
    select: { id: true },
  });
  return Boolean(membership);
}

export function isInternalServiceRequest(req: Request): boolean {
  const provided = req.headers.get("x-internal-secret");
  const expected = process.env.INTERNAL_SERVICE_SECRET;

  if (!provided || !expected) return false;

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(providedBuffer, expectedBuffer);
}

export function sanitizeDownloadName(name: string): string {
  return name
    .replace(/[\r\n"]/g, "")
    .replace(/[\\/]/g, "_")
    .replace(/[^\x20-\x7E]/g, "_");
}

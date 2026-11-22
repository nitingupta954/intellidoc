import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { emailService } from "@/lib/email";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: workspaceId } = await params;
    const { email, role } = await req.json();

    if (typeof email !== "string" || typeof role !== "string") {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (
      normalizedEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
      !["ADMIN", "MEMBER"].includes(role)
    ) {
      return NextResponse.json({ error: "Invalid email or role" }, { status: 400 });
    }

    const inviteRole = role === "ADMIN" ? "ADMIN" : "MEMBER";

    const member = await db.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });

    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const existingUser = await db.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
      select: { id: true },
    });
    if (existingUser) {
      const isMember = await db.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: existingUser.id } },
      });
      if (isMember) {
        return NextResponse.json({ error: "User is already a member" }, { status: 400 });
      }
    }

    const pendingInvitation = await db.invitation.findFirst({
      where: {
        workspaceId,
        email: normalizedEmail,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      select: { id: true },
    });

    if (pendingInvitation) {
      return NextResponse.json(
        { error: "An invitation is already pending for this email" },
        { status: 400 }
      );
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await db.invitation.create({
      data: {
        workspaceId,
        email: normalizedEmail,
        role: inviteRole,
        token,
        status: "PENDING",
        expiresAt,
        invitedBy: userId,
      },
    });

    // Send email using Nodemailer
    const inviterName = session.user.name || "A team member";
    try {
      await emailService.sendWorkspaceInvite(
        normalizedEmail,
        token,
        inviterName,
        workspace.name
      );
    } catch (emailError) {
      console.error("Workspace invite email error:", emailError);
      await db.invitation.delete({ where: { id: invitation.id } }).catch(() => {});
      return NextResponse.json(
        { error: "Invitation could not be sent. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error: unknown) {
    console.error("Invite error:", error);
    return NextResponse.json({ error: "Failed to send invite" }, { status: 500 });
  }
}

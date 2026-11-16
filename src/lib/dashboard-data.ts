import { db } from "@/lib/db";

export type DashboardDocumentStatus =
  | "PENDING"
  | "UPLOADED"
  | "INGESTING"
  | "PROCESSING"
  | "READY"
  | "INDEXED"
  | "COMPLETE"
  | "COMPLETED"
  | "FAILED"
  | "ERROR"
  | "CANCELLED"
  | "CANCELED"
  | string;

export interface DashboardDocument {
  id: string;
  name: string;
  status: DashboardDocumentStatus;
  createdAt: Date;
}

export interface DashboardActivity {
  id: string;
  type: "document" | "conversation";
  title: string;
  date: Date;
  href: string;
}

export interface DashboardInsight {
  id: string;
  tone: "warning" | "info" | "neutral";
  title: string;
  body: string;
  action: string;
  href: string;
}

export interface DashboardData {
  totalDocuments: number;
  aiQueries: number;
  timeSavedMinutes: number;
  recentDocuments: DashboardDocument[];
  activity: DashboardActivity[];
  insights: DashboardInsight[];
  workspaceCount: number;
  primaryWorkspaceName: string | null;
}

const PROCESSING_STATUSES = ["PENDING", "UPLOADED", "INGESTING", "PROCESSING"];
const FAILED_STATUSES = ["FAILED", "ERROR"];
const INDEXED_STATUSES = ["READY", "INDEXED", "COMPLETE", "COMPLETED"];

function normalizeStatus(status: string | null | undefined): string {
  return String(status || "").toUpperCase();
}

function displayDocumentName(filename: string | null | undefined): string {
  const name = (filename || "").trim();
  if (!name) return "Untitled document";
  return name.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[-_]?/i, "") || name;
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const membershipWhere = { workspace: { members: { some: { userId } } } };

  const [
    totalDocuments,
    aiQueries,
    recentDocs,
    recentConvos,
    failedDocuments,
    processingDocuments,
    memberships,
    user,
    wallet,
  ] = await Promise.all([
    db.document.count({ where: membershipWhere }),
    db.message.count({
      where: {
        role: { equals: "user", mode: "insensitive" },
        conversation: { workspace: { members: { some: { userId } } } },
      },
    }),
    db.document.findMany({
      where: membershipWhere,
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, filename: true, status: true, createdAt: true },
    }),
    db.conversation.findMany({
      where: membershipWhere,
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, createdAt: true },
    }),
    db.document.count({
      where: {
        ...membershipWhere,
        status: { in: FAILED_STATUSES },
      },
    }),
    db.document.count({
      where: {
        ...membershipWhere,
        status: { in: PROCESSING_STATUSES },
      },
    }),
    db.workspaceMember.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { workspace: { select: { name: true } } },
    }),
    db.user.findUnique({
      where: { id: userId },
      select: { openaiKey: true, geminiKey: true },
    }),
    db.creditWallet.findUnique({
      where: { userId },
      select: { balance: true },
    }),
  ]);

  const recentDocuments = recentDocs.map((document) => ({
    id: document.id,
    name: displayDocumentName(document.filename),
    status: normalizeStatus(document.status) as DashboardDocumentStatus,
    createdAt: document.createdAt,
  }));

  const activity: DashboardActivity[] = [
    ...recentDocs.map((document) => ({
      id: document.id,
      type: "document" as const,
      title: `Uploaded ${displayDocumentName(document.filename)}`,
      date: document.createdAt,
      href: `/documents/${document.id}`,
    })),
    ...recentConvos.map((conversation) => ({
      id: conversation.id,
      type: "conversation" as const,
      title: `Asked about ${conversation.title}`,
      date: conversation.createdAt,
      href: "/chat",
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  const insights: DashboardInsight[] = [];
  const isByok = Boolean(user?.openaiKey || user?.geminiKey);
  const balance = wallet?.balance ?? 0;

  if (failedDocuments > 0) {
    insights.push({
      id: "failed-documents",
      tone: "warning",
      title: `${failedDocuments} ${failedDocuments === 1 ? "document needs" : "documents need"} attention`,
      body: "Indexing did not finish. Retry the upload or replace the file before relying on its answers.",
      action: "Review documents",
      href: "/documents",
    });
  }

  if (processingDocuments > 0) {
    insights.push({
      id: "processing-documents",
      tone: "info",
      title: `${processingDocuments} ${processingDocuments === 1 ? "document is" : "documents are"} processing`,
      body: "Indexing is still running. Answers will use these files as soon as processing completes.",
      action: "View processing",
      href: "/documents",
    });
  }

  if (!isByok && balance <= 1_000) {
    insights.push({
      id: "low-credits",
      tone: "warning",
      title: "AI credits are running low",
      body: `${balance.toLocaleString()} credits remain in your wallet. Refill before your next research session.`,
      action: "Manage credits",
      href: "/billing",
    });
  }

  if (totalDocuments === 0) {
    insights.push({
      id: "empty-workspace",
      tone: "neutral",
      title: "Your workspace is ready for its first source",
      body: "Upload a document to start building a searchable, source-backed knowledge base.",
      action: "Upload a document",
      href: "/documents",
    });
  }

  return {
    totalDocuments,
    aiQueries,
    timeSavedMinutes: aiQueries * 5,
    recentDocuments,
    activity,
    insights,
    workspaceCount: memberships.length,
    primaryWorkspaceName: memberships[0]?.workspace.name ?? null,
  };
}

export function getDocumentStatusMeta(status: string) {
  const normalized = normalizeStatus(status);

  if (INDEXED_STATUSES.includes(normalized)) {
    return { tone: "success" as const, label: "Indexed" };
  }
  if (PROCESSING_STATUSES.includes(normalized)) {
    return { tone: "warning" as const, label: "Processing" };
  }
  if (FAILED_STATUSES.includes(normalized)) {
    return { tone: "danger" as const, label: "Needs attention" };
  }
  if (["CANCELLED", "CANCELED"].includes(normalized)) {
    return { tone: "neutral" as const, label: "Cancelled" };
  }

  return { tone: "neutral" as const, label: "Uploaded" };
}

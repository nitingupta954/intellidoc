"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  ChevronDown,
  Database,
  FolderOpen,
  Plus,
  SearchX,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { useWorkspaceStore } from "@/store/workspace-store";
import { formatRelative } from "@/lib/format";

type KnowledgeBase = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt?: string;
  _count?: { documents: number };
};

type SortValue = "updated-desc" | "name-asc" | "documents-desc";

export default function KnowledgeBasesPage() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortValue>("updated-desc");

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!activeWorkspaceId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetch(`/api/knowledge-bases?workspaceId=${activeWorkspaceId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.knowledgeBases) setKbs(data.knowledgeBases);
      })
      .catch(() => toast.error("Could not load collections."))
      .finally(() => setIsLoading(false));
  }, [activeWorkspaceId]);

  const handleCreate = async () => {
    if (!name.trim() || !activeWorkspaceId) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/knowledge-bases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          workspaceId: activeWorkspaceId,
        }),
      });
      if (!res.ok) throw new Error("Failed to create collection");

      const newKb = (await res.json()) as KnowledgeBase;
      setKbs((current) => [
        { ...newKb, _count: newKb._count ?? { documents: 0 } },
        ...current,
      ]);
      setIsOpen(false);
      setName("");
      setDescription("");
      toast.success("Collection created");
    } catch {
      toast.error("Could not create the collection.");
    } finally {
      setIsCreating(false);
    }
  };

  const visibleKbs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return kbs
      .filter(
        (kb) =>
          !query ||
          kb.name.toLowerCase().includes(query) ||
          (kb.description || "").toLowerCase().includes(query)
      )
      .sort((a, b) => {
        if (sort === "name-asc") return a.name.localeCompare(b.name);
        if (sort === "documents-desc") {
          return (b._count?.documents || 0) - (a._count?.documents || 0);
        }
        return (
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
        );
      });
  }, [kbs, search, sort]);

  return (
    <PageContainer className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Knowledge Bases"
        description="Organize documents into focused collections for grounded AI retrieval."
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={!activeWorkspaceId}>
                <Plus className="size-4" /> Create collection
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>New knowledge base</DialogTitle>
                <DialogDescription>
                  Group related documents together and chat against just that
                  collection.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Q3 financial reports"
                    autoFocus
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="What belongs in this collection?"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!name.trim() || isCreating}
                  loading={isCreating}
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="space-y-4 rounded-xl border border-border bg-card p-5"
            >
              <Skeleton className="size-10 rounded-xl" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <div className="flex justify-between pt-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : !activeWorkspaceId ? (
        <EmptyState
          icon={<Building2 aria-hidden="true" />}
          title="No workspace selected"
          description="Select or create a workspace before organizing documents into collections."
          action={
            <Button asChild>
              <Link href="/settings/team">Manage workspaces</Link>
            </Button>
          }
        />
      ) : kbs.length === 0 ? (
        <EmptyState
          icon={<Database aria-hidden="true" />}
          title="No knowledge bases yet"
          description="Create a collection to group related documents and give the assistant a focused source of truth."
          action={
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="size-4" /> Create your first collection
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
              value={search}
              onValueChange={setSearch}
              placeholder="Search collections"
              containerClassName="max-w-md"
              aria-label="Search collections"
            />
            <div className="relative w-fit">
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortValue)}
                aria-label="Sort collections"
                className="h-9 appearance-none rounded-lg border border-input bg-card pl-3 pr-8 text-sm text-foreground shadow-card outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <option value="updated-desc">Recently updated</option>
                <option value="name-asc">Name A–Z</option>
                <option value="documents-desc">Most documents</option>
              </select>
            </div>
          </div>

          {visibleKbs.length === 0 ? (
            <EmptyState
              icon={<SearchX aria-hidden="true" />}
              title="No matching collections"
              description="Try a different search term."
              action={
                <Button variant="outline" onClick={() => setSearch("")}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
              {visibleKbs.map((kb) => (
                <Link
                  key={kb.id}
                  href={`/knowledge-bases/${kb.id}`}
                  className="group flex min-h-[210px] flex-col rounded-xl border border-border bg-card p-5 shadow-card transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FolderOpen className="size-5" aria-hidden="true" />
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {kb._count?.documents || 0}{" "}
                      {kb._count?.documents === 1 ? "document" : "documents"}
                    </span>
                  </div>
                  <h2 className="mt-4 truncate font-heading text-base font-semibold text-foreground group-hover:text-primary">
                    {kb.name}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {kb.description || "No description"}
                  </p>
                  <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                    <span>
                      Updated {formatRelative(kb.updatedAt || kb.createdAt)}
                    </span>
                    <span className="text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Open
                    </span>
                  </div>
                </Link>
              ))}

              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex min-h-[210px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/40 p-5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-card hover:text-foreground"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Plus className="size-5" aria-hidden="true" />
                </span>
                Create collection
              </button>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}

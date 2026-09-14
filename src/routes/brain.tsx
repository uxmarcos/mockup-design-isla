import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronRight,
  FileText,
  Search,
  Plus,
  Brain as BrainIcon,
  MoreHorizontal,
  Check,
  Sliders,

} from "lucide-react";
import { Sidebar, useSidebarState } from "@/components/analytics/Sidebar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { DocEditor } from "@/components/brain/DocEditor";
import {
  IcpPanel,
  CompetitorsPanel,
  MonitoredProfilesPanel,
  BrandDnaPanel,
} from "@/components/brain/SetupPanels";
import {
  loadOnboarding,
  pendingBrainSubtasks,
  type BrainSubtaskKey,
} from "@/lib/onboarding-store";
import { cn } from "@/lib/utils";
import {
  loadBrain,
  saveBrain,
  createEmptyDoc,
  firstLineTitle,
  DEFAULT_BRAIN,
  ROOT_FOLDER_ID,
  type BrainFolder,
  type BrainDoc,
} from "@/lib/brain-store";

const SETUP_ITEMS: { key: BrainSubtaskKey; label: string }[] = [
  { key: "icp", label: "Ideal Customer Profile" },
  { key: "competitors", label: "Competitors" },
  { key: "influencers", label: "Monitored profiles" },
  { key: "brandDna", label: "Brand DNA" },
];


export const Route = createFileRoute("/brain")({
  validateSearch: (search: Record<string, unknown>) => ({
    setup: typeof search.setup === "string" ? (search.setup as BrainSubtaskKey) : undefined,
  }),

  head: () => ({
    meta: [
      { title: "Brain — Isla knowledge base" },
      {
        name: "description",
        content:
          "The living documentation that teaches Isla who you are, what your company sells and how your agents should think.",
      },
      { property: "og:title", content: "Brain — Isla knowledge base" },
      {
        property: "og:description",
        content:
          "A document-first knowledge base powering every piece of content and message Isla writes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BrainPage,
});

function BrainPage() {
  const [collapsed, setCollapsed] = useSidebarState();
  const [folders, setFolders] = useState<BrainFolder[]>(DEFAULT_BRAIN);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(DEFAULT_BRAIN.map((f) => [f.id, true])),
  );
  const [activeId, setActiveId] = useState("personal-brand");
  const [query, setQuery] = useState("");
  const [dragDocId, setDragDocId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [saved, setSaved] = useState(false);
  const [activeSetup, setActiveSetup] = useState<BrainSubtaskKey | null>(null);
  const [pendingSetup, setPendingSetup] = useState<BrainSubtaskKey[]>([]);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshMissions = () => setPendingSetup(pendingBrainSubtasks(loadOnboarding()));

  const { setup } = Route.useSearch();

  useEffect(() => {
    const loaded = loadBrain();
    setFolders(loaded);
    setOpenFolders(Object.fromEntries(loaded.map((f) => [f.id, true])));
    refreshMissions();
  }, []);

  // Deep link from the Home setup wizard, e.g. /brain?setup=brandDna
  useEffect(() => {
    if (setup && SETUP_ITEMS.some((i) => i.key === setup)) setActiveSetup(setup);
  }, [setup]);



  const commit = (next: BrainFolder[]) => {
    setFolders(next);
    saveBrain(next);
    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 1600);
  };

  const rootFolder = folders.find((f) => f.id === ROOT_FOLDER_ID);
  const namedFolders = folders.filter((f) => f.id !== ROOT_FOLDER_ID);

  const activeDoc: BrainDoc | undefined = useMemo(() => {
    for (const f of folders) {
      const d = f.docs.find((x) => x.id === activeId);
      if (d) return d;
    }
    return folders.find((f) => f.docs.length > 0)?.docs[0];
  }, [folders, activeId]);

  const activeFolder = useMemo(
    () => folders.find((f) => f.docs.some((d) => d.id === activeDoc?.id)),
    [folders, activeDoc],
  );

  const matches = (d: BrainDoc) =>
    !query.trim() ||
    (d.title || "Untitled").toLowerCase().includes(query.trim().toLowerCase());

  const totalDocs = folders.reduce((acc, f) => acc + f.docs.length, 0);

  /* ----- document mutations ----- */

  const updateDoc = (id: string, patch: Partial<BrainDoc>) =>
    commit(
      folders.map((f) => ({
        ...f,
        docs: f.docs.map((d) =>
          d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d,
        ),
      })),
    );

  const newDocument = () => {
    const d = createEmptyDoc();
    commit(
      folders.map((f) =>
        f.id === ROOT_FOLDER_ID ? { ...f, docs: [d, ...f.docs] } : f,
      ),
    );
    setActiveId(d.id);
  };

  const duplicateDoc = (id: string) => {
    const source = folders.flatMap((f) => f.docs).find((d) => d.id === id);
    if (!source) return;
    const copy: BrainDoc = {
      ...source,
      id: `doc-${Date.now()}`,
      title: source.title ? `${source.title} (copy)` : "",
    };
    commit(
      folders.map((f) =>
        f.docs.some((d) => d.id === id)
          ? {
              ...f,
              docs: f.docs.flatMap((d) => (d.id === id ? [d, copy] : [d])),
            }
          : f,
      ),
    );
    setActiveId(copy.id);
  };

  const moveDoc = (docId: string, targetFolderId: string) => {
    const source = folders.find((f) => f.docs.some((d) => d.id === docId));
    if (!source || source.id === targetFolderId) return;
    const theDoc = source.docs.find((d) => d.id === docId)!;
    commit(
      folders.map((f) => {
        if (f.id === source.id) return { ...f, docs: f.docs.filter((d) => d.id !== docId) };
        if (f.id === targetFolderId) return { ...f, docs: [theDoc, ...f.docs] };
        return f;
      }),
    );
    setOpenFolders((p) => ({ ...p, [targetFolderId]: true }));
  };

  const deleteDoc = (id: string) => {
    commit(folders.map((f) => ({ ...f, docs: f.docs.filter((d) => d.id !== id) })));
    if (activeId === id) {
      const remaining = folders.flatMap((f) => f.docs).filter((d) => d.id !== id);
      setActiveId(remaining[0]?.id ?? "");
    }
  };

  const onContentChange = (html: string) => {
    if (!activeDoc) return;
    const derived = firstLineTitle(html);
    updateDoc(activeDoc.id, {
      content: html,
      title: derived || activeDoc.title,
    });
  };

  /* ----- explorer row ----- */

  const DocRow = ({ d }: { d: BrainDoc }) => (
    <div
      draggable
      onDragStart={() => setDragDocId(d.id)}
      onDragEnd={() => {
        setDragDocId(null);
        setDropTarget(null);
      }}
      className={cn(
        "group flex w-full items-center gap-2 rounded-[6px] px-2 py-1.5 text-left text-[13px]",
        d.id === activeDoc?.id
          ? "bg-muted text-foreground font-medium"
          : "clickable-card-row text-muted-foreground",
        dragDocId === d.id && "opacity-40",
      )}
    >
      <FileText className="size-3.5 shrink-0 opacity-70" />
      {renamingId === d.id ? (
        <input
          autoFocus
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={() => {
            updateDoc(d.id, { title: renameValue.trim() || d.title });
            setRenamingId(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") setRenamingId(null);
          }}
          className="min-w-0 flex-1 rounded bg-background px-1 text-[13px] outline-none ring-1 ring-border"
        />
      ) : (
        <button
          onClick={() => {
            setActiveId(d.id);
            setActiveSetup(null);
          }}
          className="min-w-0 flex-1 truncate text-left"
        >

          {d.title || "Untitled"}
        </button>
      )}
      <DocActions
        doc={d}
        folders={namedFolders}
        onRename={() => {
          setRenameValue(d.title);
          setRenamingId(d.id);
        }}
        onDuplicate={() => duplicateDoc(d.id)}
        onMove={(fid) => moveDoc(d.id, fid)}
        onDelete={() => setDeleteId(d.id)}
        className="opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
      />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <div
        className={cn(
          "flex flex-1 min-w-0 transition-[margin] duration-200",
          collapsed ? "lg:ml-[72px]" : "lg:ml-[240px]",
        )}
      >
        {/* Column 2 — Explorer */}
        <aside className="hidden md:flex w-[264px] shrink-0 flex-col border-r border-border h-screen sticky top-0">
          <div className="flex items-center gap-2 h-[60px] px-4 border-b border-border">
            <BrainIcon className="size-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Brain</span>
            <span className="ml-auto text-[11px] text-muted-foreground">
              {totalDocs} docs
            </span>
          </div>

          <div className="p-3 border-b border-border space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search documents"
                className="h-8 pl-8 text-xs rounded-[6px]"
              />
            </div>
            <button
              onClick={newDocument}
              className="clickable-card-row flex w-full items-center gap-2 rounded-[6px] px-2 py-1.5 text-xs font-medium text-muted-foreground"
            >
              <Plus className="size-3.5" />
              New Document
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
            {/* Configuration */}
            <div className="space-y-0.5 pb-2">
              <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Configuration
              </p>
              {SETUP_ITEMS.map((item) => {
                const pending = pendingSetup.includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveSetup(item.key)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-[6px] px-2 py-1.5 text-left text-[13px]",
                      activeSetup === item.key
                        ? "bg-muted font-medium text-foreground"
                        : "clickable-card-row text-muted-foreground",
                    )}
                  >
                    <Sliders className="size-3.5 shrink-0 opacity-70" />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {pending && (
                      <span className="grid size-4 shrink-0 place-items-center rounded-full bg-red-500 text-[9px] font-semibold text-white">
                        1
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Root documents */}

            <div
              onDragOver={(e) => {
                if (!dragDocId) return;
                e.preventDefault();
                setDropTarget(ROOT_FOLDER_ID);
              }}
              onDragLeave={() => setDropTarget((t) => (t === ROOT_FOLDER_ID ? null : t))}
              onDrop={(e) => {
                e.preventDefault();
                if (dragDocId) moveDoc(dragDocId, ROOT_FOLDER_ID);
                setDropTarget(null);
                setDragDocId(null);
              }}
              className={cn(
                "space-y-0.5 rounded-[6px] pb-1",
                dropTarget === ROOT_FOLDER_ID && "ring-1 ring-border bg-muted/40",
                (rootFolder?.docs.length ?? 0) === 0 && dragDocId && "py-3",
              )}
            >
              {(rootFolder?.docs ?? []).filter(matches).map((d) => (
                <DocRow key={d.id} d={d} />
              ))}
              {(rootFolder?.docs.length ?? 0) === 0 && dragDocId && (
                <div className="px-2 text-[11px] text-muted-foreground">
                  Drop here to move to root
                </div>
              )}
            </div>

            {namedFolders.map((folder) => {
              const open = openFolders[folder.id] ?? true;
              const docs = folder.docs.filter(matches);
              if (query.trim() && docs.length === 0) return null;
              return (
                <div
                  key={folder.id}
                  onDragOver={(e) => {
                    if (!dragDocId) return;
                    e.preventDefault();
                    setDropTarget(folder.id);
                  }}
                  onDragLeave={() => setDropTarget((t) => (t === folder.id ? null : t))}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragDocId) moveDoc(dragDocId, folder.id);
                    setDropTarget(null);
                    setDragDocId(null);
                  }}
                  className={cn(
                    "rounded-[6px]",
                    dropTarget === folder.id && "ring-1 ring-border bg-muted/40",
                  )}
                >
                  <button
                    onClick={() => setOpenFolders((p) => ({ ...p, [folder.id]: !open }))}
                    className="clickable-card-row flex w-full items-center gap-1.5 rounded-[6px] px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    <ChevronRight
                      className={cn("size-3 transition-transform", open && "rotate-90")}
                    />
                    {folder.label}
                    <span className="ml-auto text-[10px] font-normal normal-case">
                      {folder.docs.length}
                    </span>
                  </button>

                  {open && (
                    <div className="mt-0.5 space-y-0.5 pl-2">
                      {docs.map((d) => (
                        <DocRow key={d.id} d={d} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Column 3 — Editor */}
        <main className="flex-1 min-w-0 h-screen overflow-y-auto">
          <div className="flex items-center justify-between h-[60px] px-8 border-b border-border">
            <div className="text-xs text-muted-foreground">
              Brain
              {activeSetup ? (
                <>
                  <span className="mx-1.5 opacity-50">/</span>
                  Configuration
                  <span className="mx-1.5 opacity-50">/</span>
                  <span className="text-foreground">
                    {SETUP_ITEMS.find((s) => s.key === activeSetup)?.label}
                  </span>
                </>
              ) : (
                <>
                  {activeFolder && activeFolder.id !== ROOT_FOLDER_ID && (
                    <>
                      <span className="mx-1.5 opacity-50">/</span>
                      {activeFolder.label}
                    </>
                  )}
                  <span className="mx-1.5 opacity-50">/</span>
                  <span className="text-foreground">{activeDoc?.title || "Untitled"}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              {saved && !activeSetup && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Check className="size-3.5" />
                  Saved
                </span>
              )}
              {activeDoc && !activeSetup && (
                <DocActions
                  doc={activeDoc}
                  folders={namedFolders}
                  onRename={() => {
                    setRenameValue(activeDoc.title);
                    setRenamingId(activeDoc.id);
                  }}
                  onDuplicate={() => duplicateDoc(activeDoc.id)}
                  onMove={(fid) => moveDoc(activeDoc.id, fid)}
                  onDelete={() => setDeleteId(activeDoc.id)}
                />
              )}
            </div>
          </div>

          {activeSetup === "icp" ? (
            <IcpPanel onDone={refreshMissions} />
          ) : activeSetup === "competitors" ? (
            <CompetitorsPanel onDone={refreshMissions} />
          ) : activeSetup === "influencers" ? (
            <MonitoredProfilesPanel onDone={refreshMissions} />
          ) : activeSetup === "brandDna" ? (
            <BrandDnaPanel
              onDone={refreshMissions}
              onOpenDoc={() => {
                setActiveSetup(null);
                setActiveId("personal-brand");
              }}
            />
          ) : activeDoc ? (

            <div className="mx-auto max-w-3xl px-8 py-16">
              <h1 className="text-3xl font-semibold tracking-tight">
                {activeDoc.title || (
                  <span className="text-muted-foreground/50">Untitled</span>
                )}
              </h1>
              {activeDoc.description && (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {activeDoc.description}
                </p>
              )}

              <div className="my-10 h-px bg-border" />

              <DocEditor
                docId={activeDoc.id}
                content={activeDoc.content}
                onChange={onContentChange}
              />
            </div>
          ) : (
            <div className="grid h-[60vh] place-items-center text-sm text-muted-foreground">
              <button
                onClick={newDocument}
                className="inline-flex items-center gap-2 rounded-[6px] border border-border px-3 py-2 hover:bg-muted/60"
              >
                <Plus className="size-4" /> New Document
              </button>
            </div>
          )}
        </main>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this document?</AlertDialogTitle>
            <AlertDialogDescription>
              Isla will stop using this document as context. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-500/90"
              onClick={() => {
                if (deleteId) deleteDoc(deleteId);
                setDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DocActions({
  doc,
  folders,
  onRename,
  onDuplicate,
  onMove,
  onDelete,
  className,
}: {
  doc: BrainDoc;
  folders: BrainFolder[];
  onRename: () => void;
  onDuplicate: () => void;
  onMove: (folderId: string) => void;
  onDelete: () => void;
  className?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Actions for ${doc.title || "Untitled"}`}
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-[6px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <MoreHorizontal className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={onRename}>Rename</DropdownMenuItem>
        <DropdownMenuItem onSelect={onDuplicate}>Duplicate</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onSelect={() => onMove(ROOT_FOLDER_ID)}>
              Brain root
            </DropdownMenuItem>
            {folders.map((f) => (
              <DropdownMenuItem key={f.id} onSelect={() => onMove(f.id)}>
                {f.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={onDelete}
          className="text-red-500 focus:text-red-500"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

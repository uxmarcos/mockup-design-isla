import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { Sidebar, useSidebarState } from "@/components/analytics/Sidebar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/create-content")({
  head: () => ({
    meta: [
      { title: "Create content — Isla" },
      { name: "description", content: "Create your first LinkedIn content." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CreateContentPage,
});

function CreateContentPage() {
  const [collapsed, setCollapsed] = useSidebarState();
  const navigate = useNavigate();

  return (
    <div className="dark flex min-h-screen bg-background text-foreground">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main
        className={cn(
          "flex-1 transition-[margin] duration-200",
          collapsed ? "lg:ml-[72px]" : "lg:ml-[240px]",
        )}
      >
        <div className="mx-auto max-w-2xl px-6 py-16">
          <BackButton
            onClick={() => navigate({ to: "/home" })}
            className="mb-8 -ml-3"
          >
            Back to home
          </BackButton>

          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="size-7" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Create your first content
            </h1>
            <p className="mt-3 max-w-md text-muted-foreground">
              This flow is coming soon. You'll be able to turn your ideas into
              LinkedIn posts here.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Sidebar, useSidebarState } from "@/components/analytics/Sidebar";
import { IdeaWishCard } from "@/components/content/IdeaWishCard";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/content")({
  head: () => ({
    meta: [
      { title: "Create Content — Isla" },
      {
        name: "description",
        content:
          "Two ways to start: let Isla suggest an idea, or jump straight into the editor with the idea you already have.",
      },
      { property: "og:title", content: "Create Content — Isla" },
      {
        property: "og:description",
        content:
          "Two ways to start: let Isla suggest an idea, or jump straight into the editor with the idea you already have.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContentHubPage,
});

function ContentHubPage() {
  const [collapsed, setCollapsed] = useSidebarState();
  const navigate = useNavigate();

  return (
    <div className="font-manrope flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main
        className={cn(
          "relative flex h-screen flex-1 items-center justify-center overflow-hidden bg-background px-6 transition-[margin] duration-200",
          collapsed ? "lg:ml-[72px]" : "lg:ml-[240px]",
        )}
      >
        <div className="flex w-full flex-col items-center">
          <h1 className="whitespace-nowrap text-center text-[clamp(20px,3.1vw,40px)] font-normal leading-[1.35] tracking-[-0.75px] text-foreground dark:text-[#F8F8F8]">
            How do you want to create your content?
          </h1>

          <div className="mt-10 flex flex-col items-center gap-4">
            {/* Primary — 3D post idea card */}
            <IdeaWishCard
              label="Discover new post ideas"
              onClick={() => navigate({ to: "/post-ideas", search: { from: "content" } })}
            />

            {/* Secondary — quiet */}
            <div
              role="button"
              tabIndex={0}
              aria-label="I already have an idea"
              onClick={() =>
                navigate({ to: "/post-ideas", search: { start: "scratch", from: "content" } })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate({ to: "/post-ideas", search: { start: "scratch", from: "content" } });
                }
              }}
              className="group flex w-[340px] cursor-pointer flex-col items-start justify-end gap-4 rounded-[24px] border border-[#2C2C2C] bg-[#1C1C1C] p-5 outline-none"
            >
              <div className="flex w-full items-center justify-between gap-3">
                <span className="text-[16px] text-white/70 transition-colors group-hover:text-white">
                  I already have an idea
                </span>
                <ChevronRight className="size-4 text-white/40 transition-colors group-hover:text-white" />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

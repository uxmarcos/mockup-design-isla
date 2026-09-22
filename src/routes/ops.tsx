import { Outlet, createFileRoute } from "@tanstack/react-router";
import { OperatorShell } from "@/components/operator/OperatorShell";

export const Route = createFileRoute("/ops")({
  head: () => ({
    meta: [
      { title: "Isla Ops" },
      { name: "description", content: "Customer success workspace for Isla operators." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OperatorLayout,
});

function OperatorLayout() {
  return (
    <OperatorShell>
      <Outlet />
    </OperatorShell>
  );
}

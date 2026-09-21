import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Scheduled content is managed in Calendar now — keep the old URL working.
 */
export const Route = createFileRoute("/schedule")({
  beforeLoad: () => {
    throw redirect({ to: "/calendar" });
  },
});

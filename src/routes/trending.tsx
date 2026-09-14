import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Trending Topics is no longer a destination — trending opportunities live
 * inside the Post Ideas feed, flagged with a "Trending" badge.
 */
export const Route = createFileRoute("/trending")({
  beforeLoad: () => {
    throw redirect({ to: "/post-ideas", search: { from: "content" } });
  },
});

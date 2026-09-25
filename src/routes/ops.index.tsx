import { createFileRoute, redirect } from "@tanstack/react-router";

/** Clients is the home screen of Isla Ops — no separate "Service Desk" landing page. */
export const Route = createFileRoute("/ops/")({
  beforeLoad: () => {
    throw redirect({ to: "/ops/clients" });
  },
});

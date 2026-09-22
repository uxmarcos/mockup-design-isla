import { createContext, useContext, type ComponentType, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

/** Loosely typed link/navigate so operator pages don't depend on generated route types. */
export const OLink = Link as unknown as ComponentType<{
  to: string;
  params?: Record<string, string>;
  search?: Record<string, string | undefined>;
  className?: string;
  title?: string;
  children?: ReactNode;
  onClick?: () => void;
}>;

export function useGo() {
  const navigate = useNavigate();
  return (to: string, opts?: { params?: Record<string, string>; search?: Record<string, string> }) =>
    (navigate as unknown as (o: unknown) => void)({ to, ...opts });
}

export type NewPostPreset = { seatId?: string; date?: Date };
export const NewPostContext = createContext<(preset?: NewPostPreset) => void>(() => {});
export const useNewPost = () => useContext(NewPostContext);

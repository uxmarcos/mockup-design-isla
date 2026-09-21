import { loadOnboarding, workspaceSlug } from "@/lib/onboarding-store";

export const DEFAULT_WORKSPACE_NAME = "Nortex";
export const DEFAULT_WORKSPACE_LOGO = "/nortex-logo.png";
export const WORKSPACE_EVENT = "isla:workspace-change";

const KEY = "isla.workspace.edit.v1";

type WorkspaceEdit = { name?: string; logo?: string };

export type WorkspaceView = {
  name: string;
  /** undefined means "show the name's initial instead of an image" */
  logo?: string;
  /** Fixed at creation — editing the name never changes it. */
  slug: string;
};

function loadEdit(): WorkspaceEdit {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as WorkspaceEdit) : {};
  } catch {
    return {};
  }
}

export function resolveWorkspace(): WorkspaceView {
  const created = loadOnboarding().workspace;
  const edit = loadEdit();
  return {
    name: edit.name ?? created?.name ?? DEFAULT_WORKSPACE_NAME,
    logo: edit.logo ?? created?.logo ?? (created ? undefined : DEFAULT_WORKSPACE_LOGO),
    slug: created ? workspaceSlug(created.name) : workspaceSlug(DEFAULT_WORKSPACE_NAME),
  };
}

export function saveWorkspaceEdit(next: { name: string; logo?: string }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify({ name: next.name, logo: next.logo }));
  window.dispatchEvent(new Event(WORKSPACE_EVENT));
}

const LOGO_SIZE = 256;
export const MAX_LOGO_BYTES = 5 * 1024 * 1024;

/** Center-crops the image to a square and downsizes it so it stays small in localStorage. */
export function fileToLogoDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read the image."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Couldn't read the image."));
      img.onload = () => {
        const side = Math.min(img.width, img.height);
        const canvas = document.createElement("canvas");
        canvas.width = LOGO_SIZE;
        canvas.height = LOGO_SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Couldn't process the image."));
        ctx.drawImage(
          img,
          (img.width - side) / 2,
          (img.height - side) / 2,
          side,
          side,
          0,
          0,
          LOGO_SIZE,
          LOGO_SIZE,
        );
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

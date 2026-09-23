import { useCallback, useEffect, useState } from "react";
import { startOfWeek, type Operator } from "@/lib/operator-data";
import { useOperatorWorkspace } from "@/lib/operator-store";

/**
 * Experimental "service desk" scheme for the Operator Panel: the operator attends one client
 * at a time, works through that client's task list while a timer runs, and the time spent
 * rolls up into a weekly report. Kept in its own store so it stays independent of the
 * always-on dashboard the rest of Isla Ops uses.
 */

const EVENT = "isla:service-desk-change";
const TASKS_KEY = "isla.ops.tasks.v2";
const SESSIONS_KEY = "isla.ops.sessions.v2";
const IMAGES_KEY = "isla.ops.images.v2";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(EVENT));
}

function useStored<T>(key: string, fallback: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    const sync = () => setValue(readJson(key, fallback));
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return [value, (v) => writeJson(key, v)];
}

/* ---------------------------------- types ---------------------------------- */

export type TaskType =
  | "personal_post"
  | "institutional_post"
  | "approval_request"
  | "monthly_call"
  | "feedback_request"
  | "photo_request"
  | "custom";

export const TASK_TYPE_LABEL: Record<TaskType, string> = {
  personal_post: "Personal post",
  institutional_post: "Institutional post",
  approval_request: "Approval request",
  monthly_call: "Monthly call",
  feedback_request: "Feedback request",
  photo_request: "Photo request",
  custom: "Task",
};

export type ClientTask = {
  id: string;
  workspaceId: string;
  /** Set when the task is about one person's profile (e.g. a personal post); omitted for company-page tasks. */
  seatId?: string;
  type: TaskType;
  title: string;
  done: boolean;
  createdAt: string;
  doneAt?: string;
};

export type ServiceSession = {
  id: string;
  workspaceId: string;
  operatorId: string;
  startedAt: string;
  endedAt?: string;
};

export type BankImage = {
  id: string;
  workspaceId: string;
  url: string;
  uploadedAt: string;
  used: boolean;
};

/* ---------------------------------- seed ---------------------------------- */

const uid = (p: string) => `${p}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
const daysAgo = (d: number, hour = 10) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  dt.setHours(hour, 0, 0, 0);
  return dt;
};

function task(workspaceId: string, type: TaskType, title: string, over: Partial<ClientTask> = {}): ClientTask {
  return {
    id: uid(`task-${workspaceId}`),
    workspaceId,
    type,
    title,
    done: false,
    createdAt: hoursAgo(20),
    ...over,
  };
}

function seedTasks(): ClientTask[] {
  return [
    task("nortex", "personal_post", "Write Chris's personal post about this week's learning", { seatId: "nortex-chris" }),
    task("nortex", "approval_request", "Ask Ana to approve the team-culture draft", { seatId: "nortex-ana" }),
    task("nortex", "institutional_post", "Write an institutional post for the Nortex page"),
    task("nortex", "monthly_call", "Log this month's content alignment call"),
    task("nortex", "feedback_request", "Ask Chris for feedback on the last published posts", { seatId: "nortex-chris" }),
    task("nortex", "photo_request", "Ask for team photos for the next page post", { done: true, doneAt: hoursAgo(30) }),

    task("lumen", "personal_post", "Write Mariana's personal post about this week's learning", { seatId: "lumen" }),
    task("lumen", "approval_request", "Ask Tiago to approve his draft", { seatId: "lumen-tiago" }),
    task("lumen", "feedback_request", "Ask Mariana for feedback on the last published posts", { seatId: "lumen" }),

    task("brightpath", "approval_request", "Follow up on Rafael's change request", { seatId: "brightpath" }),
    task("brightpath", "institutional_post", "Write an institutional post for the Brightpath page"),

    task("vantage", "monthly_call", "Log this month's content alignment call"),
    task("vantage", "photo_request", "Ask for team photos for the next page post", { seatId: "vantage" }),
  ];
}

function seedSessions(): ServiceSession[] {
  const mk = (workspaceId: string, daysBack: number, hour: number, minutes: number): ServiceSession => {
    const start = daysAgo(daysBack, hour);
    const end = new Date(start.getTime() + minutes * 60_000);
    return { id: uid(`sess-${workspaceId}`), workspaceId, operatorId: "op-laura", startedAt: start.toISOString(), endedAt: end.toISOString() };
  };
  return [
    mk("nortex", 1, 9, 32),
    mk("lumen", 1, 10, 18),
    mk("nortex", 2, 9, 41),
    mk("brightpath", 2, 14, 12),
    mk("vantage", 3, 11, 27),
    mk("lumen", 3, 15, 22),
    mk("nortex", 4, 9, 29),
    mk("kestrel", 4, 13, 15),
  ];
}

function seedImages(): BankImage[] {
  const img = (id: string) => `https://images.unsplash.com/${id}?w=800&q=80`;
  return [
    { id: uid("img"), workspaceId: "nortex", url: img("photo-1522071820081-009f0129c71c"), uploadedAt: hoursAgo(60), used: true },
    { id: uid("img"), workspaceId: "nortex", url: img("photo-1552664730-d307ca884978"), uploadedAt: hoursAgo(30), used: false },
    { id: uid("img"), workspaceId: "lumen", url: img("photo-1504384308090-c894fdcc538d"), uploadedAt: hoursAgo(80), used: false },
  ];
}

function loadTasks(): ClientTask[] {
  const raw = localStorage.getItem(TASKS_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as ClientTask[];
    } catch {
      /* fall through */
    }
  }
  const seeded = seedTasks();
  localStorage.setItem(TASKS_KEY, JSON.stringify(seeded));
  return seeded;
}

function loadSessions(): ServiceSession[] {
  const raw = localStorage.getItem(SESSIONS_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as ServiceSession[];
    } catch {
      /* fall through */
    }
  }
  const seeded = seedSessions();
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(seeded));
  return seeded;
}

function loadImages(): BankImage[] {
  const raw = localStorage.getItem(IMAGES_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as BankImage[];
    } catch {
      /* fall through */
    }
  }
  const seeded = seedImages();
  localStorage.setItem(IMAGES_KEY, JSON.stringify(seeded));
  return seeded;
}

function useTasks() {
  const [tasks, setTasks] = useStored<ClientTask[]>(TASKS_KEY, []);
  useEffect(() => {
    setTasks(loadTasks());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [tasks, setTasks] as const;
}

function useSessions() {
  const [sessions, setSessions] = useStored<ServiceSession[]>(SESSIONS_KEY, []);
  useEffect(() => {
    setSessions(loadSessions());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [sessions, setSessions] as const;
}

function useImages() {
  const [images, setImages] = useStored<BankImage[]>(IMAGES_KEY, []);
  useEffect(() => {
    setImages(loadImages());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [images, setImages] as const;
}

/* ---------------------------------- hook ---------------------------------- */

export function useServiceDesk() {
  const ws = useOperatorWorkspace();
  const [tasks, setTasks] = useTasks();
  const [sessions, setSessions] = useSessions();
  const [images, setImages] = useImages();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const workspaceIds = new Set(ws.workspaces.map((w) => w.id));
  const myTasks = tasks.filter((t) => workspaceIds.has(t.workspaceId));
  const mySessions = sessions.filter((s) => s.operatorId === ws.operator.id && workspaceIds.has(s.workspaceId));
  const myImages = images.filter((i) => workspaceIds.has(i.workspaceId));

  const activeSession = mySessions.find((s) => !s.endedAt) ?? null;

  const tasksFor = useCallback((workspaceId: string) => myTasks.filter((t) => t.workspaceId === workspaceId), [myTasks]);
  const openTaskCount = useCallback((workspaceId: string) => tasksFor(workspaceId).filter((t) => !t.done).length, [tasksFor]);
  const imagesFor = useCallback((workspaceId: string) => myImages.filter((i) => i.workspaceId === workspaceId), [myImages]);

  const startSession = useCallback(
    (workspaceId: string) => {
      const nowIso = new Date().toISOString();
      const closed = sessions.map((s) => (s.operatorId === ws.operator.id && !s.endedAt ? { ...s, endedAt: nowIso } : s));
      const session: ServiceSession = { id: uid("sess"), workspaceId, operatorId: ws.operator.id, startedAt: nowIso };
      setSessions([session, ...closed]);
      return session.id;
    },
    [sessions, setSessions, ws.operator.id],
  );

  const endSession = useCallback(
    (sessionId: string) => {
      const nowIso = new Date().toISOString();
      setSessions(sessions.map((s) => (s.id === sessionId ? { ...s, endedAt: nowIso } : s)));
    },
    [sessions, setSessions],
  );

  const toggleTask = useCallback(
    (id: string) => {
      const nowIso = new Date().toISOString();
      setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done, doneAt: !t.done ? nowIso : undefined } : t)));
    },
    [tasks, setTasks],
  );

  const addTask = useCallback(
    (workspaceId: string, input: { type: TaskType; title: string; seatId?: string }) => {
      setTasks([...tasks, task(workspaceId, input.type, input.title, { seatId: input.seatId })]);
    },
    [tasks, setTasks],
  );

  const removeTask = useCallback((id: string) => setTasks(tasks.filter((t) => t.id !== id)), [tasks, setTasks]);

  const addImage = useCallback(
    (workspaceId: string, url: string) => {
      const image: BankImage = { id: uid("img"), workspaceId, url, uploadedAt: new Date().toISOString(), used: false };
      setImages([image, ...images]);
    },
    [images, setImages],
  );

  const toggleImageUsed = useCallback(
    (id: string) => setImages(images.map((i) => (i.id === id ? { ...i, used: !i.used } : i))),
    [images, setImages],
  );

  const removeImage = useCallback((id: string) => setImages(images.filter((i) => i.id !== id)), [images, setImages]);

  /** Minutes spent per workspace so far this week (Monday through now). */
  const weeklyMinutesByWorkspace = useCallback(() => {
    const weekStart = startOfWeek(now);
    const totals = new Map<string, number>();
    for (const s of mySessions) {
      const start = new Date(s.startedAt);
      if (start < weekStart) continue;
      const end = s.endedAt ? new Date(s.endedAt) : now;
      const minutes = Math.max(0, (end.getTime() - start.getTime()) / 60_000);
      totals.set(s.workspaceId, (totals.get(s.workspaceId) ?? 0) + minutes);
    }
    return totals;
  }, [mySessions, now]);

  return {
    now,
    operator: ws.operator as Operator,
    workspaces: ws.workspaces,
    seats: ws.seats,
    getSeat: ws.getSeat,
    posts: ws.posts,
    tasks: myTasks,
    tasksFor,
    openTaskCount,
    toggleTask,
    addTask,
    removeTask,
    sessions: mySessions,
    activeSession,
    startSession,
    endSession,
    images: myImages,
    imagesFor,
    addImage,
    toggleImageUsed,
    removeImage,
    weeklyMinutesByWorkspace,
  };
}

/** Live, ticking timer display: M:SS, or H:MM:SS past an hour. */
export function formatTimer(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const sec = totalSeconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/** Rounded summary for reports: "1h 25m" or "42m". */
export function formatMinutes(totalMinutes: number) {
  const rounded = Math.round(totalMinutes);
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

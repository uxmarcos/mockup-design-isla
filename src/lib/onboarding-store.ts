// Prototype-only client store for the guided onboarding + home flow.
// Persists to localStorage so refresh resumes the flow.

export type OnboardingState =
  | "waiting_linkedin"
  | "scraping"
  | "waiting_website"
  | "analyzing_website"
  | "collecting_icp"
  | "creating_workspace"
  | "importing_connections"
  | "processing"
  | "finished";

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  variant?:
    | "text"
    | "linkedin-input"
    | "website-input"
    | "website-analysis"
    | "icp-picker"
    | "workspace-setup"
    | "connections-upload"
    | "processing"
    | "done";
};

export type IcpProfile = {
  companyDescription?: string;
  industries: string[];
  locations: string[];
  personas: string[];
  companySizes: string[];
};


export type TaskType =
  | "view_crm"
  | "import_connections"
  | "connect_linkedin"
  | "settings"
  | "first_post"
  // legacy types (still accepted for backward compatibility)
  | "approve_outreach"
  | "follow_up"
  | "comment_posts"
  | "generate_content"
  | "review_content";

export type HomeTask = {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  destination: string;
  type: TaskType;
  count?: number;
  status: "pending" | "in_progress" | "completed";
  priority: number;
  createdAt: number;
  completedAt?: number;
};

export type WorkspaceProfile = {
  name: string;
  /** data URL of the square logo, when the user uploaded one */
  logo?: string;
  createdAt?: number;
};

export type OnboardingData = {
  state: OnboardingState;
  linkedinUrl?: string;
  websiteUrl?: string;
  websiteSkipped?: boolean;
  icp: string[];
  icpProfile?: IcpProfile;
  workspace?: WorkspaceProfile;
  messages: ChatMessage[];
  completedAt?: number;
  tasks: HomeTask[];
  homeVisited?: boolean;
  crmVisited?: boolean;
  linkedinConnected?: boolean;
  connectionsUploaded?: boolean;
  onboardingCelebrated?: boolean;
  settingsSubtasks?: {
    competitors: boolean;
    influencers: boolean;
    brandDna: boolean;
    icp?: boolean;
  };
};

/** Tasks that gate the guided setup, in unlock order. */
export const CORE_TASK_IDS = [
  "task-view-crm",
  "task-connect-linkedin",
  "task-import-connections",
] as const;

/** True once the three gating setup steps are done. */
export function isCoreSetupComplete(data: OnboardingData): boolean {
  return CORE_TASK_IDS.every((id) =>
    data.tasks.some((t) => t.id === id && t.status === "completed"),
  );
}

/**
 * Sequential gating: a task is unlocked only when every task before it
 * (by priority) is completed.
 */
export function isTaskUnlocked(tasks: HomeTask[], id: string): boolean {
  const ordered = tasks.slice().sort((a, b) => a.priority - b.priority);
  const index = ordered.findIndex((t) => t.id === id);
  if (index <= 0) return true;
  return ordered.slice(0, index).every((t) => t.status === "completed");
}

export const SETTINGS_SUBTASKS_DEFAULT = {
  competitors: false,
  influencers: false,
  brandDna: false,
  icp: false,
};

export type BrainSubtaskKey = keyof typeof SETTINGS_SUBTASKS_DEFAULT;

export const BRAIN_SUBTASK_KEYS: BrainSubtaskKey[] = [
  "icp",
  "competitors",
  "influencers",
  "brandDna",
];

export function getBrainSubtasks(data: OnboardingData) {
  return { ...SETTINGS_SUBTASKS_DEFAULT, ...(data.settingsSubtasks ?? {}) };
}

/** Missions that are highlighted and actionable right now (locked ones don't count). */
export function pendingMissionCount(data: OnboardingData): number {
  return data.tasks.filter(
    (t) => t.status !== "completed" && isTaskUnlocked(data.tasks, t.id),
  ).length;
}

/** Overall setup progress: completed missions out of the total. */
export function missionProgress(data: OnboardingData): { done: number; total: number } {
  const total = data.tasks.length || makeInitialTasks().length;
  const done = data.tasks.filter((t) => t.status === "completed").length;
  return { done, total };
}

/** True once every mission (including the workspace setup) is completed. */
export function areAllMissionsComplete(data: OnboardingData): boolean {
  const { done, total } = missionProgress(data);
  return total > 0 && done === total;
}

/** True once the workspace setup mission (competitors → profiles → Brand DNA) is done. */
export function isWorkspaceSetupComplete(data: OnboardingData): boolean {
  return data.tasks.some((t) => t.id === "task-settings" && t.status === "completed");
}


/** Brain items still waiting for attention, only while the setup mission is available. */
export function pendingBrainSubtasks(data: OnboardingData): BrainSubtaskKey[] {
  const task = data.tasks.find((t) => t.id === "task-settings");
  if (!task || task.status === "completed") return [];
  if (!isTaskUnlocked(data.tasks, "task-settings")) return [];
  const subs = getBrainSubtasks(data);
  return BRAIN_SUBTASK_KEYS.filter((k) => !subs[k]);
}

/** Marks one Brain item as done and syncs the workspace setup mission. */
export function setBrainSubtask(key: BrainSubtaskKey, value: boolean): OnboardingData {
  const loaded = loadOnboarding();
  const subs = { ...getBrainSubtasks(loaded), [key]: value };
  const allDone = BRAIN_SUBTASK_KEYS.every((k) => subs[k]);
  const next: OnboardingData = {
    ...loaded,
    settingsSubtasks: subs,
    tasks: loaded.tasks.map((t) =>
      t.id === "task-settings"
        ? {
            ...t,
            status: allDone ? ("completed" as const) : ("in_progress" as const),
            completedAt: allDone ? Date.now() : undefined,
          }
        : t,
    ),
  };
  saveOnboarding(next);
  return next;
}

/**
 * Completes the workspace setup mission. Only called when the user finishes the
 * last setup step (viewing the Brand DNA).
 */
export function completeSetupMission(): OnboardingData {
  const loaded = loadOnboarding();
  const next: OnboardingData = {
    ...loaded,
    settingsSubtasks: { ...getBrainSubtasks(loaded), brandDna: true },
    tasks: loaded.tasks.map((t) =>
      t.id === "task-settings"
        ? { ...t, status: "completed" as const, completedAt: Date.now() }
        : t,
    ),
  };
  saveOnboarding(next);
  return next;
}




const KEY = "isla.onboarding.v1";
const USER_KEY = "isla.user.v1";

export type UserProfile = {
  onboardingCompleted: boolean;
  displayName: string;
};

export const ICP_OPTIONS = [
  "Founders",
  "CEOs",
  "C-Level",
  "Directors",
  "Heads",
  "Managers",
  "Investors",
  "Engineers",
  "Product Managers",
  "Designers",
  "Marketing",
  "Sales",
  "HR",
  "Recruiters",
  "Operations",
  "Customer Success",
  "Finance",
  "Legal",
  "Consultants",
  "Agencies",
  "Other",
] as const;

export const PROCESSING_STEPS = [
  "Scanning your latest LinkedIn posts...",
  "Understanding your audience...",
  "Analyzing people who engaged with your content...",
  "Matching engagement against your ICP...",
  "Finding potential opportunities...",
  "Building your Lead Board...",
  "Organizing leads...",
  "Creating your workspace...",
  "Preparing today's tasks...",
  "Almost done...",
];

export const LINKEDIN_URL_REGEX =
  /^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9\-_%]+\/?$/i;

export const WEBSITE_URL_REGEX =
  /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i;

export const WEBSITE_ANALYSIS_STEPS = [
  "Reading your company description",
  "Mapping target industries",
  "Identifying buyer personas",
  "Estimating target company size",
  "Detecting geography",
] as const;

export const ICP_INDUSTRY_OPTIONS = [
  "Accounting",
  "Airlines / Aviation",
  "Alternative Dispute Resolution",
  "Alternative Medicine",
  "Animation",
  "Apparel & Fashion",
  "Architecture & Planning",
  "Arts & Crafts",
  "Automotive",
  "Aviation & Aerospace",
  "Banking",
  "Biotechnology",
  "Broadcast Media",
  "Building Materials",
  "Business Supplies & Equipment",
  "Capital Markets",
  "Chemicals",
  "Civic & Social Organization",
  "Civil Engineering",
  "Commercial Real Estate",
  "Computer & Network Security",
  "Computer Games",
  "Computer Hardware",
  "Computer Networking",
  "Computer Software",
  "Construction",
  "Consumer Electronics",
  "Consumer Goods",
  "Consumer Services",
  "Cosmetics",
  "Dairy",
  "Defense & Space",
  "Design",
  "E-commerce & Retail",
  "Education Management",
  "Electrical & Electronic Manufacturing",
  "Entertainment",
  "Environmental Services",
  "Events Services",
  "Executive Office",
  "Facilities Services",
  "Farming",
  "Financial Services",
  "Fine Art",
  "Fishery",
  "Food & Beverages",
  "Food Production",
  "Fundraising",
  "Furniture",
  "Gambling & Casinos",
  "Glass, Ceramics & Concrete",
  "Government Administration",
  "Government Relations",
  "Graphic Design",
  "Health, Wellness & Fitness",
  "Healthcare",
  "Higher Education",
  "Hospital & Health Care",
  "Hospitality",
  "Human Resources",
  "Import & Export",
  "Individual & Family Services",
  "Industrial Automation",
  "Information Services",
  "Information Technology & Services",
  "Insurance",
  "International Affairs",
  "International Trade & Development",
  "Internet",
  "Investment Banking",
  "Investment Management",
  "IT Services and IT Consulting",
  "Judiciary",
  "Law Enforcement",
  "Law Practice",
  "Legal Services",
  "Legislative Office",
  "Leisure, Travel & Tourism",
  "Libraries",
  "Logistics & Supply Chain",
  "Luxury Goods & Jewelry",
  "Machinery",
  "Management Consulting",
  "Manufacturing",
  "Maritime",
  "Market Research",
  "Marketing & Advertising",
  "Mechanical or Industrial Engineering",
  "Media Production",
  "Medical Devices",
  "Medical Practice",
  "Mental Health Care",
  "Military",
  "Mining & Metals",
  "Motion Pictures & Film",
  "Museums & Institutions",
  "Music",
  "Nanotechnology",
  "Newspapers",
  "Non-Profit Organization Management",
  "Oil & Energy",
  "Online Media",
  "Outsourcing / Offshoring",
  "Package / Freight Delivery",
  "Packaging & Containers",
  "Paper & Forest Products",
  "Performing Arts",
  "Pharmaceuticals",
  "Philanthropy",
  "Photography",
  "Plastics",
  "Political Organization",
  "Primary / Secondary Education",
  "Printing",
  "Professional Training & Coaching",
  "Program Development",
  "Public Policy",
  "Public Relations & Communications",
  "Public Safety",
  "Publishing",
  "Railroad Manufacture",
  "Ranching",
  "Real Estate",
  "Recreational Facilities & Services",
  "Religious Institutions",
  "Renewables & Environment",
  "Research",
  "Restaurants",
  "Retail",
  "Security & Investigations",
  "Semiconductors",
  "Shipbuilding",
  "Software Development & SaaS",
  "Sporting Goods",
  "Sports",
  "Staffing & Recruiting",
  "Supermarkets",
  "Telecommunications",
  "Textiles",
  "Think Tanks",
  "Tobacco",
  "Translation & Localization",
  "Transportation / Trucking / Railroad",
  "Utilities",
  "Venture Capital & Private Equity",
  "Veterinary",
  "Warehousing",
  "Wholesale",
  "Wine & Spirits",
  "Wireless",
  "Writing & Editing",
];

export const ICP_LOCATION_OPTIONS = [
  "North America",
  "Europe",
  "LATAM",
  "APAC",
  "Middle East",
  "United States",
  "Canada",
  "Mexico",
  "Brazil",
  "Argentina",
  "Chile",
  "Colombia",
  "United Kingdom",
  "Ireland",
  "Portugal",
  "Spain",
  "France",
  "Germany",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Austria",
  "Italy",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Poland",
  "Czech Republic",
  "Romania",
  "Turkey",
  "Israel",
  "United Arab Emirates",
  "Saudi Arabia",
  "South Africa",
  "Nigeria",
  "Kenya",
  "India",
  "Singapore",
  "Japan",
  "South Korea",
  "Australia",
  "New Zealand",
];



export const ICP_PERSONA_OPTIONS = [
  "Founders",
  "CEOs",
  "C-Level",
  "VPs",
  "Directors",
  "Heads of Growth",
  "Heads of Marketing",
  "Heads of Sales",
  "Product Managers",
  "Engineering Managers",
  "Investors",
  "Consultants",
];

export const ICP_COMPANY_SIZE_OPTIONS = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1,000",
  "1,001-5,000",
  "5,001-10,000",
  "10,000+",
];

export type PreIcpSuggestion = {
  companyDescription: string;
  industries: string[];
  locations: string[];
  personas: string[];
  companySizes: string[];
};

export function suggestPreIcp(websiteUrl?: string): PreIcpSuggestion {
  const host = websiteUrl?.replace(/^https?:\/\//, "").split("/")[0] ?? "your company";
  return {
    companyDescription: `${host} — B2B platform helping teams accelerate go-to-market with data-driven workflows.`,
    industries: [
      "Software Development & SaaS",
      "IT Services and IT Consulting",
      "Marketing",
      "Staffing and Recruiting",
    ],
    locations: ["North America", "United Kingdom", "Brazil"],
    personas: ["Founders", "CEOs", "Heads of Growth", "Heads of Marketing"],
    companySizes: ["11-50", "51-200", "201-500"],
  };
}



const defaultState = (): OnboardingData => ({
  state: "waiting_linkedin",
  icp: [],
  messages: [],
  tasks: [],
});

export function loadOnboarding(): OnboardingData {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...(JSON.parse(raw) as OnboardingData) };
  } catch {
    return defaultState();
  }
}

export function saveOnboarding(data: OnboardingData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function resetOnboarding() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({ onboardingCompleted: false, displayName: "there" } satisfies UserProfile),
  );
}

export function loadUser(): UserProfile {
  if (typeof window === "undefined")
    return { onboardingCompleted: false, displayName: "there" };
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return { onboardingCompleted: false, displayName: "there" };
    return JSON.parse(raw) as UserProfile;
  } catch {
    return { onboardingCompleted: false, displayName: "there" };
  }
}

export function saveUser(u: UserProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(u));
}

export function makeInitialTasks(): HomeTask[] {
  const now = Date.now();
  return [
    {
      id: "task-view-crm",
      type: "view_crm",
      title: "Check your Lead Board",
      description: "See the leads Isla found for you during onboarding.",
      ctaLabel: "Open Lead Board",
      destination: "/kanban",
      status: "pending",
      priority: 1,
      createdAt: now,
    },
    {
      id: "task-connect-linkedin",
      type: "connect_linkedin",
      title: "Connect your LinkedIn",
      description: "Connect your account to engage with leads and track replies.",
      ctaLabel: "Connect",
      destination: "linkedin-connect",
      status: "pending",
      priority: 2,
      createdAt: now,
    },
    {
      id: "task-import-connections",
      type: "import_connections",
      title: "Upload your LinkedIn connections",
      description:
        "Connecting LinkedIn does not give Isla access to your network — only this export does. Upload it so we can match your connections against your ICP.",
      ctaLabel: "Prepare connections",
      destination: "csv-upload",
      status: "pending",
      priority: 3,
      createdAt: now,
    },
    {
      id: "task-settings",
      type: "settings",
      title: "Finish your workspace setup",
      description:
        "Add competitors, profiles to monitor and review your Brand DNA — all in one place.",
      ctaLabel: "Complete setup",
      destination: "settings-dialog",
      status: "pending",
      priority: 4,
      createdAt: now,
    },

    {
      id: "task-first-post",
      type: "first_post",
      title: "Create your first post",
      description: "Check ideas and start the first LinkedIn post.",
      ctaLabel: "Create First Content",
      destination: "first-post-dialog",
      status: "pending",
      priority: 5,
      createdAt: now,
    },
  ];
}

/** URL-friendly handle shown under the workspace name. */
export function workspaceSlug(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "workspace";
}

/** The workspace created during onboarding, if any. */
export function loadWorkspace(): WorkspaceProfile | undefined {
  return loadOnboarding().workspace;
}

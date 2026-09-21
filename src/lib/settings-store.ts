import { CURRENT_USER } from "@/lib/current-user";
// Prototype-only client store for the Settings page.
// Persists to localStorage so refresh resumes state.

export type WorkspaceMember = {
  id: string;
  name: string;
  email: string;
  linkedinConnected: boolean;
  brandDna: boolean;
  role: "super-admin" | "admin" | "member";
  isYou?: boolean;
};

export type MonitoredProfile = {
  id: string;
  name: string;
  handle: string; // linkedin handle or URL
  avatarUrl?: string;
};

export type SettingsData = {
  language: "en" | "pt";
  icpDescription: string;
  icpIndustries: string[];
  icpLocations: string[];
  icpPersonas: string[];
  icpSeniorities: string[];
  icpCompanySizes: string[];
  icpCompanySizeMin: number;
  icpCompanySizeMax: number;
  icpFitInclude: string;
  icpFitExclude: string;
  competitors: MonitoredProfile[]; // Accounts to Monitor
  influencers: MonitoredProfile[]; // Monitored Profiles
  timezone: string;
  dailyConnectionLimit: number;
  members: WorkspaceMember[];
};

const KEY = "isla.settings.v1";

const defaultState = (): SettingsData => ({
  language: "en",
  icpDescription:
    "B2B SaaS and tech companies scaling go-to-market, where leadership is active on LinkedIn.",
  icpIndustries: ["Computer Software", "Information Technology & Services"],
  icpLocations: ["United States", "Brazil"],
  icpPersonas: ["Founders", "Heads of Growth", "Heads of Marketing", "Heads of Sales"],
  icpSeniorities: ["Founder", "C-Level", "VP", "Director", "Head"],
  icpCompanySizes: ["51-200"],
  icpCompanySizeMin: 10,
  icpCompanySizeMax: 200,
  icpFitInclude:
    "headline mentions founder, engineering, software, architecture, tech lead, sales, growth, outbound, revenue, pipeline",
  icpFitExclude: "role is purely technical without leadership; seniority is Junior, Intern",
  competitors: [],
  influencers: [],
  timezone: "America/Sao_Paulo",
  dailyConnectionLimit: 14,
  members: [
    {
      id: "m-you",
      name: CURRENT_USER.name,
      email: CURRENT_USER.email,
      linkedinConnected: true,
      brandDna: true,
      role: "super-admin",
      isYou: true,
    },
    {
      id: "m-1",
      name: "Maycow Jordny",
      email: "maycow@isla.to",
      linkedinConnected: true,
      brandDna: true,
      role: "super-admin",
    },
    {
      id: "m-2",
      name: "Joao",
      email: "joao@isla.to",
      linkedinConnected: true,
      brandDna: true,
      role: "super-admin",
    },
    {
      id: "m-3",
      name: "Marcos Pessoal",
      email: "marcoshollmann0@gmail.com",
      linkedinConnected: true,
      brandDna: true,
      role: "member",
    },
    {
      id: "m-4",
      name: "Eduardo",
      email: "eduardo@tailbox.com",
      linkedinConnected: true,
      brandDna: true,
      role: "super-admin",
    },
    {
      id: "m-5",
      name: "Leonardo Arazo",
      email: "leonardo@isla.to",
      linkedinConnected: true,
      brandDna: true,
      role: "super-admin",
    },
  ],
});

export function loadSettings(): SettingsData {
  if (typeof window === "undefined") return defaultState();
  try {
    const base = defaultState();
    const raw = localStorage.getItem(KEY);
    const stored = raw ? (JSON.parse(raw) as Partial<SettingsData>) : {};
    const merged = { ...base, ...stored } as SettingsData;
    // Hydrate ICP from onboarding profile if user hasn't customized settings yet.
    try {
      const onbRaw = localStorage.getItem("isla.onboarding.v1");
      if (onbRaw) {
        const onb = JSON.parse(onbRaw) as {
          icpProfile?: {
            companyDescription?: string;
            industries?: string[];
            locations?: string[];
            personas?: string[];
            companySizes?: string[];
          };
        };
        const p = onb.icpProfile;
        if (p) {
          if (!merged.icpDescription && p.companyDescription)
            merged.icpDescription = p.companyDescription;
          if (merged.icpIndustries.length === 0 && p.industries)
            merged.icpIndustries = p.industries;
          if (merged.icpLocations.length === 0 && p.locations)
            merged.icpLocations = p.locations;
          if (merged.icpPersonas.length === 0 && p.personas)
            merged.icpPersonas = p.personas;
          if (merged.icpCompanySizes.length === 0 && p.companySizes)
            merged.icpCompanySizes = p.companySizes;
        }
      }
    } catch {
      // ignore
    }
    // The logged-in member always mirrors the current user, even in older saved data.
    merged.members = merged.members.map((m) =>
      m.isYou ? { ...m, name: CURRENT_USER.name, email: CURRENT_USER.email } : m,
    );
    return merged;
  } catch {
    return defaultState();
  }
}

export function saveSettings(data: SettingsData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export const TIMEZONES = [
  "America/Sao_Paulo",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Tokyo",
];

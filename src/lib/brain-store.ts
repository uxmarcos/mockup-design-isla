export interface BrainDoc {
  id: string;
  title: string;
  description: string;
  /** HTML content, Notion-like rich text */
  content: string;
  updatedAt?: string;
}

export interface BrainFolder {
  id: string;
  label: string;
  docs: BrainDoc[];
}

/** Pseudo-folder holding documents that live at the root of the Brain. */
export const ROOT_FOLDER_ID = "__root";

const KEY = "isla.brain.v2";

function html(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${block.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function doc(
  id: string,
  title: string,
  description: string,
  content: string,
): BrainDoc {
  return { id, title, description, content: html(content) };
}

export const DEFAULT_BRAIN: BrainFolder[] = [
  { id: ROOT_FOLDER_ID, label: "Documents", docs: [] },
  {
    id: "personal",
    label: "Personal",
    docs: [
      doc(
        "about-me",
        "About Me",
        "Isla uses this to understand who you are before writing anything on your behalf.",
        `I am a Product Designer.

I spent years working with UX inside SaaS companies.

Today I build AI products.

I mainly write for SaaS founders and product people.

I live in São Paulo and work remotely with teams in the US.`,
      ),
      doc(
        "personal-brand",
        "Personal Brand",
        "This information is used whenever Isla writes content, comments, messages or makes decisions on your behalf.",
        `My positioning is: the designer who ships AI products.

The three themes I want to be known for:
1. Designing with AI, not around it.
2. Going from research to shipped product fast.
3. Building in public, showing the messy middle.

What I never want to sound like: a guru, a hype account, or a motivational poster.`,
      ),
      doc(
        "writing-style",
        "Writing Style",
        "Rules Isla follows for tone, rhythm and formatting in every draft.",
        `My writing style is direct.

Short lines. One idea per line.

I avoid hype words like "unlock", "game changer", "revolutionary".

I use concrete numbers and real examples instead of adjectives.

No emojis. No hashtags. No "thoughts?" at the end.

I open with a specific claim, not a question.`,
      ),
      doc(
        "stories",
        "Stories",
        "Personal stories Isla can reuse as proof, hooks and openings.",
        `The redesign that cut onboarding drop-off from 62% to 28%.

The time we shipped an AI feature nobody used, and what we learned rebuilding it.

Leaving agency work to join a product team.

The first client I lost because I over-designed the solution.`,
      ),
    ],
  },
  {
    id: "company",
    label: "Company",
    docs: [
      doc(
        "company-context",
        "Company Context",
        "The business context behind everything Isla writes.",
        `We build Isla, an AI content and outreach agent for B2B teams.

We sell to founders and marketing leads at SaaS companies between 10 and 200 employees.

Our wedge: LinkedIn content plus warm outbound, driven by the same knowledge base.`,
      ),
      doc(
        "products",
        "Products",
        "What we sell, how it works and what it costs.",
        `Isla Content — idea deck, voice interview, drafts and scheduling.

Isla Outreach — lead board, connection insights and message generation.

Isla Brain — the shared knowledge base that powers both.`,
      ),
      doc(
        "competitors",
        "Competitors",
        "How we position against alternatives.",
        `Taplio — strong scheduling, weak on strategy and no memory of the user.

Lemlist — outbound only, no content engine.

Hiring a ghostwriter — better voice, but slow and expensive.

Our angle: one brain, both channels, always in your voice.`,
      ),
      doc(
        "customers",
        "Customers",
        "Who already pays us and why.",
        `Nortex — enterprise marketing team using Isla for founder-led content.

Early-stage SaaS founders doing their own posting and outbound.

Common trigger: they know what to say but never find time to say it.`,
      ),
    ],
  },
  {
    id: "sales",
    label: "Sales",
    docs: [
      doc(
        "icp",
        "ICP",
        "The profile Isla targets in outbound and speaks to in content.",
        `Role: Founder, Head of Growth, Head of Marketing.

Company: B2B SaaS, 10–200 employees, Series Seed to B.

Region: Brazil, US, Europe.

Signals: posts on LinkedIn inconsistently, has a small marketing team, sells to other businesses.`,
      ),
      doc(
        "buyer-personas",
        "Buyer Personas",
        "How each persona thinks, and what they care about.",
        `Founder-operator — wants pipeline, has no time, judges everything by reply rate.

Marketing lead — wants consistency and brand safety, fears sounding robotic.

Sales lead — wants warm conversations, hates generic sequences.`,
      ),
      doc(
        "objections",
        "Objections",
        "Common pushback and how we answer it.",
        `"AI content sounds generic." — Isla writes from your brain, not from a prompt.

"I don't have time to set it up." — Onboarding takes 12 minutes and reuses your LinkedIn.

"We already have a ghostwriter." — Keep them. Isla handles volume and outbound.`,
      ),
    ],
  },
  {
    id: "content",
    label: "Content",
    docs: [
      doc(
        "inspiration",
        "Inspiration",
        "Creators and accounts whose structure we like.",
        `Accounts worth studying for structure, not for copying voice.

Short-form operators who teach with real numbers.

Founders who narrate decisions instead of outcomes.`,
      ),
      doc(
        "examples",
        "Examples",
        "Posts that performed well and should guide future drafts.",
        `The onboarding teardown post — worked because it opened with a metric.

The "we shipped the wrong feature" post — worked because it admitted a mistake early.`,
      ),
      doc(
        "references",
        "References",
        "Frameworks, data and sources Isla can cite.",
        `Internal benchmark: 2.1% average reply rate on cold LinkedIn outbound.

Our own funnel data from the last 90 days.

Public SaaS benchmark reports we trust.`,
      ),
    ],
  },
];

function normalize(folders: BrainFolder[]): BrainFolder[] {
  const hasRoot = folders.some((f) => f.id === ROOT_FOLDER_ID);
  return hasRoot
    ? [
        ...folders.filter((f) => f.id === ROOT_FOLDER_ID),
        ...folders.filter((f) => f.id !== ROOT_FOLDER_ID),
      ]
    : [{ id: ROOT_FOLDER_ID, label: "Documents", docs: [] }, ...folders];
}

export function loadBrain(): BrainFolder[] {
  if (typeof window === "undefined") return DEFAULT_BRAIN;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_BRAIN;
    const parsed = JSON.parse(raw) as BrainFolder[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_BRAIN;
    return normalize(parsed);
  } catch {
    return DEFAULT_BRAIN;
  }
}

export function saveBrain(folders: BrainFolder[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(folders));
  } catch {
    /* ignore */
  }
}

/** Plain text of the first non-empty line of an HTML document. */
export function firstLineTitle(content: string): string {
  const stripped = content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h1|h2|h3|li|blockquote|div)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  const line = stripped
    .split("\n")
    .map((l) => l.trim())
    .find(Boolean);
  return (line ?? "").slice(0, 80);
}

export function createEmptyDoc(): BrainDoc {
  return {
    id: `doc-${Date.now()}`,
    title: "",
    description: "",
    content: "",
    updatedAt: new Date().toISOString(),
  };
}

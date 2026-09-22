/** Directory for the Isla Operator Panel: operators, their workspaces (clients) with the seats inside them, and week helpers. */

export type Operator = { id: string; name: string; email: string; initials: string };

export const OPERATORS: Operator[] = [
  { id: "op-laura", name: "Laura Mendes", email: "laura@isla.to", initials: "LM" },
  { id: "op-rafael", name: "Rafael Costa", email: "rafael@isla.to", initials: "RC" },
];

/** A client company. It holds several seats — the people whose LinkedIn profiles we publish on. */
export type Workspace = {
  id: string;
  name: string;
  operatorId: string;
  logo: string;
  plan: string;
  timezone: string;
  language: string;
  contactEmail: string;
  since: string;
};

/** A person at a workspace. Content is written, approved and published per seat. */
export type Seat = {
  id: string;
  workspaceId: string;
  name: string;
  title: string;
  email: string;
  /** Target number of posts per week for this seat. */
  cadence: number;
  brandDna: string;
  icp: string;
};

export type SeatAccount = Seat & { workspace: Workspace };

export const WORKSPACES: Workspace[] = [
  { id: "nortex", name: "Nortex", operatorId: "op-laura", logo: "/nortex-logo.png", plan: "Pro · Yearly", timezone: "America/Sao_Paulo", language: "English", contactEmail: "hello@nortex.com", since: "Feb 2026" },
  { id: "lumen", name: "Lumen.io", operatorId: "op-laura", logo: "/logos/lumen.png", plan: "Pro · Monthly", timezone: "America/Sao_Paulo", language: "English", contactEmail: "hello@lumen.io", since: "Mar 2026" },
  { id: "brightpath", name: "Brightpath", operatorId: "op-laura", logo: "/logos/brightpath.png", plan: "Starter · Yearly", timezone: "America/New_York", language: "English", contactEmail: "hello@brightpath.co", since: "Apr 2026" },
  { id: "orbital", name: "Orbital Labs", operatorId: "op-laura", logo: "/logos/orbital.png", plan: "Pro · Yearly", timezone: "America/Sao_Paulo", language: "Português", contactEmail: "hello@orbitallabs.io", since: "Jan 2026" },
  { id: "kestrel", name: "Kestrel Analytics", operatorId: "op-laura", logo: "/logos/kestrel.png", plan: "Pro · Monthly", timezone: "Europe/London", language: "English", contactEmail: "hello@kestrel.ai", since: "May 2026" },
  { id: "pine", name: "Pine & Co", operatorId: "op-laura", logo: "/logos/pine.png", plan: "Starter · Monthly", timezone: "America/Sao_Paulo", language: "Português", contactEmail: "oi@pineco.com.br", since: "Jun 2026" },
  { id: "vantage", name: "Vantage Cloud", operatorId: "op-laura", logo: "/logos/vantage.png", plan: "Enterprise · Yearly", timezone: "America/Chicago", language: "English", contactEmail: "hello@vantagecloud.com", since: "Dec 2025" },
  { id: "helio", name: "Helio Health", operatorId: "op-laura", logo: "/logos/helio.png", plan: "Pro · Yearly", timezone: "America/Sao_Paulo", language: "English", contactEmail: "hello@heliohealth.com", since: "Jul 2026" },
  // Belong to another operator: the panel must never show them to Laura.
  { id: "aurora", name: "Aurora Foods", operatorId: "op-rafael", logo: "/logos/aurora.png", plan: "Pro · Yearly", timezone: "America/Sao_Paulo", language: "Português", contactEmail: "hello@aurorafoods.com", since: "Feb 2026" },
  { id: "nimbus", name: "Nimbus HR", operatorId: "op-rafael", logo: "/logos/nimbus.png", plan: "Pro · Monthly", timezone: "America/New_York", language: "English", contactEmail: "hello@nimbushr.com", since: "Apr 2026" },
  { id: "cobalt", name: "Cobalt Legal", operatorId: "op-rafael", logo: "/logos/cobalt.png", plan: "Starter · Yearly", timezone: "America/Sao_Paulo", language: "Português", contactEmail: "hello@cobaltlegal.com", since: "Mar 2026" },
];

const NORTEX_DNA = "Direct, numbers-first voice. Opinionated about pipeline quality over volume. Short paragraphs, one clear takeaway per post.";
const NORTEX_ICP = "B2B SaaS founders and heads of growth at 20–200 person companies selling to mid-market.";

export const SEATS: Seat[] = [
  { id: "nortex-chris", workspaceId: "nortex", name: "Chris Theroux", title: "Co-founder & Head of Growth", email: "chris@nortex.com", cadence: 3, brandDna: NORTEX_DNA, icp: NORTEX_ICP },
  { id: "nortex-ana", workspaceId: "nortex", name: "Ana Ribeiro", title: "Co-founder & CEO", email: "ana@nortex.com", cadence: 2, brandDna: "Visionary but grounded. Founder stories, hard-won lessons, no buzzwords.", icp: "Investors, founders and operators following the B2B SaaS space." },
  { id: "nortex-diego", workspaceId: "nortex", name: "Diego Alves", title: "Co-founder & CTO", email: "diego@nortex.com", cadence: 2, brandDna: "Technical and pragmatic. Explains trade-offs, shows the diagram behind the decision.", icp: "Engineering leaders and technical founders." },
  { id: "lumen", workspaceId: "lumen", name: "Mariana Costa", title: "CMO", email: "mariana@lumen.io", cadence: 3, brandDna: "Warm and story-led. Customer stories first, product second. Avoids jargon.", icp: "Marketing leaders at product-led companies with 50–500 employees." },
  { id: "lumen-tiago", workspaceId: "lumen", name: "Tiago Barros", title: "Founder & CEO", email: "tiago@lumen.io", cadence: 2, brandDna: "Curious and candid. Shares the messy middle of building a company.", icp: "Early-stage founders and product leaders." },
  { id: "brightpath", workspaceId: "brightpath", name: "Rafael Oliveira", title: "Founder & CEO", email: "rafael@brightpath.co", cadence: 2, brandDna: "Founder voice, candid, a little contrarian. Likes concrete numbers and lessons learned.", icp: "Early-stage founders raising a seed or Series A." },
  { id: "orbital", workspaceId: "orbital", name: "Camila Silva", title: "VP of Marketing", email: "camila@orbitallabs.io", cadence: 3, brandDna: "Technical but friendly. Explains complex ideas with simple analogies.", icp: "CTOs and engineering leaders at scale-ups." },
  { id: "kestrel", workspaceId: "kestrel", name: "Bruno Ferreira", title: "Chief Revenue Officer", email: "bruno@kestrel.ai", cadence: 2, brandDna: "Data-driven and precise. Always shows the chart behind the claim.", icp: "Revenue leaders in data-heavy industries." },
  { id: "pine", workspaceId: "pine", name: "Juliana Mendes", title: "Managing Partner", email: "juliana@pineco.com.br", cadence: 2, brandDna: "Calm, advisory tone. Long-term thinking, few adjectives.", icp: "Owners of family businesses planning succession." },
  { id: "vantage", workspaceId: "vantage", name: "André Souza", title: "Head of Sales", email: "andre@vantagecloud.com", cadence: 4, brandDna: "Confident and energetic. Sales stories, wins and lessons from the field.", icp: "Sales leaders at enterprise software vendors." },
  { id: "vantage-elisa", workspaceId: "vantage", name: "Elisa Prado", title: "VP of Customer Success", email: "elisa@vantagecloud.com", cadence: 2, brandDna: "Empathetic and practical. Customer outcomes over feature lists.", icp: "Customer success and revenue leaders at software companies." },
  { id: "helio", workspaceId: "helio", name: "Carla Lima", title: "Chief Operating Officer", email: "carla@heliohealth.com", cadence: 2, brandDna: "Empathetic and evidence-based. Puts patients and clinics at the center.", icp: "Clinic owners and healthcare operators." },
  { id: "aurora", workspaceId: "aurora", name: "Thiago Pereira", title: "Marketing Director", email: "thiago@aurorafoods.com", cadence: 3, brandDna: "Playful and food-obsessed.", icp: "Restaurant groups and retailers." },
  { id: "nimbus", workspaceId: "nimbus", name: "Larissa Santos", title: "CEO", email: "larissa@nimbushr.com", cadence: 2, brandDna: "People-first, practical.", icp: "HR leaders at growing companies." },
  { id: "cobalt", workspaceId: "cobalt", name: "Felipe Santos", title: "Partner", email: "felipe@cobaltlegal.com", cadence: 2, brandDna: "Precise and reassuring.", icp: "Tech founders dealing with contracts and IP." },
];

/** The seat whose real platform this mockup shows (Chris Theroux, at the Nortex workspace). */
export const DEFAULT_SEAT_ID = "nortex-chris";

export const DAY_MS = 86400000;

/** Monday 00:00 of the week that contains `d`. */
export function startOfWeek(d: Date) {
  const x = new Date(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}


export const workspaceById = (id: string) => WORKSPACES.find((w) => w.id === id);
export const seatById = (id: string) => SEATS.find((s) => s.id === id);

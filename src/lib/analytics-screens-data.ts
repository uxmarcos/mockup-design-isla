/** Mock data behind the two Analytics screens (Inbound and Outbound). */

export const INBOUND_KPIS = {
  posts: 252,
  impressions: 986377,
  engagement: 24984,
  newFollowers: 2224,
};

export const FOLLOWERS = { icp: 2030, total: 18720 };

const DAY = 86400000;
const SERIES_START = new Date(2026, 5, 19).getTime();
const SERIES_DAYS = 95;

function lerpKeys(keys: [number, number][], day: number) {
  for (let i = 1; i < keys.length; i += 1) {
    const [d1, v1] = keys[i]!;
    const [d0, v0] = keys[i - 1]!;
    if (day <= d1) return v0 + ((v1 - v0) * (day - d0)) / Math.max(1, d1 - d0);
  }
  return keys[keys.length - 1]![1];
}

/** Total followers of every profile: flat stretches with big jumps when a profile is added. */
const TOTAL_KEYS: [number, number][] = [
  [0, 3550], [22, 3800], [23, 4350], [40, 4700], [41, 9000], [64, 9750], [65, 17700], [94, 18720],
];
/** ICP followers: a steady climb. */
const ICP_KEYS: [number, number][] = [
  [0, 0], [6, 60], [11, 130], [15, 330], [22, 470], [30, 520], [41, 700], [52, 800], [64, 1000],
  [72, 1160], [80, 1500], [88, 1800], [94, 2030],
];

export type FollowerPoint = { date: string; label: string; total: number; icp: number };

export const FOLLOWER_SERIES: FollowerPoint[] = Array.from({ length: SERIES_DAYS }, (_, day) => {
  const d = new Date(SERIES_START + day * DAY);
  return {
    date: d.toISOString().slice(0, 10),
    label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    total: Math.round(lerpKeys(TOTAL_KEYS, day)),
    icp: Math.round(lerpKeys(ICP_KEYS, day)),
  };
});

export type TopPost = {
  title: string;
  excerpt: string;
  sender: string;
  published: string;
  highIcpLeads: number;
  totalEngagers: number;
};

export const TOP_POSTS: TopPost[] = [
  {
    title: "Teoria dos Grafos e Teoria da Computação são as disciplinas mais abstratas do curso.",
    excerpt: "Então decidi torná-las concretas. Esse semestre foi diferente. Nas duas matérias, tinha um projeto real.",
    sender: "Leonardo Arazo",
    published: "Jul 09, 2026",
    highIcpLeads: 44,
    totalEngagers: 199,
  },
  {
    title: "Se você tem uma empresa B2B eu quero gerar leads pra você.",
    excerpt: "De graça, se não funcionar. Você só precisa dedicar 30 minutos por semana para revisar as conversas.",
    sender: "Marcos Figueiredo",
    published: "Jul 27, 2026",
    highIcpLeads: 36,
    totalEngagers: 100,
  },
  {
    title: "Parei de prospectar no frio e minha taxa de resposta triplicou.",
    excerpt: "O segredo não foi o texto da mensagem. Foi o que eu fiz nos 7 dias antes de enviá-la.",
    sender: "Eduardo Schuch",
    published: "Aug 14, 2026",
    highIcpLeads: 31,
    totalEngagers: 148,
  },
  {
    title: "Seu ICP está errado e os seus próprios dados provam isso.",
    excerpt: "Olhei 300 clientes que renovaram duas vezes. O que eles tinham em comum não estava em nenhum filtro.",
    sender: "Marcos Hollmann",
    published: "Aug 02, 2026",
    highIcpLeads: 28,
    totalEngagers: 122,
  },
  {
    title: "Cold outbound não morreu. Outbound preguiçoso morreu.",
    excerpt: "Três mudanças que fizeram nossas respostas subirem de 3% para 19% em um único trimestre.",
    sender: "João Pedro",
    published: "Jul 18, 2026",
    highIcpLeads: 25,
    totalEngagers: 136,
  },
  {
    title: "O que aprendi analisando 100 demos de vendas B2B.",
    excerpt: "A melhor demo não começa pelo produto. Começa pela agenda do cliente naquela semana.",
    sender: "Maycow Jordny",
    published: "Jun 30, 2026",
    highIcpLeads: 22,
    totalEngagers: 90,
  },
  {
    title: "Contratar o primeiro SDR antes de ter processo é queimar dinheiro.",
    excerpt: "Primeiro documente o que funciona com você. Depois delegue. Nessa ordem, sempre.",
    sender: "Eduardo Schuch",
    published: "Aug 21, 2026",
    highIcpLeads: 19,
    totalEngagers: 87,
  },
  {
    title: "Como reduzimos o tempo até o primeiro valor de 21 para 4 dias.",
    excerpt: "Tiramos passos do onboarding em vez de adicionar funcionalidades. O resultado surpreendeu o time.",
    sender: "Marcos Figueiredo",
    published: "Sep 03, 2026",
    highIcpLeads: 17,
    totalEngagers: 64,
  },
  {
    title: "Métrica de vaidade não paga salário.",
    excerpt: "Impressões sobem e o pipeline não. Aqui está o painel que passamos a acompanhar.",
    sender: "Leonardo Arazo",
    published: "Sep 10, 2026",
    highIcpLeads: 15,
    totalEngagers: 71,
  },
  {
    title: "Comentar antes de chamar no DM: o passo que ninguém faz.",
    excerpt: "Dois comentários e uma reação antes do convite dobraram a nossa taxa de aceite.",
    sender: "João Pedro",
    published: "Sep 16, 2026",
    highIcpLeads: 12,
    totalEngagers: 58,
  },
];

export const OUTBOUND = {
  warmup: { cold: 2850, warming: 121, hot: 61 },
  kpis: { totalLeads: 3032, invitesSent: 1384, invitesAccepted: 550 },
  funnel: [
    { key: "new", label: "New Prospects", value: 3032, color: "#717D9C" },
    { key: "connecting", label: "Connecting", value: 1384, color: "#3B82F6" },
    { key: "engaging", label: "Engaging", value: 550, color: "#7040F5" },
    { key: "reach", label: "Reach Out", value: 104, color: "#F0651A" },
    { key: "follow", label: "Follow-up", value: 2, color: "#F5822F" },
    { key: "call", label: "Call booked", value: 6, color: "#2DBB4E" },
  ],
};

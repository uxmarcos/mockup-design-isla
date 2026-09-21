// Contextual tutor content used by the floating Isla Agent.
import kanbanVideo from "@/assets/lead-board-tutorial.mp4.asset.json";

export type ScreenGuide = {
  key: string;
  title: string;
  summary: string;
  videoTitle: string;
  videoLength: string;
  /** Real video file for screens that already have a recorded walkthrough. */
  videoSrc?: string;
  faqs: { q: string; a: string; video?: string }[];
};

const GUIDES: ScreenGuide[] = [
  {
    key: "/home",
    title: "Home",
    summary:
      "Home is your daily starting point. It shows the setup steps still missing, the tasks Isla prepared for you today, and everything that happened in your workspace.",
    videoTitle: "How to use your Home",
    videoLength: "0:42",
    faqs: [
      {
        q: "What should I do first here?",
        a: "Start from the top of the list. Isla unlocks one step at a time, so finishing the highlighted step reveals the next one. Once setup is done, Home switches to Today's tasks.",
      },
      {
        q: "How are Today's tasks created?",
        a: "Isla looks at your leads, your content pipeline and the people engaging with you, then turns that into a short list of concrete actions — commenting on ICP posts, approving a draft, or reaching out to a hot lead.",
      },
      {
        q: "What is Recent activity?",
        a: "It's the log of everything Isla and your network did: new leads found, replies received, posts published. Clicking an item takes you to the related lead or post.",
      },
    ],
  },
  {
    key: "/kanban",
    title: "Lead Board",
    summary:
      "The Lead Board is your CRM. Every person Isla finds becomes a card, and each column is a stage of the relationship — from new prospect to conversation.",
    videoTitle: "How the Lead Board works",
    videoLength: "0:48",
    videoSrc: kanbanVideo.url,
    faqs: [
      {
        q: "How does the Lead Board work?",
        video: kanbanVideo.url,
        a: "Leads enter on the left as new prospects. As you connect, message and get replies, they move right. The colored bar on each card shows the LinkedIn connection status: green connected, orange pending, gray not connected.",
      },
      {
        q: "How do I move a lead?",
        a: "Drag the card to another column, or open the card and use the actions in the drawer. Moving a lead updates its stage and the suggested next action.",
      },
      {
        q: "What should I do with a new lead?",
        a: "Open the card, review the ICP match and recent activity, then generate a reach out message. You can edit it and send it without leaving the drawer.",
      },
    ],
  },
  {
    key: "/inbox",
    title: "Inbox",
    summary:
      "The Inbox centralizes every conversation started from Isla, so you can follow up without switching to LinkedIn.",
    videoTitle: "Managing conversations",
    videoLength: "0:36",
    faqs: [
      {
        q: "Which messages appear here?",
        a: "Every message you sent through Isla plus the replies from your leads, grouped by person.",
      },
      {
        q: "How do I reply to a lead?",
        a: "Select the conversation and write in the composer. Isla can also suggest a reply based on the lead's context.",
      },
      {
        q: "What happens after a reply?",
        a: "The lead is flagged as engaged and moves forward on the Lead Board, and a follow-up task shows up on Home.",
      },
    ],
  },
  {
    key: "/post-ideas",
    title: "Create Content",
    summary:
      "Create Content is where content starts. Explore ideas generated from your brain and audience, like the ones you want, then refine them into drafts by voice or chat.",
    videoTitle: "From idea to published post",
    videoLength: "0:52",
    faqs: [
      {
        q: "How are ideas generated?",
        a: "Isla combines your content pillars, monitored profiles and what your audience engaged with, then proposes angles connected to those nodes.",
      },
      {
        q: "How do I turn an idea into a post?",
        a: "Like an idea, open it and choose Refine with Call or Refine with Chat. Isla interviews you, then produces hooks and a full draft.",
      },
      {
        q: "What happens to my drafts?",
        a: "Drafts stay in the Drafts tab where you can edit, request a human review, schedule or publish them.",
      },
    ],
  },
  {
    key: "/analytics",
    title: "Analytics",
    summary:
      "Analytics connects content to pipeline: who engaged with your posts, which of them match your ICP, and what that generated.",
    videoTitle: "Reading your Analytics",
    videoLength: "0:44",
    faqs: [
      {
        q: "What do these numbers mean?",
        a: "Inbound covers content performance, Outbound covers outreach, and Cross shows where both meet — engaged people who became leads.",
      },
      {
        q: "How do I find my best leads?",
        a: "Open the top engagers table and click a high ICP lead to inspect it. You can add it straight to the Lead Board.",
      },
      {
        q: "Can I share this with my team?",
        a: "Yes — export the report and it keeps the same charts and filters you're seeing.",
      },
    ],
  },
  {
    key: "/comments",
    title: "Comments",
    summary:
      "Comments is your daily engagement queue: posts from your ICP where a thoughtful comment creates warm entry points.",
    videoTitle: "Running your daily outreach",
    videoLength: "0:38",
    faqs: [
      {
        q: "How is this queue built?",
        a: "Isla scans posts from people who match your ICP and ranks the ones most worth engaging with today.",
      },
      {
        q: "Should I edit the suggested comments?",
        a: "Yes when you can — small personal edits perform better. Isla's suggestion is a starting point, not a template.",
      },
      {
        q: "What happens after I comment?",
        a: "The person is tracked on the Lead Board and Isla proposes the next step if they engage back.",
      },
    ],
  },
  {
    key: "/brain",
    title: "Isla Brain",
    summary:
      "The Brain is the knowledge Isla uses to write like you: positioning, offers, stories, proof points and tone.",
    videoTitle: "Building your Brain",
    videoLength: "0:46",
    faqs: [
      {
        q: "What should I add to the Brain?",
        a: "Anything Isla should know: your offer, your customers, objections, case studies, personal stories and the way you like to write.",
      },
      {
        q: "How do documents work?",
        a: "Create a document, write freely, and the first line becomes the title. Everything saves automatically in the background.",
      },
      {
        q: "Does this change my content?",
        a: "Yes — richer Brain means sharper ideas, more accurate drafts and better outreach messages.",
      },
    ],
  },
  {
    key: "/settings",
    title: "Settings",
    summary:
      "Settings is where you configure your workspace: your ICP, monitored profiles, content preferences and team access.",
    videoTitle: "Configuring your workspace",
    videoLength: "0:40",
    faqs: [
      {
        q: "What do I need to configure?",
        a: "Three things matter most: competitors and monitored profiles, your content pillars, and your ICP definition.",
      },
      {
        q: "How do I connect LinkedIn?",
        a: "Use the Connect LinkedIn step on Home or in General settings. It lets Isla engage with leads and track replies.",
      },
      {
        q: "What settings should I complete first?",
        a: "Start with monitored profiles and content pillars — they drive the quality of your ideas immediately.",
      },
    ],
  },
  {
    key: "/activity",
    title: "Activity",
    summary:
      "Activity is the full history of your workspace, filtered by type, so you can audit everything Isla did on your behalf.",
    videoTitle: "Following your activity",
    videoLength: "0:32",
    faqs: [
      {
        q: "What gets logged here?",
        a: "Leads added, likes and comments on your posts, replies received, drafts created and posts published.",
      },
      {
        q: "Can I act from here?",
        a: "Yes — clicking a person or a post takes you to the related lead or content.",
      },
      {
        q: "How far back does it go?",
        a: "Since your workspace was created. Use the filters to narrow it down by type.",
      },
    ],
  },
  {
    key: "/onboarding",
    title: "Onboarding",
    summary:
      "This is your onboarding. Isla asks a few questions about you and your company to build your ICP and your first CRM.",
    videoTitle: "What happens during onboarding",
    videoLength: "0:35",
    faqs: [
      {
        q: "Why do you need my LinkedIn?",
        a: "Isla reads your public posts and the people engaging with them to find leads that already know you.",
      },
      {
        q: "What is the ICP for?",
        a: "It's the definition of who you want to reach. Everything Isla does later — leads, outreach, content — is filtered by it.",
      },
      {
        q: "What happens when I finish?",
        a: "Isla builds your workspace and takes you Home, with your CRM pre-filled and the remaining setup steps listed.",
      },
    ],
  },
];

const FALLBACK: ScreenGuide = {
  key: "default",
  title: "Isla",
  summary:
    "I'm the Isla Agent. I can explain what each part of the platform does and guide you through your next step.",
  videoTitle: "Getting started with Isla",
  videoLength: "0:40",
  faqs: [
    { q: "What can Isla do for me?", a: "Isla finds leads that already engage with you, helps you create content, and turns both into daily actions." },
    { q: "Where should I start?", a: "Start on Home — it always shows the single most important next step." },
    { q: "How do I get help?", a: "Click me any time. I answer questions about the screen you're on." },
  ],
};

export function guideForPath(pathname: string): ScreenGuide {
  const match = GUIDES.filter((g) => pathname === g.key || pathname.startsWith(g.key + "/")).sort(
    (a, b) => b.key.length - a.key.length,
  )[0];
  return match ?? FALLBACK;
}

/** Answer + optional video for a free-typed question. */
export function tutorReply(question: string, guide: ScreenGuide): { a: string; video?: string } {
  const q = question.toLowerCase();
  const hit = guide.faqs.find((f) =>
    f.q
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4)
      .some((w) => q.includes(w)),
  );
  if (hit) return { a: hit.a, video: hit.video };
  if (guide.videoSrc && /(how|funciona|work|use|usar)/.test(q)) {
    return { a: tutorAnswer(question, guide), video: guide.videoSrc };
  }
  return { a: tutorAnswer(question, guide) };
}

/** Generic fallback answer for free-typed questions. */
export function tutorAnswer(question: string, guide: ScreenGuide): string {
  const q = question.toLowerCase();
  const hit = guide.faqs.find((f) =>
    f.q
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4)
      .some((w) => q.includes(w)),
  );
  if (hit) return hit.a;
  return `On ${guide.title}: ${guide.summary} If you tell me what you're trying to do here, I'll walk you through it step by step.`;
}

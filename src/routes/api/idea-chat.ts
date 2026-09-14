import { createFileRoute } from "@tanstack/react-router";

type ChatMsg = { role: "user" | "assistant"; content: string };

type IdeaCtx = {
  hook: string;
  angle?: string;
  pillar?: string;
  tags?: string[];
};

type Body = {
  idea?: IdeaCtx;
  messages?: ChatMsg[];
  mode?: "interview" | "hooks" | "draft" | "refine";
  hook?: string;
  answers?: string[];
  draft?: string;
  instruction?: string;
};

export const Route = createFileRoute("/api/idea-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        const key = process.env.ANTHROPIC_API_KEY;
        if (!key) return new Response("Missing ANTHROPIC_API_KEY", { status: 500 });
        if (!body?.idea?.hook) return new Response("Invalid body", { status: 400 });

        const idea = body.idea;
        const mode = body.mode ?? "interview";

        const ideaContext = [
          `Hook: ${idea.hook}`,
          idea.angle ? `Angle: ${idea.angle}` : "",
          idea.pillar ? `Pillar: ${idea.pillar}` : "",
          idea.tags?.length ? `Tags: ${idea.tags.join(", ")}` : "",
        ]
          .filter(Boolean)
          .join("\n");

        let system = "";
        let messages: ChatMsg[] = [];

        if (mode === "interview") {
          system = [
            "You are a sharp LinkedIn ghostwriting coach helping the user develop a post from an idea they liked.",
            "Ask EXACTLY 3 focused questions, ONE at a time, to collect raw material.",
            "Q1 — concrete experience/story. Q2 — sharp opinion / who they disagree with / stakes. Q3 — the reader takeaway.",
            "Rules: one question per message, under 2 sentences, no preamble, no 'Great!'. English only.",
            "After the user answers Q3, do NOT ask another question — reply with a punchy LinkedIn draft in their voice.",
            "",
            "=== IDEA CONTEXT ===",
            ideaContext,
          ].join("\n");
          messages = (body.messages ?? []).filter((m) => m.content?.trim());
        } else if (mode === "hooks") {
          system =
            "You write scroll-stopping LinkedIn hooks. Output EXACTLY 5 hooks, one per line, numbered 1-5. No preamble, no commentary, no explanations. Each hook is one or two sharp sentences.";
          messages = [
            {
              role: "user",
              content: [
                "Generate 5 hook options for a LinkedIn post based on this idea and the interview answers.",
                "",
                "=== IDEA ===",
                ideaContext,
                "",
                "=== INTERVIEW ANSWERS ===",
                (body.answers ?? []).map((a, i) => `A${i + 1}: ${a}`).join("\n") || "(none)",
              ].join("\n"),
            },
          ];
        } else if (mode === "draft") {
          system =
            "You write LinkedIn posts in the author's voice. Punchy, personal, tight lines, no hashtags, no emojis. Return only the post body — no title, no preamble, no commentary. End with a single question to the reader.";
          messages = [
            {
              role: "user",
              content: [
                `Write a LinkedIn post that opens with this exact hook: "${body.hook ?? ""}"`,
                "",
                "=== IDEA ===",
                ideaContext,
                "",
                "=== INTERVIEW ANSWERS ===",
                (body.answers ?? []).map((a, i) => `A${i + 1}: ${a}`).join("\n") || "(none)",
              ].join("\n"),
            },
          ];
        } else if (mode === "refine") {
          system =
            "You refine LinkedIn posts. Apply the user's instruction and return ONLY the revised post — no preamble, no commentary. Keep the author's voice.";
          messages = [
            {
              role: "user",
              content: [
                `Instruction: ${body.instruction ?? ""}`,
                "",
                "Current draft:",
                body.draft ?? "",
              ].join("\n"),
            },
          ];
        }

        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 1024,
            system,
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          return new Response(text || "Anthropic error", { status: res.status });
        }
        const json = (await res.json()) as {
          content?: { type: string; text?: string }[];
        };
        const assistant =
          json.content?.filter((c) => c.type === "text").map((c) => c.text ?? "").join("\n").trim() ||
          "(no response)";
        return new Response(JSON.stringify({ assistant }), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";

type ThreadMessage = {
  role: "user" | "model";
  content: string;
};

function buildPrompt(body: {
  topic?: string;
  subject?: string;
  exam?: string;
  question?: string;
  thread?: ThreadMessage[];
}) {
  const thread =
    body.thread
      ?.map((message) => `${message.role === "user" ? "Student" : "Synapse"}: ${message.content}`)
      .join("\n\n") ?? "";
  return `You are Synapse, a patient study tutor for Indian students. Explain clearly with markdown headings, short paragraphs, and concrete examples.

Topic: ${body.topic ?? "Current topic"}
Subject: ${body.subject ?? "General"}
Exam: ${body.exam ?? "Exam prep"}

Prior conversation:
${thread || "None yet"}

Student request: ${body.question || "Explain this topic from first principles."}`;
}

function extractSseText(line: string) {
  if (!line.startsWith("data:")) return "";
  const payload = line.slice(5).trim();
  if (!payload || payload === "[DONE]") return "";
  try {
    const data = JSON.parse(payload) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    return data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  } catch {
    return "";
  }
}

export const Route = createFileRoute("/api/gemini-stream")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.GEMINI_API_KEY;
        if (!key) {
          return Response.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
        }

        let body: {
          topic?: string;
          subject?: string;
          exam?: string;
          question?: string;
          thread?: ThreadMessage[];
        } = {};
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const upstream = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: buildPrompt(body) }] }],
            }),
          },
        );

        if (!upstream.ok || !upstream.body) {
          const errText = await upstream.text().catch(() => "");
          return Response.json(
            { error: `Gemini API error: ${upstream.status} ${errText}` },
            { status: 502 },
          );
        }

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        let buffer = "";
        const stream = new ReadableStream({
          async start(controller) {
            const reader = upstream.body!.getReader();
            try {
              for (;;) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";
                for (const line of lines) {
                  const text = extractSseText(line);
                  if (text) controller.enqueue(encoder.encode(text));
                }
              }
              const tail = extractSseText(buffer);
              if (tail) controller.enqueue(encoder.encode(tail));
            } finally {
              controller.close();
              reader.releaseLock();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Cache-Control": "no-cache",
            "Content-Type": "text/plain; charset=utf-8",
          },
        });
      },
    },
  },
});

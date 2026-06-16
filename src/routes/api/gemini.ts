import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/gemini")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.GEMINI_API_KEY;
        if (!key) {
          return Response.json(
            { error: "GEMINI_API_KEY is not configured" },
            { status: 500 },
          );
        }
        let body: { prompt?: string } = {};
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }
        const prompt = body.prompt;
        if (!prompt || typeof prompt !== "string") {
          return Response.json(
            { error: "Missing 'prompt' string in body" },
            { status: 400 },
          );
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
        const upstream = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          }),
        });

        if (!upstream.ok) {
          const errText = await upstream.text();
          return Response.json(
            { error: `Gemini API error: ${upstream.status} ${errText}` },
            { status: 502 },
          );
        }

        const data = (await upstream.json()) as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> };
          }>;
        };
        const result =
          data.candidates?.[0]?.content?.parts
            ?.map((p) => p.text ?? "")
            .join("") ?? "";
        return Response.json({ result });
      },
    },
  },
});
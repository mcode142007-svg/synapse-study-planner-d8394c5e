export async function callGemini(prompt: string): Promise<string> {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gemini request failed (${res.status}): ${text}`);
  }
  const data = (await res.json()) as { result?: string; error?: string };
  if (data.error) throw new Error(data.error);
  return data.result ?? "";
}

function stripFences(s: string): string {
  return s
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

export async function callGeminiJSON<T>(prompt: string): Promise<T> {
  const tryParse = (raw: string): T => {
    const cleaned = stripFences(raw);
    // Try to find first JSON array/object in response.
    const m = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    return JSON.parse(m ? m[0] : cleaned) as T;
  };
  const first = await callGemini(prompt);
  try {
    return tryParse(first);
  } catch {
    const retry = await callGemini(
      prompt +
        "\n\nReturn ONLY valid JSON. No markdown. No backticks. No explanation. Start your response with [ and end with ].",
    );
    return tryParse(retry);
  }
}
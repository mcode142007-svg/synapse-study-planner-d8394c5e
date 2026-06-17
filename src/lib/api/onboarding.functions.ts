import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Weightage = "high" | "medium" | "low";

type ParsedSyllabusSubject = {
  subject: string;
  chapters: Array<{
    chapter_number: number;
    chapter_name: string;
    topics: string[];
    weightage?: Weightage;
  }>;
};

const UploadedFileSchema = z.object({
  name: z.string(),
  mimeType: z.string(),
  text: z.string().optional(),
  base64: z.string().optional(),
});

const PlanInputSchema = z.object({
  hoursPerDay: z.number().min(1).max(12),
});

function getGeminiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");
  return key;
}

function stripFences(s: string) {
  return s
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function parseJson<T>(raw: string): T {
  const cleaned = stripFences(raw);
  const match = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  return JSON.parse(match ? match[0] : cleaned) as T;
}

async function callGeminiParts(parts: Array<Record<string, unknown>>) {
  const key = getGeminiKey();
  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    },
  );

  if (!upstream.ok) {
    const errText = await upstream.text();
    throw new Error(`Gemini API error: ${upstream.status} ${errText}`);
  }

  const data = (await upstream.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const result = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!result.trim()) throw new Error("Gemini returned an empty response");
  return result;
}

async function callGeminiWithImage(prompt: string, images: z.infer<typeof UploadedFileSchema>[]) {
  return callGeminiParts([
    { text: prompt },
    ...images.map((file) => ({
      inlineData: {
        mimeType: file.mimeType,
        data: file.base64,
      },
    })),
  ]);
}

function normalizeSubjects(input: ParsedSyllabusSubject[]) {
  return input
    .filter((subject) => subject.subject && subject.chapters?.length)
    .map((subject) => ({
      subject: subject.subject.trim(),
      chapters: subject.chapters
        .filter((chapter) => chapter.chapter_name)
        .map((chapter, index) => ({
          chapter_number: Number(chapter.chapter_number) || index + 1,
          chapter_name: chapter.chapter_name.trim(),
          topics: Array.isArray(chapter.topics)
            ? chapter.topics.map((topic) => String(topic).trim()).filter(Boolean)
            : [],
          weightage: chapter.weightage ?? "medium",
        })),
    }));
}

export const parseSyllabusFiles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      goalName: z.string().min(1),
      files: z.array(UploadedFileSchema),
    }),
  )
  .handler(async ({ data }) => {
    const imageFiles = data.files.filter((file) => file.mimeType.startsWith("image/"));
    const textPayload = data.files
      .filter((file) => file.text?.trim())
      .map((file) => `File: ${file.name}\n${file.text}`)
      .join("\n\n");

    const prompt = `Extract a syllabus for ${data.goalName}. Return ONLY a strict valid JSON array in this exact schema: [{"subject":"Physics","chapters":[{"chapter_number":1,"chapter_name":"Chapter Name","topics":["topic"],"weightage":"medium"}]}]. Use weightage only as "high", "medium", or "low". No markdown, no prose. ${
      textPayload ? `Text/PDF content:\n${textPayload.slice(0, 70000)}` : ""
    }`;

    const raw =
      imageFiles.length > 0
        ? await callGeminiWithImage(prompt, imageFiles)
        : await callGeminiParts([{ text: prompt }]);

    return normalizeSubjects(parseJson<ParsedSyllabusSubject[]>(raw));
  });

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function normalizeKey(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function fallbackPlan({
  userId,
  hoursPerDay,
  goals,
  subjects,
  syllabus,
}: {
  userId: string;
  hoursPerDay: number;
  goals: Array<{ id: string; priority: number | null }>;
  subjects: Array<{ id: string; goal_id: string | null; subject_name: string | null }>;
  syllabus: Array<{
    id: string;
    goal_id: string | null;
    subject_id: string | null;
    chapter_name: string | null;
    topics: string[] | null;
    weightage: string | null;
  }>;
}) {
  const orderedGoals = [...goals].sort((a, b) => (a.priority ?? 3) - (b.priority ?? 3));
  const minutes = Math.round((hoursPerDay * 60) / 2);
  const rows = [];
  let pointer = 0;

  for (let day = 0; day < 30; day += 1) {
    const goal = orderedGoals[day % Math.max(orderedGoals.length, 1)];
    const chapters = syllabus.filter((chapter) => chapter.goal_id === goal?.id);
    for (let slot = 0; slot < 2; slot += 1) {
      const chapter = chapters[pointer % Math.max(chapters.length, 1)];
      const subject = subjects.find((item) => item.id === chapter?.subject_id);
      rows.push({
        user_id: userId,
        goal_id: goal?.id ?? null,
        subject_id: subject?.id ?? null,
        chapter_id: chapter?.id ?? null,
        topic: chapter?.topics?.[slot] ?? chapter?.chapter_name ?? "Revision",
        scheduled_date: isoDate(addDays(new Date(), day)),
        scheduled_start_time: slot === 0 ? "18:00" : "19:30",
        scheduled_end_time: slot === 0 ? "19:15" : "20:45",
        task_type: slot === 0 ? "learn" : "practice",
        difficulty: chapter?.weightage ?? "medium",
        estimated_minutes: minutes,
        status: "pending",
        pomodoro_work_minutes: 25,
        pomodoro_break_minutes: 5,
      });
      pointer += 1;
    }
  }

  return rows;
}

export const generateStudyPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(PlanInputSchema)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as {
      supabase: import("@supabase/supabase-js").SupabaseClient;
      userId: string;
    };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: profile }, { data: goals }, { data: subjects }, { data: syllabus }] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase
          .from("goals")
          .select("id, goal_name, exam_date, exam_year, priority")
          .eq("user_id", userId)
          .eq("status", "active"),
        supabase
          .from("subjects")
          .select("id, goal_id, subject_name, current_level, ai_assessed_level")
          .eq("user_id", userId),
        supabase
          .from("syllabus")
          .select("id, goal_id, subject_id, chapter_name, topics, weightage")
          .eq("user_id", userId),
      ]);

    if (!goals?.length) throw new Error("No active goals found");
    if (!subjects?.length) throw new Error("No subjects found for plan generation");
    if (!syllabus?.length) throw new Error("No syllabus found for plan generation");

    let rows = fallbackPlan({
      userId,
      hoursPerDay: data.hoursPerDay,
      goals,
      subjects,
      syllabus,
    });

    try {
      const prompt = `You are generating a study plan. Return ONLY a strict valid JSON array for the next 30 days, no markdown and no prose. Prioritize the closest upcoming exam dates and higher priority goals. Each item must match this schema: {"goal_id":"uuid","subject_name":"Physics","chapter_name":"Kinematics","topic":"Projectile motion","scheduled_date":"YYYY-MM-DD","scheduled_start_time":"HH:MM","scheduled_end_time":"HH:MM","task_type":"learn|practice|revision|test","difficulty":"easy|medium|hard","estimated_minutes":60}. User profile JSON: ${JSON.stringify(
        profile ?? {},
      )}. Hours per day: ${data.hoursPerDay}. Goals JSON: ${JSON.stringify(
        goals,
      )}. Subject levels JSON: ${JSON.stringify(subjects)}. Syllabus JSON: ${JSON.stringify(
        syllabus,
      )}.`;
      const generated = parseJson<
        Array<{
          goal_id?: string;
          subject_name?: string;
          chapter_name?: string;
          topic?: string;
          scheduled_date?: string;
          scheduled_start_time?: string;
          scheduled_end_time?: string;
          task_type?: string;
          difficulty?: string;
          estimated_minutes?: number;
        }>
      >(await callGeminiParts([{ text: prompt }]));

      const subjectByName = new Map(subjects.map((s) => [normalizeKey(s.subject_name), s]));
      const chapterByName = new Map(syllabus.map((s) => [normalizeKey(s.chapter_name), s]));
      rows = generated
        .filter((item) => item.scheduled_date && item.subject_name)
        .slice(0, 120)
        .map((item) => {
          const subject = subjectByName.get(normalizeKey(item.subject_name));
          const chapter = chapterByName.get(normalizeKey(item.chapter_name));
          return {
            user_id: userId,
            goal_id: item.goal_id ?? subject?.goal_id ?? chapter?.goal_id ?? goals[0].id,
            subject_id: subject?.id ?? chapter?.subject_id ?? null,
            chapter_id: chapter?.id ?? null,
            topic: item.topic ?? item.chapter_name ?? "Revision",
            scheduled_date: item.scheduled_date ?? isoDate(new Date()),
            scheduled_start_time: item.scheduled_start_time ?? "18:00",
            scheduled_end_time: item.scheduled_end_time ?? "19:00",
            task_type: item.task_type ?? "learn",
            difficulty: item.difficulty ?? "medium",
            estimated_minutes: item.estimated_minutes ?? data.hoursPerDay * 60,
            status: "pending",
            pomodoro_work_minutes: 25,
            pomodoro_break_minutes: 5,
          };
        });
    } catch (error) {
      console.error("Gemini plan generation failed; using deterministic fallback", error);
    }

    const today = isoDate(new Date());
    const in30 = isoDate(addDays(new Date(), 29));
    await supabaseAdmin
      .from("study_plan")
      .delete()
      .eq("user_id", userId)
      .gte("scheduled_date", today)
      .lte("scheduled_date", in30);

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("study_plan")
      .insert(rows)
      .select(
        "id, topic, scheduled_date, scheduled_start_time, scheduled_end_time, task_type, difficulty, estimated_minutes, subjects(subject_name), syllabus(chapter_name)",
      )
      .order("scheduled_date", { ascending: true })
      .limit(60);
    if (insertError) throw insertError;

    const { error: completeError } = await supabaseAdmin
      .from("users")
      .update({ onboarding_complete: true })
      .eq("id", userId);
    if (completeError) throw completeError;

    return { plan: inserted ?? [] };
  });

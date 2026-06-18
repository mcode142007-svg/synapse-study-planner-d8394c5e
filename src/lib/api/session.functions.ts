import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TaskInputSchema = z.object({
  taskId: z.string().uuid(),
});

function parseIsoDuration(value: string | null | undefined) {
  if (!value) return null;
  const match = value.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return null;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  return hours * 60 + minutes + seconds / 60;
}

function getYoutubeKey() {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY is not configured");
  return key;
}

export const getLearningTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(TaskInputSchema)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as {
      supabase: import("@supabase/supabase-js").SupabaseClient;
      userId: string;
    };

    const { data: task, error } = await supabase
      .from("study_plan")
      .select(
        "id, topic, difficulty, task_type, status, pomodoro_work_minutes, pomodoro_break_minutes, goal_id, subject_id, chapter_id, user_id, goals(goal_name, exam_date), subjects(subject_name), syllabus(chapter_name)",
      )
      .eq("id", data.taskId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    if (!task) throw new Error("Task not found");

    return task;
  });

const GenerateAiNotesSchema = z.object({
  topic: z.string().min(1),
  subject: z.string().min(1),
  exam: z.string().min(1),
  studentLevel: z.string().min(1),
  language: z.string().min(1),
  userId: z.string().uuid(),
  chapterId: z.string().uuid(),
  subjectId: z.string().uuid(),
});

export const generateAiNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(GenerateAiNotesSchema)
  .handler(async ({ data, context }) => {
    const { supabase, userId: authUserId } = context as {
      supabase: import("@supabase/supabase-js").SupabaseClient;
      userId: string;
    };

    if (authUserId !== data.userId) {
      throw new Error("Unauthorized user mismatch");
    }

    const prompt = `Generate concise study notes for the topic '${data.topic}' from ${data.subject}, exam ${data.exam}. Student level: ${data.studentLevel}. Include: key points (bullets), formulas, common mistakes, exam tips. Keep it short and scannable. Language: ${data.language}.`;
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is not configured");

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
      throw new Error(`Gemini API error: ${upstream.status} ${errText}`);
    }

    const dataJson = (await upstream.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const content =
      dataJson.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
    if (!content.trim()) {
      throw new Error("Gemini returned an empty notes response");
    }

    const { data: note, error: insertError } = await supabase
      .from("notes")
      .insert({
        user_id: authUserId,
        subject_id: data.subjectId,
        chapter_id: data.chapterId,
        topic: data.topic,
        note_type: "ai_generated",
        content,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (insertError) {
      throw insertError;
    }

    return { content, note };
  });

export const startLearningSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(TaskInputSchema)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as {
      supabase: import("@supabase/supabase-js").SupabaseClient;
      userId: string;
    };

    const { data: task, error: taskError } = await supabase
      .from("study_plan")
      .select("id, topic, difficulty, goal_id, subject_id")
      .eq("id", data.taskId)
      .eq("user_id", userId)
      .maybeSingle();

    if (taskError) throw taskError;
    if (!task) throw new Error("Task not found");

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        user_id: userId,
        plan_id: task.id,
        goal_id: task.goal_id,
        subject_id: task.subject_id,
        topic: task.topic,
        difficulty_handled: task.difficulty,
        started_at: new Date().toISOString(),
        completion_status: "in_progress",
      })
      .select("id")
      .single();

    if (sessionError) throw sessionError;

    await supabase
      .from("study_plan")
      .update({ status: "in-progress" })
      .eq("id", task.id)
      .eq("user_id", userId);

    return { sessionId: session.id };
  });

const FinalizeSessionSchema = z.object({
  session_id: z.string().uuid(),
  plan_id: z.string().uuid(),
  user_id: z.string().uuid(),
  subject: z.string().min(1),
  topic: z.string().min(1),
  actual_minutes: z.number().min(0),
  problems_attempted: z.number().min(0),
  problems_correct: z.number().min(0),
  doubts_raised: z.number().min(0),
});

const SessionAnalysisSchema = z.object({
  status: z.union([z.literal("struggling"), z.literal("on_track"), z.literal("excelling")]),
  difficulty_next: z.union([z.literal("easier"), z.literal("same"), z.literal("harder")]),
  insight: z.string().min(1),
});

function getGeminiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");
  return key;
}

function extractJsonObject(value: string) {
  const cleaned = value.replace(/```(?:json)?/gi, "").replace(/`/g, "").trim();
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    return cleaned;
  }
  return cleaned.slice(first, last + 1);
}

export const finalizeSessionAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(FinalizeSessionSchema)
  .handler(async ({ data, context }) => {
    const { supabase, userId: authUserId } = context as {
      supabase: import("@supabase/supabase-js").SupabaseClient;
      userId: string;
    };

    if (authUserId !== data.user_id) {
      throw new Error("Unauthorized user mismatch");
    }

    const scorePercentage =
      data.problems_attempted > 0
        ? Math.round((data.problems_correct / data.problems_attempted) * 100)
        : 0;

    const { data: updatedSession, error: updateError } = await supabase
      .from("sessions")
      .update({
        ended_at: new Date().toISOString(),
        actual_minutes: data.actual_minutes,
        problems_attempted: data.problems_attempted,
        problems_correct: data.problems_correct,
        score_percentage: scorePercentage,
        doubts_raised: data.doubts_raised,
        completion_status: "completed",
      })
      .eq("id", data.session_id)
      .eq("plan_id", data.plan_id)
      .eq("user_id", authUserId)
      .select("id")
      .single();

    if (updateError) throw updateError;
    if (!updatedSession) throw new Error("Session not found or unauthorized");

    const prompt = `Analyze this student's session: Topic: ${data.topic}, Score: ${scorePercentage}%, Time: ${data.actual_minutes} mins, Hints used: ${data.doubts_raised}.
Return ONLY valid JSON with this exact structure:
{
  "status": "struggling" | "on_track" | "excelling",
  "difficulty_next": "easier" | "same" | "harder",
  "insight": "One specific, personalized 1-sentence observation about their performance."
}`;

    const key = getGeminiKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini analysis error: ${response.status} ${errorText}`);
    }

    const geminiJson = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const resultText =
      geminiJson.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
    if (!resultText.trim()) {
      throw new Error("Gemini returned an empty analysis response");
    }

    let analysis;
    try {
      analysis = SessionAnalysisSchema.parse(JSON.parse(extractJsonObject(resultText)));
    } catch (error) {
      throw new Error("Gemini returned invalid JSON analysis");
    }

    return { score_percentage: scorePercentage, analysis };
  });

export const getYoutubeVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      topic: z.string().min(1),
      subject: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const key = getYoutubeKey();
      const query = `${data.topic} ${data.subject} explanation`;
      const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
      searchUrl.searchParams.set("key", key);
      searchUrl.searchParams.set("part", "snippet");
      searchUrl.searchParams.set("type", "video");
      searchUrl.searchParams.set("maxResults", "8");
      searchUrl.searchParams.set("q", query);
      searchUrl.searchParams.set("videoEmbeddable", "true");

      const searchResponse = await fetch(searchUrl);
      if (!searchResponse.ok) return null;

      const searchJson = (await searchResponse.json()) as {
        items?: Array<{ id?: { videoId?: string }; snippet?: { title?: string } }>;
      };
      const candidates =
        searchJson.items?.flatMap((item) =>
          item.id?.videoId
            ? [{ id: item.id.videoId, title: item.snippet?.title ?? "Lesson video" }]
            : [],
        ) ?? [];
      if (!candidates.length) return null;

      const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
      detailsUrl.searchParams.set("key", key);
      detailsUrl.searchParams.set("part", "contentDetails");
      detailsUrl.searchParams.set("id", candidates.map((item) => item.id).join(","));

      const detailsResponse = await fetch(detailsUrl);
      if (!detailsResponse.ok) return candidates[0];

      const detailsJson = (await detailsResponse.json()) as {
        items?: Array<{ id?: string; contentDetails?: { duration?: string } }>;
      };
      const durations = new Map(
        detailsJson.items?.map((item) => [
          item.id,
          parseIsoDuration(item.contentDetails?.duration),
        ]) ?? [],
      );
      return (
        candidates.find((item) => {
          const duration = durations.get(item.id);
          return duration == null || (duration >= 5 && duration <= 25);
        }) ?? null
      );
    } catch {
      return null;
    }
  });

  const ExecuteSessionEndSchema = z.object({
    session_id: z.string().uuid(),
    plan_id: z.string().uuid(),
    topic: z.string().min(1),
    score_percentage: z.number().min(0).max(100),
  });

  export const executeSessionEndPipeline = createServerFn({ method: "POST" })
    .middleware([requireSupabaseAuth])
    .inputValidator(ExecuteSessionEndSchema)
    .handler(async ({ data, context }) => {
      const { supabase, userId: authUserId } = context as {
        supabase: import("@supabase/supabase-js").SupabaseClient;
        userId: string;
      };

      if (!authUserId) throw new Error("Not authenticated");

      // Finalize session
      const { error: updateError } = await supabase
        .from("sessions")
        .update({
          ended_at: new Date().toISOString(),
          score_percentage: data.score_percentage,
          completion_status: "completed",
        })
        .eq("id", data.session_id)
        .eq("user_id", authUserId);

      if (updateError) throw updateError;

      // Adaptation pipeline when score < 50
      if (data.score_percentage < 50) {
        // Find next pending plan item for this user and topic
        const { data: nextPlan, error: findError } = await supabase
          .from("study_plan")
          .select("id, scheduled_date")
          .eq("user_id", authUserId)
          .eq("topic", data.topic)
          .eq("status", "pending")
          .order("scheduled_date", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (findError) throw findError;

        if (nextPlan && nextPlan.id) {
          const { error: updatePlanError } = await supabase
            .from("study_plan")
            .update({ difficulty: "easier" })
            .eq("id", nextPlan.id)
            .eq("user_id", authUserId);
          if (updatePlanError) throw updatePlanError;
        }

        // Insert a new revision task scheduled in 2 days
        const scheduledDate = new Date(Date.now() + 2 * 86400 * 1000)
          .toISOString()
          .slice(0, 10);

        const { error: insertError } = await supabase.from("study_plan").insert({
          user_id: authUserId,
          task_type: "revision",
          topic: data.topic,
          status: "pending",
          difficulty: "easier",
          scheduled_date: scheduledDate,
          created_at: new Date().toISOString(),
        });

        if (insertError) throw insertError;

        // Log adaptation
        const { error: logError } = await supabase.from("adaptation_log").insert({
          user_id: authUserId,
          session_id: data.session_id,
          trigger_type: "struggling",
          action_taken:
            "Lowered future topic difficulty to easier and injected a revision task into the calendar due to low quiz score.",
          created_at: new Date().toISOString(),
        });
        if (logError) throw logError;
      }

      return { ok: true };
    });

  export const getTimeline = createServerFn({ method: "POST" })
    .middleware([requireSupabaseAuth])
    .handler(async ({ context }) => {
      const { supabase, userId } = context as {
        supabase: import("@supabase/supabase-js").SupabaseClient;
        userId: string;
      };

      const { data: plans, error } = await supabase
        .from("study_plan")
        .select(
          "id, topic, difficulty, task_type, status, scheduled_date, subjects(subject_name), syllabus(chapter_name)",
        )
        .eq("user_id", userId)
        .order("scheduled_date", { ascending: true });

      if (error) throw error;
      return { plans: plans ?? [] };
    });

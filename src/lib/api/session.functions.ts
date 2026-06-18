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
        "id, topic, difficulty, task_type, status, pomodoro_work_minutes, pomodoro_break_minutes, goal_id, subject_id, chapter_id, goals(goal_name, exam_date), subjects(subject_name), syllabus(chapter_name)",
      )
      .eq("id", data.taskId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    if (!task) throw new Error("Task not found");

    return task;
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

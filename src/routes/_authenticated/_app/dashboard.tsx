import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, CalendarClock, CheckCircle2, Flame, Sparkles, X, CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

type TaskRow = {
  id: string;
  topic: string | null;
  difficulty: string | null;
  status: string | null;
  scheduled_date: string | null;
  scheduled_start_time: string | null;
  scheduled_end_time: string | null;
  subjects: { subject_name: string | null } | null;
  syllabus: { chapter_name: string | null } | null;
};

type GoalRow = {
  id: string;
  goal_name: string | null;
  exam_date: string | null;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function daysUntil(date: string | null) {
  if (!date) return null;
  const start = new Date(todayIso());
  const end = new Date(date);
  return Math.ceil((end.getTime() - start.getTime()) / 86_400_000);
}

function statusClass(status: string | null) {
  if (status === "completed") return "bg-[#A8B58A]/25 text-[#5F6F45]";
  if (status === "in-progress") return "bg-[#A9B7C6]/25 text-[#2D3A47] dark:text-[#FFF7E6]";
  if (status === "missed") return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200";
  return "bg-[#F7C8D3]/35 text-[#B46A72]";
}

function normalizeStatus(status: string | null, missed = false) {
  if (missed && status !== "completed") return "missed";
  return status ?? "pending";
}

export const Route = createFileRoute("/_authenticated/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Synapse" }] }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [checkInVisible, setCheckInVisible] = useState(true);
  const today = useMemo(todayIso, []);

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", today],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error("Not signed in");

      const [
        { data: profile },
        { data: todaysTasks, error: todayError },
        { data: missedTasks, error: missedError },
        { data: goals, error: goalsError },
        { data: syllabus, error: syllabusError },
        { data: sessions, error: sessionsError },
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase
          .from("study_plan")
          .select(
            "id, topic, difficulty, status, scheduled_date, scheduled_start_time, scheduled_end_time, subjects(subject_name), syllabus(chapter_name)",
          )
          .eq("user_id", userId)
          .eq("scheduled_date", today)
          .order("scheduled_start_time", { ascending: true }),
        supabase
          .from("study_plan")
          .select(
            "id, topic, difficulty, status, scheduled_date, scheduled_start_time, scheduled_end_time, subjects(subject_name), syllabus(chapter_name)",
          )
          .eq("user_id", userId)
          .lt("scheduled_date", today)
          .neq("status", "completed")
          .order("scheduled_date", { ascending: false })
          .order("scheduled_start_time", { ascending: true })
          .limit(20),
        supabase
          .from("goals")
          .select("id, goal_name, exam_date")
          .eq("user_id", userId)
          .eq("status", "active"),
        supabase.from("syllabus").select("id, goal_id, is_completed, topics").eq("user_id", userId),
        supabase.from("sessions").select("goal_id, score_percentage").eq("user_id", userId),
      ]);

      if (todayError) throw todayError;
      if (missedError) throw missedError;
      if (goalsError) throw goalsError;
      if (syllabusError) throw syllabusError;
      if (sessionsError) throw sessionsError;

      return {
        profile: profile as ({ streak?: number | null } & Record<string, unknown>) | null,
        todaysTasks: (todaysTasks ?? []) as TaskRow[],
        missedTasks: (missedTasks ?? []) as TaskRow[],
        goals: (goals ?? []) as GoalRow[],
        syllabus: syllabus ?? [],
        sessions: sessions ?? [],
      };
    },
  });

  const data = dashboardQuery.data;
  const readiness = useMemo(() => {
    return (data?.goals ?? []).map((goal) => {
      const chapters = data?.syllabus.filter((item) => item.goal_id === goal.id) ?? [];
      const totalTopics = chapters.reduce(
        (sum, item) => sum + Math.max(item.topics?.length ?? 0, 1),
        0,
      );
      const completedTopics = chapters
        .filter((item) => item.is_completed)
        .reduce((sum, item) => sum + Math.max(item.topics?.length ?? 0, 1), 0);
      const goalSessions = data?.sessions.filter((session) => session.goal_id === goal.id) ?? [];
      const averageScore = goalSessions.length
        ? goalSessions.reduce((sum, session) => sum + (session.score_percentage ?? 0), 0) /
          goalSessions.length
        : 0;
      const topicScore = totalTopics ? (completedTopics / totalTopics) * 50 : 0;
      return {
        ...goal,
        days: daysUntil(goal.exam_date),
        readiness: Math.min(100, Math.round(topicScore + averageScore * 0.5)),
      };
    });
  }, [data]);

  const openTask = (id: string) => {
    navigate({ to: "/session/$id", params: { id } });
  };

  return (
    <div className="space-y-5 pb-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm italic text-[#B46A72] dark:text-[#F7C8D3]">Today</p>
          <h1 className="font-serif text-4xl font-semibold text-[#2D3A47] dark:text-[#FFF7E6]">
            Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate({ to: "/timeline" })}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
          >
            <CalendarDays className="h-4 w-4" />
            Timeline
          </button>

          <div className="ml-2 flex items-center gap-2 rounded-md border border-[#F7C8D3]/60 bg-white/60 px-3 py-2 text-[#B46A72] shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-[#F7C8D3]">
          <Flame className="h-4 w-4" />
          <span className="text-sm font-semibold">{data?.profile?.streak ?? 0}</span>
          </div>
        </div>
      </header>

      {checkInVisible ? (
        <section className="rounded-lg border border-[#F7C8D3]/70 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#B46A72]" />
              <h2 className="font-serif text-xl font-semibold text-[#2D3A47] dark:text-[#FFF7E6]">
                AI Check-In
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setCheckInVisible(false)}
              className="grid h-8 w-8 place-items-center rounded-md text-[#A9B7C6] transition hover:bg-[#F7C8D3]/25 hover:text-[#B46A72]"
              aria-label="Dismiss check-in"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {[
              "Any new exam dates?",
              "Finished yesterday's tasks?",
              "Any upcoming events?",
              "Got results back?",
            ].map((question) => (
              <button
                key={question}
                type="button"
                className="min-h-12 rounded-md border border-[#F7C8D3]/60 bg-[#FFF7E6]/80 px-3 py-2 text-left text-sm font-medium text-[#2D3A47] transition active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:text-[#FFF7E6]"
              >
                {question}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-[#2D3A47] dark:text-[#FFF7E6]">
            Exam Countdown
          </h2>
          <CalendarClock className="h-5 w-5 text-[#A8B58A]" />
        </div>
        <div className="-mx-4 grid gap-3 px-4 pb-1 md:grid-cols-3">
          {readiness.length ? (
            readiness.map((goal) => (
              <article
                key={goal.id}
                className="w-full rounded-lg border border-[#A8B58A]/40 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
              >
                <p className="line-clamp-1 text-sm font-semibold text-[#2D3A47] dark:text-[#FFF7E6]">
                  {goal.goal_name ?? "Exam"}
                </p>
                <p className="mt-2 text-3xl font-semibold text-[#B46A72]">
                  {goal.days == null ? "—" : Math.max(goal.days, 0)}
                </p>
                <p className="text-xs uppercase tracking-wide text-[#A9B7C6]">days remaining</p>
                <div className="mt-3 h-2 rounded-full bg-[#F7C8D3]/40">
                  <div
                    className="h-full rounded-full bg-[#A8B58A]"
                    style={{ width: `${goal.readiness}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-[#2D3A47]/70 dark:text-[#FFF7E6]/70">
                  {goal.readiness}% readiness
                </p>
              </article>
            ))
          ) : (
            <div className="w-full rounded-lg border border-dashed border-[#F7C8D3]/70 p-4 text-sm text-[#A9B7C6]">
              No active goals yet.
            </div>
          )}
        </div>
      </section>

      {data?.missedTasks.length ? (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-200">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="font-serif text-xl font-semibold">Missed Tasks</h2>
          </div>
          <div className="space-y-2">
            {data.missedTasks.map((task) => (
              <TaskCard key={task.id} task={task} missed onOpen={openTask} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-[#A8B58A]" />
          <h2 className="font-serif text-xl font-semibold text-[#2D3A47] dark:text-[#FFF7E6]">
            Today's Tasks
          </h2>
        </div>
          <div className="grid gap-4 md:grid-cols-2">
          {dashboardQuery.isLoading ? (
            <div className="rounded-lg border border-[#F7C8D3]/60 bg-white/60 p-4 text-sm text-[#A9B7C6]">
              Loading your plan...
            </div>
          ) : data?.todaysTasks.length ? (
            data.todaysTasks.map((task) => <TaskCard key={task.id} task={task} onOpen={openTask} />)
          ) : (
            <div className="rounded-lg border border-dashed border-[#F7C8D3]/70 p-4 text-sm text-[#A9B7C6]">
              Nothing scheduled for today.
            </div>
          )}
          </div>
      </section>
    </div>
  );
}

function TaskCard({
  task,
  missed = false,
  onOpen,
}: {
  task: TaskRow;
  missed?: boolean;
  onOpen: (id: string) => void;
}) {
  const status = normalizeStatus(task.status, missed);

  return (
    <button
      type="button"
      onClick={() => onOpen(task.id)}
      className="w-full rounded-lg border border-[#F7C8D3]/60 bg-white/75 p-4 text-left shadow-sm transition active:scale-[0.99] dark:border-white/10 dark:bg-white/5"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-[#A9B7C6]">
            {task.scheduled_start_time?.slice(0, 5) ?? "Anytime"}
            {task.scheduled_end_time ? `-${task.scheduled_end_time.slice(0, 5)}` : ""}
          </p>
          <h3 className="mt-1 font-serif text-xl font-semibold leading-tight text-[#2D3A47] dark:text-[#FFF7E6]">
            {task.subjects?.subject_name ?? "Study"}
          </h3>
        </div>
        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusClass(status)}`}>
          {status}
        </span>
      </div>
      <p className="text-sm font-medium text-[#2D3A47] dark:text-[#FFF7E6]">
        {task.syllabus?.chapter_name ?? "Chapter"}
      </p>
      <p className="mt-1 text-sm text-[#2D3A47]/70 dark:text-[#FFF7E6]/70">
        {task.topic ?? "Revision"}
      </p>
      <p className="mt-3 text-xs uppercase tracking-wide text-[#B46A72]">
        {task.difficulty ?? "medium"}
      </p>
    </button>
  );
}

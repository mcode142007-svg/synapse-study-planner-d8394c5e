import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Brain, Clock, Play, Send, SkipForward } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import {
  getLearningTask,
  getYoutubeVideo,
  startLearningSession,
} from "@/lib/api/session.functions";
import { useAuthStore } from "@/lib/auth-store";
import { useSessionThreadStore, type SessionThreadMessage } from "@/lib/session-thread-store";
import { AINotesGenerator } from "@/components/session/AINotesGenerator";
import { PomodoroTimer } from "@/components/session/PomodoroTimer";
import ProblemSet from "@/components/session/ProblemSet";
import { Toaster } from "@/components/ui/sonner";

type Task = Awaited<ReturnType<typeof getLearningTask>>;
const EMPTY_THREAD: SessionThreadMessage[] = [];

function relationOne<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

function replaceLastModelMessage(sessionTaskId: string, content: string) {
  useSessionThreadStore.setState((state) => {
    const messages = [...(state.threads[sessionTaskId] ?? [])];
    const lastIndex = messages.length - 1;
    if (lastIndex >= 0 && messages[lastIndex]?.role === "model") {
      messages[lastIndex] = { role: "model", content };
    }
    return { threads: { ...state.threads, [sessionTaskId]: messages } };
  });
}

function renderMarkdown(text: string) {
  return text.split("\n").map((line, index) => {
    if (line.startsWith("### ")) {
      return (
        <h3
          key={index}
          className="mt-4 font-serif text-xl font-semibold text-[#2D3A47] dark:text-[#FFF7E6]"
        >
          {line.slice(4)}
        </h3>
      );
    }
    if (line.startsWith("## ")) {
      return (
        <h2
          key={index}
          className="mt-5 font-serif text-2xl font-semibold text-[#2D3A47] dark:text-[#FFF7E6]"
        >
          {line.slice(3)}
        </h2>
      );
    }
    if (line.startsWith("# ")) {
      return (
        <h1
          key={index}
          className="mt-5 font-serif text-3xl font-semibold text-[#2D3A47] dark:text-[#FFF7E6]"
        >
          {line.slice(2)}
        </h1>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <p key={index} className="pl-4 text-sm leading-7 text-[#2D3A47]/80 dark:text-[#FFF7E6]/80">
          • {line.slice(2)}
        </p>
      );
    }
    return (
      <p key={index} className="min-h-3 text-sm leading-7 text-[#2D3A47]/80 dark:text-[#FFF7E6]/80">
        {line}
      </p>
    );
  });
}

export const Route = createFileRoute("/_authenticated/_app/session/$id")({
  head: () => ({ meta: [{ title: "Learning Session — Synapse" }] }),
  component: SessionRoute,
});

function SessionRoute() {
  const { id } = Route.useParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [video, setVideo] = useState<{ id: string; title: string } | null>(null);
  const [videoChecked, setVideoChecked] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [draft, setDraft] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timerReady, setTimerReady] = useState(false);
  const [pomodoroComplete, setPomodoroComplete] = useState(false);
  const [showProblemSet, setShowProblemSet] = useState(false);
  const authUserId = useAuthStore((state) => state.user?.id ?? "");
  const thread = useSessionThreadStore((state) => state.threads[id] ?? EMPTY_THREAD);
  const appendMessage = useSessionThreadStore((state) => state.appendMessage);

  const taskQuery = useQuery({
    queryKey: ["learning-task", id],
    queryFn: () => getLearningTask({ data: { taskId: id } }),
  });

  const task = taskQuery.data as Task | undefined;
  const subject = relationOne(task?.subjects)?.subject_name ?? "Study";
  const chapter = relationOne(task?.syllabus)?.chapter_name ?? "Chapter";
  const subjectId = task?.subject_id ?? "";
  const chapterId = task?.chapter_id ?? "";
  const goal = relationOne(task?.goals);
  const exam = goal?.goal_name ?? "Exam prep";

  const startMutation = useMutation({
    mutationFn: async () => {
      const started = await startLearningSession({ data: { taskId: id } });
      const foundVideo = await getYoutubeVideo({
        data: { topic: task?.topic ?? "Revision", subject },
      });
      return { started, foundVideo };
    },
    onSuccess: ({ started, foundVideo }) => {
      setSessionId(started.sessionId);
      setVideo(foundVideo);
      setVideoChecked(true);
    },
  });

  const context = useMemo(
    () => ({
      topic: task?.topic ?? "Revision",
      subject,
      exam,
    }),
    [exam, subject, task?.topic],
  );

  async function streamExplanation(question: string, priorThread: SessionThreadMessage[]) {
    setStreaming(true);
    appendMessage(id, { role: "user", content: question });
    appendMessage(id, { role: "model", content: "" });
    try {
      const response = await fetch("/api/gemini-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...context, question, thread: priorThread }),
      });
      if (!response.ok || !response.body) {
        const errorBody = (await response.text().catch(() => "")).trim();
        throw new Error(errorBody || "Explanation stream failed");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        useSessionThreadStore.setState((state) => {
          const messages = [...(state.threads[id] ?? [])];
          const lastIndex = messages.length - 1;
          messages[lastIndex] = { role: "model", content: text };
          return { threads: { ...state.threads, [id]: messages } };
        });
      }
      setShowNotes(true);
    } catch (error) {
      replaceLastModelMessage(
        id,
        error instanceof Error
          ? `I couldn't start the AI explanation: ${error.message}`
          : "I couldn't start the AI explanation.",
      );
    } finally {
      setStreaming(false);
    }
  }

  function handleExplain() {
    if (streaming) return;
    streamExplanation(`Explain ${context.topic} for my ${context.exam} preparation.`, thread);
  }

  function handleFollowUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = draft.trim();
    if (!question || streaming) return;
    setDraft("");
    streamExplanation(question, useSessionThreadStore.getState().threads[id] ?? []);
  }

  return (
    <div className="space-y-5 pb-6">
      <Toaster />
      <header>
        <p className="text-sm italic text-[#B46A72] dark:text-[#F7C8D3]">Learning Session</p>
        <h1 className="font-serif text-4xl font-semibold text-[#2D3A47] dark:text-[#FFF7E6]">
          {subject}
        </h1>
      </header>

      <section className="rounded-lg border border-[#F7C8D3]/70 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
        {taskQuery.isLoading ? (
          <p className="text-sm text-[#A9B7C6]">Loading topic...</p>
        ) : (
          <>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#A9B7C6]">{exam}</p>
                <h2 className="mt-1 font-serif text-2xl font-semibold leading-tight text-[#2D3A47] dark:text-[#FFF7E6]">
                  {task?.topic ?? "Revision"}
                </h2>
              </div>
              <span className="rounded-md bg-[#F7C8D3]/35 px-2 py-1 text-xs font-semibold text-[#B46A72]">
                {task?.difficulty ?? "medium"}
              </span>
            </div>
            <div className="space-y-2 text-sm text-[#2D3A47]/75 dark:text-[#FFF7E6]/75">
              <p className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#A8B58A]" />
                {chapter}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#A8B58A]" />
                {task?.pomodoro_work_minutes ?? 25} min work / {task?.pomodoro_break_minutes ?? 5}{" "}
                min break
              </p>
            </div>
            {!sessionId ? (
              <button
                type="button"
                onClick={() => startMutation.mutate()}
                disabled={startMutation.isPending}
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#B46A72] px-4 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] disabled:opacity-60"
              >
                <Play className="h-4 w-4" />
                {startMutation.isPending ? "Starting..." : "Start Session"}
              </button>
            ) : null}
          </>
        )}
      </section>

      {sessionId ? (
        <section className="space-y-4">
          {video ? (
            <div className="overflow-hidden rounded-lg border border-[#A8B58A]/40 bg-black shadow-sm">
              <div className="aspect-video">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          ) : videoChecked ? null : (
            <div className="rounded-lg border border-[#F7C8D3]/60 bg-white/60 p-4 text-sm text-[#A9B7C6] dark:border-white/10 dark:bg-white/5">
              Looking for a useful video...
            </div>
          )}

          <button
            type="button"
            onClick={handleExplain}
            disabled={streaming}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-[#B46A72]/30 bg-[#FFF7E6]/80 px-4 py-3 text-sm font-semibold text-[#B46A72] transition active:scale-[0.99] disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-[#F7C8D3]"
          >
            <SkipForward className="h-4 w-4" />
            Skip video, explain with AI
          </button>
        </section>
      ) : null}

      {thread.length ? (
        <section className="space-y-3 rounded-lg border border-[#F7C8D3]/70 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-[#B46A72]" />
            <h2 className="font-serif text-xl font-semibold text-[#2D3A47] dark:text-[#FFF7E6]">
              AI Explanation
            </h2>
          </div>
          <div className="space-y-4">
            {thread.map((message, index) => (
              <article
                key={`${message.role}-${index}`}
                className={message.role === "user" ? "rounded-md bg-[#F7C8D3]/25 p-3" : ""}
              >
                {message.role === "user" ? (
                  <p className="text-sm font-semibold text-[#B46A72]">{message.content}</p>
                ) : (
                  <div>{renderMarkdown(message.content || "Thinking...")}</div>
                )}
              </article>
            ))}
          </div>
          <form
            onSubmit={handleFollowUp}
            className="flex gap-2 border-t border-[#F7C8D3]/50 pt-3 dark:border-white/10"
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask a follow-up"
              className="min-h-11 flex-1 rounded-md border border-[#F7C8D3]/60 bg-[#FFF7E6]/80 px-3 text-sm text-[#2D3A47] outline-none ring-[#B46A72]/30 focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-[#FFF7E6]"
            />
            <button
              type="submit"
              disabled={streaming || !draft.trim()}
              className="grid h-11 w-11 place-items-center rounded-md bg-[#B46A72] text-white transition active:scale-95 disabled:opacity-60"
              aria-label="Send follow-up"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      ) : null}

      {showNotes && authUserId && subjectId && chapterId ? (
        <AINotesGenerator
          topic={task?.topic ?? "Revision"}
          subject={subject}
          exam={exam}
          studentLevel={task?.difficulty ?? "medium"}
          language="English"
          userId={authUserId}
          chapterId={chapterId}
          subjectId={subjectId}
          onSaved={() => {
            setShowTimer(true);
          }}
        />
      ) : null}

      {showTimer && task ? (
        <div className="space-y-4">
          <PomodoroTimer
            workMinutes={task?.pomodoro_work_minutes ?? 25}
            breakMinutes={task?.pomodoro_break_minutes ?? 5}
            onPhaseComplete={() => setPomodoroComplete(true)}
            onSkip={() => setPomodoroComplete(true)}
          />
          {pomodoroComplete && !showProblemSet && (
            <button
              type="button"
              onClick={() => setShowProblemSet(true)}
              className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg mt-4"
            >
              Start Problems
            </button>
          )}

          {showProblemSet && (
            <ProblemSet
              topic={task?.topic ?? "Revision"}
              subject={subject}
              chapter={chapter}
              exam={exam}
              userType={task?.user_type ?? "Student"}
              grade={task?.grade ?? 0}
              aiAssessedLevel={task?.ai_assessed_level ?? "medium"}
              difficulty={task?.difficulty ?? "medium"}
              userId={authUserId}
              sessionId={sessionId ?? ""}
              subjectId={subjectId}
              planId={task?.id ?? ""}
              onComplete={(sessionData) => {
                setShowProblemSet(false);
              }}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}

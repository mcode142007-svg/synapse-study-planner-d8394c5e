import { useEffect, useMemo, useRef, useState } from "react";
import { useOnboardingStore, type UploadedSyllabusSubject } from "@/lib/onboarding-store";
import { useAuthStore } from "@/lib/auth-store";
import { supabase } from "@/integrations/supabase/client";
import { getPreloadedSyllabus, type PreloadedSubject } from "@/data/syllabi";
import { extractPdfText } from "@/lib/pdf-extract";
import { parseSyllabusFiles } from "@/lib/api/onboarding.functions";

type Weightage = "high" | "medium" | "low";

type SyllabusToInsert = {
  subjects: Array<{
    subject: string;
    chapters: Array<{
      chapter_number: number;
      chapter_name: string;
      topics: string[];
      weightage: Weightage;
    }>;
  }>;
  source: "preloaded" | "uploaded" | "generated";
};

type SyllabusFilePayload = {
  name: string;
  mimeType: string;
  text?: string;
  base64?: string;
};

function isAcceptedSyllabusFile(file: File) {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".pdf") ||
    name.endsWith(".txt") ||
    file.type === "image/png" ||
    file.type === "image/jpeg" ||
    file.type === "image/jpg"
  );
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function fileToPayload(file: File): Promise<SyllabusFilePayload> {
  if (file.type.startsWith("image/")) {
    return {
      name: file.name,
      mimeType: file.type === "image/jpg" ? "image/jpeg" : file.type,
      base64: await fileToBase64(file),
    };
  }
  if (file.name.toLowerCase().endsWith(".pdf")) {
    return {
      name: file.name,
      mimeType: file.type || "application/pdf",
      text: await extractPdfText(file),
    };
  }
  return {
    name: file.name,
    mimeType: file.type || "text/plain",
    text: await file.text(),
  };
}

async function syllabusExists(userId: string, goalId: string) {
  const { data, error } = await supabase
    .from("syllabus")
    .select("id")
    .eq("user_id", userId)
    .eq("goal_id", goalId)
    .limit(1);
  if (error) throw error;
  return !!(data && data.length > 0);
}

async function insertSyllabus(userId: string, goalId: string, data: SyllabusToInsert) {
  for (const subj of data.subjects) {
    const subjectId = crypto.randomUUID();
    const { error: sErr } = await supabase.from("subjects").upsert(
      {
        id: subjectId,
        user_id: userId,
        goal_id: goalId,
        subject_name: subj.subject,
        current_level: null,
        ai_assessed_level: null,
      },
      { onConflict: "id" },
    );
    if (sErr) throw sErr;

    const rows = subj.chapters.map((c) => ({
      id: crypto.randomUUID(),
      user_id: userId,
      subject_id: subjectId,
      goal_id: goalId,
      chapter_number: c.chapter_number,
      chapter_name: c.chapter_name,
      topics: c.topics,
      source: data.source,
      weightage: c.weightage,
      is_completed: false,
      is_skipped: false,
    }));
    const { error: chErr } = await supabase
      .from("syllabus")
      .upsert(rows, { onConflict: "id", ignoreDuplicates: true });
    if (chErr) throw chErr;
  }
}

function preloadedToInsert(subjects: PreloadedSubject[]): SyllabusToInsert {
  return {
    source: "preloaded",
    subjects: subjects.map((s) => ({
      subject: s.subject,
      chapters: s.chapters.map((c) => ({
        chapter_number: c.chapter_number,
        chapter_name: c.chapter_name,
        topics: c.topics,
        weightage: c.weightage,
      })),
    })),
  };
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[#F7C8D3] bg-white/60 p-4 animate-pulse">
      <div className="h-4 w-2/3 bg-[#F7C8D3]/40 rounded mb-3" />
      <div className="h-3 w-1/2 bg-[#F7C8D3]/30 rounded mb-2" />
      <div className="h-3 w-1/3 bg-[#F7C8D3]/30 rounded" />
    </div>
  );
}

export function Step5Syllabus() {
  const { selectedGoals, midPrepSelected, nextStep, setStep } = useOnboardingStore();
  const user = useAuthStore((s) => s.user);

  // We only need to process non-side-skill goals.
  const goals = useMemo(
    () => selectedGoals.filter((g) => g.goal_type !== "side_skill"),
    [selectedGoals],
  );

  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState<"loading" | "needs_upload" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const processedRef = useRef<Set<number>>(new Set());

  const currentGoal = goals[idx];

  // Auto-process preloaded syllabi for the current goal.
  useEffect(() => {
    if (!user || !currentGoal) return;
    if (processedRef.current.has(idx)) return;
    let cancelled = false;
    (async () => {
      try {
        setStatus("loading");
        setErrorMsg(null);
        const exists = await syllabusExists(user.id, currentGoal.id);
        if (exists) {
          if (cancelled) return;
          processedRef.current.add(idx);
          advance();
          return;
        }
        const preloaded = getPreloadedSyllabus(currentGoal.goal_name);
        if (preloaded) {
          await insertSyllabus(user.id, currentGoal.id, preloadedToInsert(preloaded));
          if (cancelled) return;
          processedRef.current.add(idx);
          advance();
          return;
        }
        // No preloaded match → show upload UI for this goal
        if (cancelled) return;
        setStatus("needs_upload");
      } catch (e) {
        if (cancelled) return;
        setErrorMsg((e as Error).message);
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [idx, user, currentGoal]);

  // All goals done.
  useEffect(() => {
    if (!currentGoal && goals.length > 0) {
      setStatus("success");
      const t = setTimeout(() => {
        if (midPrepSelected) nextStep();
        else setStep(6);
      }, 1500);
      return () => clearTimeout(t);
    }
    if (goals.length === 0) {
      // Nothing to do.
      if (midPrepSelected) nextStep();
      else setStep(6);
    }
  }, [currentGoal, goals.length, midPrepSelected, nextStep, setStep]);

  function advance() {
    setIdx((i) => i + 1);
  }

  const retry = () => {
    processedRef.current.delete(idx);
    setStatus("loading");
    setErrorMsg(null);
    // re-trigger the effect by toggling idx
    setIdx((i) => i);
  };

  if (!currentGoal) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <p
          className="font-serif text-2xl text-center animate-[fadeIn_500ms_ease-out]"
          style={{ color: "#A8B58A" }}
        >
          Your syllabus is ready 🌿
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-32">
        <p className="text-xs italic font-serif text-[#A9B7C6]">
          Goal {idx + 1} of {goals.length}
        </p>

        {status === "loading" && (
          <>
            <h1 className="mt-2 font-serif font-semibold text-2xl text-[#2D3A47]">
              Loading syllabus for{" "}
              <span className="italic text-[#B46A72]">{currentGoal.goal_name}</span>…
            </h1>
            <p className="mt-1 font-serif italic text-[#A9B7C6]">
              Just a moment while we prepare your chapters
            </p>
            <div className="mt-6 space-y-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="mt-2 font-serif font-semibold text-2xl text-[#2D3A47]">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-red-500 font-serif">{errorMsg}</p>
            <button
              onClick={retry}
              className="mt-4 rounded-xl bg-[#B46A72] text-[#FFF7E6] px-4 py-2 font-serif"
            >
              Retry
            </button>
          </>
        )}

        {status === "needs_upload" && currentGoal && (
          <UploadForGoal
            goalName={currentGoal.goal_name}
            onDone={async (data) => {
              if (!user) return;
              try {
                await insertSyllabus(user.id, currentGoal.id, data);
                processedRef.current.add(idx);
                advance();
              } catch (e) {
                setErrorMsg((e as Error).message);
                setStatus("error");
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ---------------- Upload UI for a single goal ---------------- */

function UploadForGoal({
  goalName,
  onDone,
}: {
  goalName: string;
  onDone: (data: SyllabusToInsert) => void | Promise<void>;
}) {
  const [mode, setMode] = useState<"choose" | "upload" | "confirm" | "generating" | "weighting">(
    "choose",
  );
  const [files, setFiles] = useState<File[]>([]);
  const [parsed, setParsed] = useState<UploadedSyllabusSubject[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const preventDropNavigation = (event: DragEvent) => {
      event.preventDefault();
    };
    window.addEventListener("dragover", preventDropNavigation);
    window.addEventListener("drop", preventDropNavigation);
    return () => {
      window.removeEventListener("dragover", preventDropNavigation);
      window.removeEventListener("drop", preventDropNavigation);
    };
  }, []);

  const extractFromFile = async () => {
    if (files.length === 0) return;
    setBusy(true);
    setErr(null);
    try {
      const payload = await Promise.all(files.map(fileToPayload));
      const data = await parseSyllabusFiles({
        data: { goalName, files: payload },
      });
      setParsed(data);
      setMode("confirm");
    } catch (e) {
      setErr((e as Error).message || "Couldn't process your file. Try again or use AI generation.");
    } finally {
      setBusy(false);
    }
  };

  const finalizeFromUploaded = async () => {
    if (!parsed) return;
    setMode("weighting");
    setBusy(true);
    setErr(null);
    try {
      const data: SyllabusToInsert = {
        source: "uploaded",
        subjects: parsed.map((s) => ({
          subject: s.subject,
          chapters: s.chapters.map((c) => ({
            chapter_number: c.chapter_number,
            chapter_name: c.chapter_name,
            topics: c.topics,
            weightage: "medium",
          })),
        })),
      };
      await onDone(data);
    } catch (e) {
      setErr((e as Error).message);
      setMode("confirm");
    } finally {
      setBusy(false);
    }
  };

  const generateWithAI = async () => {
    setMode("generating");
    setBusy(true);
    setErr(null);
    try {
      const data = await parseSyllabusFiles({ data: { goalName, files: [] } });
      const insert: SyllabusToInsert = {
        source: "generated",
        subjects: data.map((s) => ({
          subject: s.subject,
          chapters: s.chapters.map((c, i) => ({
            chapter_number: c.chapter_number ?? i + 1,
            chapter_name: c.chapter_name,
            topics: c.topics ?? [],
            weightage: "medium",
          })),
        })),
      };
      await onDone(insert);
    } catch (e) {
      setErr((e as Error).message || "AI generation failed. Try again.");
      setMode("choose");
    } finally {
      setBusy(false);
    }
  };

  const addFiles = (list: FileList | File[]) => {
    const next = Array.from(list).filter(isAcceptedSyllabusFile);
    setFiles((current) => [...current, ...next]);
  };

  return (
    <div>
      <h1 className="mt-2 font-serif font-semibold text-3xl text-[#2D3A47]">
        Upload your syllabus
      </h1>
      <p className="mt-1 font-serif italic text-[#B46A72]">{goalName}</p>

      {err && <p className="mt-3 text-sm text-red-500 font-serif">{err}</p>}

      {mode === "choose" && (
        <div className="mt-6 space-y-4">
          {/* Option A */}
          <div className="rounded-2xl border-2 border-dashed border-[#F7C8D3] bg-white/60 p-6 text-center">
            <p className="font-serif text-[#2D3A47]">Upload PDF, text, or images</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addFiles(e.dataTransfer.files);
              }}
              className="mt-3 flex min-h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-[#F7C8D3] bg-white/70 px-4 py-6 text-center active:scale-[0.99]"
            >
              <span className="font-serif text-sm text-[#2D3A47]">
                Tap to choose files or drop them here
              </span>
              <span className="mt-1 font-serif text-xs italic text-[#A9B7C6]">
                PDF, TXT, PNG, JPG, JPEG
              </span>
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.txt,image/png,image/jpeg,image/jpg"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.currentTarget.value = "";
              }}
              className="sr-only"
            />
            {files.length > 0 && (
              <div className="mt-3 space-y-1 text-left">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-lg bg-white/70 px-3 py-2"
                  >
                    <p className="min-w-0 truncate text-sm font-serif text-[#A8B58A]">
                      {file.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                      className="shrink-0 text-xs font-serif text-[#B46A72]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              disabled={files.length === 0 || busy}
              onClick={extractFromFile}
              className={`mt-4 w-full rounded-xl bg-[#B46A72] text-[#FFF7E6] py-2 font-serif ${
                files.length === 0 || busy ? "opacity-50" : ""
              }`}
            >
              {busy ? "Extracting..." : "Extract Syllabus"}
            </button>
          </div>

          {/* Option B */}
          <button
            onClick={generateWithAI}
            className="w-full text-left rounded-2xl border-2 border-[#F7C8D3] bg-white/70 p-5"
          >
            <p className="font-serif text-[#2D3A47]">Generate syllabus from AI</p>
            <p className="mt-1 text-sm italic font-serif text-[#A9B7C6]">
              We'll create an estimated chapter order based on your exam
            </p>
          </button>
        </div>
      )}

      {(mode === "generating" || mode === "weighting") && (
        <div className="mt-6 space-y-3">
          <p className="font-serif italic text-[#A9B7C6]">
            {mode === "generating" ? "Generating syllabus…" : "Assigning chapter weightage…"}
          </p>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {mode === "confirm" && parsed && (
        <div className="mt-6">
          <p className="font-serif text-[#2D3A47]">
            We extracted this from your file. Looks correct?
          </p>
          <div className="mt-3 max-h-96 overflow-y-auto rounded-2xl border border-[#F7C8D3] bg-white/70 p-4 space-y-4">
            {parsed.map((s, si) => (
              <div key={si}>
                <p className="font-serif font-semibold text-[#2D3A47]">{s.subject}</p>
                <ul className="mt-1 space-y-2">
                  {s.chapters.map((c, ci) => (
                    <li key={ci} className="ml-3">
                      {editing ? (
                        <input
                          value={c.chapter_name}
                          onChange={(e) => {
                            const next = parsed.map((ss, i) =>
                              i === si
                                ? {
                                    ...ss,
                                    chapters: ss.chapters.map((cc, j) =>
                                      j === ci ? { ...cc, chapter_name: e.target.value } : cc,
                                    ),
                                  }
                                : ss,
                            );
                            setParsed(next);
                          }}
                          className="w-full rounded-md border border-[#F7C8D3] px-2 py-1 text-sm font-serif"
                        />
                      ) : (
                        <p className="font-serif text-sm text-[#2D3A47]">
                          {c.chapter_number}. {c.chapter_name}
                        </p>
                      )}
                      {editing ? (
                        <textarea
                          value={c.topics.join(", ")}
                          onChange={(e) => {
                            const next = parsed.map((ss, i) =>
                              i === si
                                ? {
                                    ...ss,
                                    chapters: ss.chapters.map((cc, j) =>
                                      j === ci
                                        ? {
                                            ...cc,
                                            topics: e.target.value
                                              .split(",")
                                              .map((t) => t.trim())
                                              .filter(Boolean),
                                          }
                                        : cc,
                                    ),
                                  }
                                : ss,
                            );
                            setParsed(next);
                          }}
                          className="mt-1 w-full rounded-md border border-[#F7C8D3] px-2 py-1 text-xs font-serif"
                        />
                      ) : (
                        <p className="text-xs italic font-serif text-[#A9B7C6]">
                          {c.topics.join(", ")}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setEditing((v) => !v)}
              className="flex-1 rounded-xl border border-[#F7C8D3] py-2 font-serif text-[#2D3A47] bg-white/70"
            >
              {editing ? "Done editing" : "Edit"}
            </button>
            <button
              onClick={finalizeFromUploaded}
              disabled={busy}
              className={`flex-1 rounded-xl bg-[#B46A72] text-[#FFF7E6] py-2 font-serif ${
                busy ? "opacity-50" : ""
              }`}
            >
              {busy ? "Saving…" : "Looks correct, save this"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

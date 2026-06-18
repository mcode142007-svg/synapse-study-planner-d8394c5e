import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { executeSessionEndPipeline } from "@/lib/api/session.functions";

type Problem = {
  problem_id: string;
  question_text: string;
  type: "mcq";
  options: [string, string, string, string];
  correct_answer: "A" | "B" | "C" | "D";
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  marks_positive: 4;
  marks_negative: 1;
};

type ProblemSetProps = {
  topic: string;
  subject: string;
  chapter: string;
  exam: string;
  userType: string;
  grade: number;
  aiAssessedLevel: string;
  difficulty: string;
  userId: string;
  sessionId: string;
  subjectId: string;
  planId?: string;
  onComplete: (sessionData: {
    problems_attempted: number;
    problems_correct: number;
    score_percentage: number;
    actual_minutes: number;
  }) => void;
};

type SelectedAnswers = Record<string, "A" | "B" | "C" | "D">;

type HintsUsed = Record<string, number>;

type ProblemReviewState = Record<string, boolean>;

function isValidProblem(value: unknown): value is Problem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  const options = item.options;
  const answer = item.correct_answer;
  const difficulty = item.difficulty;
  return (
    typeof item.problem_id === "string" &&
    typeof item.question_text === "string" &&
    item.type === "mcq" &&
    Array.isArray(options) &&
    options.length === 4 &&
    options.every((opt) => typeof opt === "string") &&
    (answer === "A" || answer === "B" || answer === "C" || answer === "D") &&
    typeof item.explanation === "string" &&
    (difficulty === "easy" || difficulty === "medium" || difficulty === "hard") &&
    item.marks_positive === 4 &&
    item.marks_negative === 1
  );
}

function formatTime(minutes: number) {
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function extractJsonArray(value: string) {
  const cleaned = value
    .replace(/```(?:json)?/gi, "")
    .replace(/`/g, "")
    .trim();

  const firstBracket = cleaned.indexOf("[");
  const lastBracket = cleaned.lastIndexOf("]");
  if (firstBracket === -1 || lastBracket === -1 || lastBracket <= firstBracket) {
    return cleaned;
  }
  return cleaned.slice(firstBracket, lastBracket + 1);
}

function parseProblemArray(result: string) {
  const jsonText = extractJsonArray(result);
  return JSON.parse(jsonText) as unknown;
}

export function ProblemSet({
  topic,
  subject,
  chapter,
  exam,
  userType,
  grade,
  aiAssessedLevel,
  difficulty,
  userId,
  sessionId,
  subjectId,
  planId,
  onComplete,
}: ProblemSetProps) {
  const [problems, setProblems] = useState<Problem[] | null>(null);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  const [hintsUsed, setHintsUsed] = useState<HintsUsed>({});
  const [sessionStartTime] = useState(() => Date.now());
  const [totalScore, setTotalScore] = useState(0);
  const [hintText, setHintText] = useState("");
  const [hintError, setHintError] = useState("");
  const [showHintPanel, setShowHintPanel] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [loadingError, setLoadingError] = useState("");
  const [reviewState, setReviewState] = useState<ProblemReviewState>({});

  const currentProblem = problems?.[currentProblemIndex] ?? null;
  const answeredCount = Object.keys(selectedAnswers).length;
  const problemsCorrect = useMemo(
    () =>
      problems?.reduce((count, problem) => {
        const selected = selectedAnswers[problem.problem_id];
        return count + (selected === problem.correct_answer ? 1 : 0);
      }, 0) ?? 0,
    [problems, selectedAnswers],
  );

  const attempts = 3;
  const totalPoints = 12;

  const loadProblems = useCallback(async () => {
    setIsGenerating(true);
    setLoadingError("");
    try {
      const prompt = `Generate 3 problems for: Student type: ${userType}, Grade: ${grade}, Exam: ${exam}\nSubject: ${subject}, Chapter: ${chapter}, Topic: ${topic}\nCurrent level: ${aiAssessedLevel}\nDifficulty target: ${difficulty}\n\nFor each problem:\n- Question text (clear, single concept focus)\n- 4 multiple choice options (A, B, C, D)\n- Correct answer (letter)\n- Explanation (one sentence why correct)\n- Difficulty level (easy/medium/hard)\n- Marks: positive (4), negative (1) for wrong answer\n\nReturn ONLY valid JSON array, no other text:\n[{
  problem_id, question_text, type: 'mcq', options: ['A text', 'B text', 'C text', 'D text'],
  correct_answer: 'B', explanation: 'string', difficulty: 'medium',
  marks_positive: 4, marks_negative: 1
}]`;

      const fetchResult = async () => {
        const response = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Problem generation failed");
        }

        const json = (await response.json()) as { result: string };
        return json.result ?? "";
      };

      const parseResult = (resultText: string) => {
        try {
          return parseProblemArray(resultText);
        } catch {
          throw new SyntaxError("Unable to parse generated problem JSON");
        }
      };

      let parsed: unknown;
      const rawResult = await fetchResult();
      try {
        parsed = parseResult(rawResult);
      } catch (firstError) {
        const retryResult = await fetchResult();
        try {
          parsed = parseResult(retryResult);
        } catch {
          throw new Error("Unexpected token in response. Try again");
        }
      }

      if (!Array.isArray(parsed) || parsed.length !== 3) {
        throw new Error("Unexpected problem format");
      }
      const validProblems = parsed.filter(isValidProblem) as Problem[];
      if (validProblems.length !== 3) {
        throw new Error("Invalid problem data received");
      }
      setProblems(validProblems);
      setLoadingError("");
    } catch (error) {
      setLoadingError(
        error instanceof Error && error.message === "Unexpected token in response. Try again"
          ? error.message
          : error instanceof Error
          ? error.message
          : "Problem generation failed",
      );
      setProblems(null);
    } finally {
      setIsGenerating(false);
    }
  }, [aiAssessedLevel, chapter, difficulty, exam, grade, subject, topic, userType]);

  const generateHint = useCallback(
    async (problem: Problem, hintNumber: number) => {
      setHintError("");
      setHintText("");
      setIsHintLoading(true);
      try {
        const prompt = `For this problem: ${problem.question_text}, correct answer: ${problem.correct_answer}. This is hint ${hintNumber} of 3. Give ONLY a directional hint — point toward the relevant concept or formula, not the answer itself. One sentence max.`;
        const response = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Hint generation failed");
        }
        const json = (await response.json()) as { result: string };
        setHintText(json.result.trim());
      } catch (error) {
        setHintError("Hint unavailable, try the next one");
      } finally {
        setIsHintLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadProblems();
  }, [loadProblems]);

  const handleAnswer = (choice: "A" | "B" | "C" | "D") => {
    if (!currentProblem || selectedAnswers[currentProblem.problem_id]) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentProblem.problem_id]: choice }));
    const correct = choice === currentProblem.correct_answer;
    setTotalScore((score) => score + (correct ? 4 : -1));
  };

  const handleNextProblem = () => {
    setShowHintPanel(false);
    if (currentProblemIndex < attempts - 1) {
      setCurrentProblemIndex((index) => index + 1);
      return;
    }
    const actualMinutes = Math.round((Date.now() - sessionStartTime) / 60000);
    const scorePercentage = Math.round((totalScore / totalPoints) * 100);
    onComplete({
      problems_attempted: attempts,
      problems_correct: problemsCorrect,
      score_percentage: scorePercentage,
      actual_minutes: actualMinutes,
    });
  };

  const navigate = useNavigate();

  const handleFinish = async () => {
    const actualMinutes = Math.round((Date.now() - sessionStartTime) / 60000);
    const scorePercentage = Math.round((totalScore / totalPoints) * 100);

    try {
      await executeSessionEndPipeline({
        session_id: sessionId,
        plan_id: planId ?? "",
        topic,
        score_percentage: scorePercentage,
      });
    } catch (e) {
      console.error("Pipeline failed", e);
    }

    // Navigate to timeline after pipeline
    navigate({ to: "/timeline" });
  };

  const handleContinueToSessionEnd = async () => {
    const actualMinutes = Math.round((Date.now() - sessionStartTime) / 60000);
    const scorePercentage = Math.round((totalScore / totalPoints) * 100);

    try {
      if (typeof window !== "undefined" && scorePercentage < 50) {
        localStorage.setItem(
          "synapse_demo_revision",
          JSON.stringify({
            id: `demo-mock-${Date.now()}`,
            task_type: "revision",
            topic: topic || "Current Topic",
            subject: subject || "Current Subject",
            difficulty: "easier",
            scheduled_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
            status: "pending",
            reason: "Poor Score",
          }),
        );
      }
    } catch (error) {
      console.error("Adaptation insert failed", error);
    }

    navigate({ to: "/timeline" });
  };

  const handleStuck = async () => {
    if (!currentProblem) return;
    const hintCount = hintsUsed[currentProblem.problem_id] ?? 0;
    const nextHint = Math.min(hintCount + 1, 3);
    setHintsUsed((prev) => ({ ...prev, [currentProblem.problem_id]: nextHint }));
    setShowHintPanel(true);
    await generateHint(currentProblem, nextHint);
  };

  const currentAnswer = currentProblem ? selectedAnswers[currentProblem.problem_id] : undefined;
  const isCorrect = currentProblem ? currentAnswer === currentProblem.correct_answer : false;
  const hasAnswered = currentProblem ? !!currentAnswer : false;
  const hintCount = currentProblem ? hintsUsed[currentProblem.problem_id] ?? 0 : 0;
  const showSeeSolution = hintCount >= 3;

  const summary = useMemo(() => {
    if (!problems) return null;
    const accuracy = Math.round((problemsCorrect / attempts) * 100);
    const actualMinutes = Math.round((Date.now() - sessionStartTime) / 60000);
    return { score: totalScore, accuracy, actualMinutes };
  }, [problems, problemsCorrect, sessionStartTime, totalScore]);

  if (isGenerating) {
    return (
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <p className="text-sm text-[#6B7280]">Generating practice problems...</p>
        <div className="mt-5 space-y-3">
          <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-4/6 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="rounded-3xl border border-[#FECACA] bg-[#FFF1F2] p-6 shadow-sm">
        <p className="text-sm font-semibold text-[#991B1B]">{loadingError}</p>
        <button
          type="button"
          onClick={loadProblems}
          className="mt-4 rounded-full bg-[#B45309] px-4 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!problems || problems.length === 0) {
    return null;
  }

  if (answeredCount >= attempts && currentProblemIndex >= attempts) {
    return null;
  }

  const allAnswered = answeredCount >= attempts;

  if (allAnswered) {
    const actualMinutes = Math.round((Date.now() - sessionStartTime) / 60000);
    const accuracy = Math.round((problemsCorrect / attempts) * 100);
    return (
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-[#111827]">Practice review</h2>
          <p className="text-sm text-[#6B7280]">You’ve completed all 3 problems.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
            <p className="text-sm text-[#6B7280]">Total score</p>
            <p className="mt-2 text-3xl font-semibold text-[#111827]">{totalScore} / 12</p>
          </div>
          <div className="rounded-3xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
            <p className="text-sm text-[#6B7280]">Accuracy</p>
            <p className="mt-2 text-3xl font-semibold text-[#111827]">{accuracy}%</p>
          </div>
          <div className="rounded-3xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
            <p className="text-sm text-[#6B7280]">Time taken</p>
            <p className="mt-2 text-3xl font-semibold text-[#111827]">{actualMinutes} min</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {problems.map((problem, index) => {
            const selected = selectedAnswers[problem.problem_id];
            const correct = selected === problem.correct_answer;
            return (
              <button
                key={problem.problem_id}
                type="button"
                onClick={() =>
                  setReviewState((prev) => ({
                    ...prev,
                    [problem.problem_id]: !prev[problem.problem_id],
                  }))
                }
                className="w-full rounded-3xl border border-[#E5E7EB] bg-white p-4 text-left shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-[#6B7280]">Problem {index + 1}</p>
                    <p className="mt-1 font-semibold text-[#111827]">{problem.question_text}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${correct ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {correct ? "Correct" : "Incorrect"}
                  </span>
                </div>
                {reviewState[problem.problem_id] ? (
                  <div className="mt-4 space-y-2 rounded-3xl bg-[#F8FAFC] p-4 text-sm text-[#374151]">
                    <p>
                      <span className="font-semibold">Your answer:</span> {selected}
                    </p>
                    <p>
                      <span className="font-semibold">Correct answer:</span> {problem.correct_answer}
                    </p>
                    <p>
                      <span className="font-semibold">Explanation:</span> {problem.explanation}
                    </p>
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleContinueToSessionEnd}
          className="mt-6 w-full rounded-3xl bg-[#B46A72] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#9D4EDD]"
        >
          Continue to session end
        </button>
      </div>
    );
  }

  if (!currentProblem) {
    return null;
  }

  const optionLetters: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];

  return (
    <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#111827]">Score: {totalScore} / 12</p>
          <p className="text-xs text-[#6B7280]">Problem {currentProblemIndex + 1} of 3</p>
        </div>
        <button
          type="button"
          onClick={handleStuck}
          className="rounded-full border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
        >
          I&apos;m Stuck
        </button>
      </div>

      <div className="rounded-3xl border border-[#E5E7EB] bg-[#F8FAFC] p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#6B7280]">{currentProblem.difficulty}</p>
        <h2 className="mt-3 text-xl font-semibold text-[#111827]">{currentProblem.question_text}</h2>
      </div>

      <div className="mt-6 grid gap-3">
        {optionLetters.map((letter, index) => {
          const optionText = currentProblem.options[index];
          const selected = currentAnswer === letter;
          const isCorrectOption = currentProblem.correct_answer === letter;
          const wrongSelection = hasAnswered && selected && !isCorrect;
          const correctSelection = hasAnswered && isCorrectOption;
          const buttonClass = hasAnswered
            ? wrongSelection
              ? "bg-rose-50 border-rose-300 text-rose-700"
              : correctSelection
              ? "bg-emerald-50 border-emerald-300 text-emerald-700"
              : "bg-white border-[#E5E7EB] text-[#111827]"
            : "bg-white border-[#E5E7EB] text-[#111827] hover:bg-[#F9FAFB]";
          return (
            <button
              key={letter}
              type="button"
              onClick={() => handleAnswer(letter)}
              disabled={hasAnswered}
              className={`rounded-3xl border px-4 py-4 text-left text-sm font-semibold shadow-sm transition ${buttonClass}`}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6] text-sm font-bold text-[#111827]">
                  {letter}
                </span>
                <span>{optionText}</span>
              </div>
              {hasAnswered && selected ? (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  {isCorrect ? (
                    <span className="text-emerald-700">✓ Correct</span>
                  ) : (
                    <span className="text-rose-700">✕ Incorrect</span>
                  )}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      {hasAnswered ? (
        <div className="mt-6 rounded-3xl border border-[#E5E7EB] bg-[#F8FAFC] p-5 text-sm text-[#374151]">
          <p className="font-semibold text-[#111827]">Explanation</p>
          <p className="mt-2">{currentProblem.explanation}</p>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {hasAnswered ? (
          <button
            type="button"
            onClick={handleNextProblem}
            className="w-full rounded-3xl bg-[#B46A72] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#9D4EDD] sm:w-auto"
          >
            {currentProblemIndex < attempts - 1 ? "Next problem" : "Finish problems"}
          </button>
        ) : null}
        <p className="text-sm text-[#6B7280]">{`Selected: ${currentAnswer ?? "None"}`}</p>
      </div>

      {showHintPanel ? (
        <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-[#E5E7EB] bg-white p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#6B7280]">Here&apos;s a hint</p>
              <p className="mt-2 text-sm text-[#111827]">Hint {hintCount} of 3</p>
            </div>
            <button
              type="button"
              onClick={() => setShowHintPanel(false)}
              className="rounded-full border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#111827]"
            >
              Close
            </button>
          </div>
          <div className="min-h-[84px] rounded-3xl border border-[#E5E7EB] bg-[#F8FAFC] p-4 text-sm text-[#374151]">
            {isHintLoading ? (
              <p>Loading hint…</p>
            ) : hintError ? (
              <p>{hintError}</p>
            ) : (
              <p>{hintText || "Hint will appear here."}</p>
            )}
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowHintPanel(false)}
              className="rounded-full border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-semibold text-[#111827] hover:bg-[#F9FAFB]"
            >
              {showSeeSolution ? "See solution" : "Try again"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ProblemSet;

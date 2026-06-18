import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

type SessionSummaryProps = {
  scorePercentage: number;
  actualMinutes: number;
  doubtsRaised: number;
  insight: string;
  sessionId: string;
  planId: string;
  userId: string;
  subject: string;
  topic: string;
};

export function SessionSummary({
  scorePercentage,
  actualMinutes,
  doubtsRaised,
  insight,
  sessionId,
  planId,
  userId,
  subject,
  topic,
}: SessionSummaryProps) {
  const navigate = useNavigate();

  const handleComplete = () => {
    console.log({
      sessionId,
      planId,
      userId,
      actualMinutes,
      scorePercentage,
      doubtsRaised,
      subject,
      topic,
    });
    navigate({ to: "/_authenticated/_app/dashboard" });
  };

  return (
    <div className="space-y-6 rounded-3xl border border-[#E5E7EB] bg-white/90 p-6 shadow-lg shadow-slate-200/40 dark:border-white/10 dark:bg-slate-950/80 dark:shadow-none">
      <div className="flex items-center gap-3 rounded-3xl bg-[#EEF2FF] p-4 dark:bg-[#1E293B]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[#4338CA] dark:text-[#A5B4FC]">
            Session summary
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[#111827] dark:text-white">
            Well done — you finished your review.
          </h2>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-[#E5E7EB] bg-[#F8FAFC] p-5 dark:border-white/10 dark:bg-slate-900">
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Score</p>
          <p className="mt-3 text-3xl font-semibold text-[#111827] dark:text-white">
            {scorePercentage}%
          </p>
        </div>
        <div className="rounded-3xl border border-[#E5E7EB] bg-[#F8FAFC] p-5 dark:border-white/10 dark:bg-slate-900">
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Time spent</p>
          <p className="mt-3 text-3xl font-semibold text-[#111827] dark:text-white">
            {actualMinutes} min
          </p>
        </div>
        <div className="rounded-3xl border border-[#E5E7EB] bg-[#F8FAFC] p-5 dark:border-white/10 dark:bg-slate-900">
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Hints used</p>
          <p className="mt-3 text-3xl font-semibold text-[#111827] dark:text-white">
            {doubtsRaised}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-[#D6E4FF] bg-[#EEF2FF] p-6 shadow-sm dark:border-[#334155]/40 dark:bg-[#0F172A]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4338CA] dark:text-[#A5B4FC]">
          Personalized insight
        </p>
        <p className="mt-4 text-lg leading-8 text-[#111827] dark:text-slate-100">{insight}</p>
      </div>

      <button
        type="button"
        onClick={handleComplete}
        className="w-full rounded-3xl bg-[#4338CA] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#3730A3]"
      >
        Complete & Return to Dashboard
      </button>
    </div>
  );
}

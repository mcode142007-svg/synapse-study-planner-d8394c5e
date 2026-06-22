import { useEffect, useMemo, useState } from "react";

type PomodoroTimerProps = {
  workMinutes: number;
  breakMinutes: number;
  onPhaseComplete: (phase: "work" | "break") => void;
  onSkip: () => void;
};

type Phase = "work" | "break" | "ready";

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function PomodoroTimer({
  workMinutes,
  breakMinutes,
  onPhaseComplete,
  onSkip,
}: PomodoroTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("work");
  const [customWork, setCustomWork] = useState(workMinutes);
  const [customBreak, setCustomBreak] = useState(breakMinutes);
  const [secondsLeft, setSecondsLeft] = useState(workMinutes * 60);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setCustomWork(workMinutes);
    setCustomBreak(breakMinutes);
    if (phase === "work") {
      setSecondsLeft(workMinutes * 60);
    } else if (phase === "break") {
      setSecondsLeft(breakMinutes * 60);
    }
  }, [workMinutes, breakMinutes]);

  useEffect(() => {
    if (!isRunning) return;
    if (phase === "ready") return;
    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          if (phase === "work") {
            setPhase("break");
            const nextSeconds = customBreak * 60;
            setSecondsLeft(nextSeconds);
            setIsRunning(true);
            onPhaseComplete("work");
          } else {
            setPhase("ready");
            setIsRunning(false);
            onPhaseComplete("break");
          }
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRunning, phase, customBreak, onPhaseComplete]);

  const radius = 92;
  const circumference = 2 * Math.PI * radius;
  const progress = useMemo(() => {
    const total = phase === "work" ? customWork * 60 : customBreak * 60;
    if (total <= 0) return 0;
    return (secondsLeft / total) * circumference;
  }, [phase, customWork, customBreak, secondsLeft, circumference]);

  const buttonLabel = phase === "ready" ? "Ready for problems?" : isRunning ? "Pause" : "Start";

  return (
    <div className="space-y-6 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <div className="mx-auto flex h-[240px] w-[240px] items-center justify-center rounded-full bg-[#F8FAFC] shadow-inner">
        <svg className="h-[220px] w-[220px]" viewBox="0 0 220 220">
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="10"
          />
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="#A855F7"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            transform="rotate(-90 110 110)"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-base uppercase tracking-[0.25em] text-[#6B7280]">
            {phase === "ready" ? "Ready" : phase === "work" ? "Work" : "Break"}
          </span>
          <span className="mt-2 text-4xl font-semibold text-[#111827]">
            {phase === "ready" ? "00:00" : formatTime(secondsLeft)}
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className="inline-flex h-12 items-center justify-center rounded-full bg-[#7C3AED] px-5 text-base font-semibold text-white transition hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => {
            if (phase === "ready") return;
            if (isRunning) {
              setIsRunning(false);
            } else {
              setIsRunning(true);
            }
          }}
        >
          {buttonLabel}
        </button>
        <button
          type="button"
          className="inline-flex h-12 items-center justify-center rounded-full border border-[#D1D5DB] bg-white px-5 text-base font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
          onClick={() => {
            setIsRunning(false);
          }}
        >
          Pause
        </button>
        <button
          type="button"
          className="inline-flex h-12 items-center justify-center rounded-full border border-[#D1D5DB] bg-white px-5 text-base font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
          onClick={() => {
            setIsRunning(false);
            setPhase("ready");
            setSecondsLeft(0);
            onSkip();
          }}
        >
          Skip Timer
        </button>
        <button
          type="button"
          className="inline-flex h-12 items-center justify-center rounded-full bg-[#F3F4F6] px-5 text-base font-semibold text-[#111827] transition hover:bg-[#E5E7EB]"
          onClick={() => setShowModal(true)}
        >
          Adjust
        </button>
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-[#111827]">Adjust timer</h3>
            <div className="mt-4 space-y-4">
              <label className="block text-sm text-[#374151]">
                Work minutes
                <input
                  type="number"
                  min={1}
                  value={customWork}
                  onChange={(event) => setCustomWork(Number(event.target.value))}
                  className="mt-2 w-full rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-2 text-sm outline-none"
                />
              </label>
              <label className="block text-sm text-[#374151]">
                Break minutes
                <input
                  type="number"
                  min={1}
                  value={customBreak}
                  onChange={(event) => setCustomBreak(Number(event.target.value))}
                  className="mt-2 w-full rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-2 text-sm outline-none"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-full border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-full bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6D28D9]"
                onClick={() => {
                  setShowModal(false);
                  setPhase("work");
                  setSecondsLeft(customWork * 60);
                  setIsRunning(true);
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

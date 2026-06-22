import { useEffect, useMemo, useState } from "react";
import { useOnboardingStore, type SelectedGoal } from "@/lib/onboarding-store";
import { useAuthStore } from "@/lib/auth-store";
import { supabase } from "@/integrations/supabase/client";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type Timeline =
  | "this_year"
  | "next_year"
  | "in_2"
  | "in_3"
  | "in_4"
  | "unknown";

function calcPriority(examDate: string | null, examYear: number | null) {
  const now = new Date();
  const target = examDate
    ? new Date(examDate)
    : examYear
      ? new Date(examYear, 0, 1)
      : null;
  if (!target) return 3;
  const days = Math.round((target.getTime() - now.getTime()) / 86400000);
  if (days <= 180) return 1;
  if (days <= 540) return 2;
  return 3;
}

function defaultExamDate(name: string): string {
  const today = new Date();
  const y = today.getFullYear();
  const mk = (m: number, d: number, year = y) =>
    new Date(year, m, d).toISOString().slice(0, 10);
  const passed = (m: number, d: number) =>
    today > new Date(y, m, d) ? mk(m, d, y + 1) : mk(m, d, y);
  if (name === "JEE Main") return passed(3, 15);
  if (name === "NEET") return passed(4, 5);
  if (name.includes("Board") || name.includes("Pre-Boards"))
    return mk(2, 1, y + 1);
  if (name === "CAT") return passed(10, 24);
  if (name === "GATE") return mk(1, 2, y + 1);
  if (name === "CUET") return passed(4, 15);
  if (name === "SSC CGL") return passed(3, 10);
  if (name === "UPSC") return passed(5, 1);
  if (["SBI PO", "IBPS PO", "RBI Grade B"].includes(name)) return passed(9, 1);
  return mk(11, 31, y + 1);
}

export function Step4Timeline() {
  const {
    selectedGoals,
    setSelectedGoals,
    step4GoalIndex,
    setStep4GoalIndex,
    nextStep,
  } = useOnboardingStore();
  const user = useAuthStore((s) => s.user);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Skip side_skills automatically — set defaults and bump index
  useEffect(() => {
    let idx = step4GoalIndex;
    let goals = selectedGoals;
    let changed = false;
    while (idx < goals.length && goals[idx].goal_type === "side_skill") {
      goals = goals.map((g, i) =>
        i === idx
          ? { ...g, exam_date: null, exam_year: null, priority: 2 }
          : g,
      );
      idx += 1;
      changed = true;
    }
    if (changed) {
      setSelectedGoals(goals);
      setStep4GoalIndex(idx);
    }
  }, [step4GoalIndex, selectedGoals, setSelectedGoals, setStep4GoalIndex]);

  const goal: SelectedGoal | undefined = selectedGoals[step4GoalIndex];

  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [knowsDate, setKnowsDate] = useState<boolean | null>(null);
  const [exactDate, setExactDate] = useState("");

  // reset local state when goal changes
  useEffect(() => {
    setTimeline(null);
    setMonth(null);
    setKnowsDate(null);
    setExactDate("");
    setError(null);
  }, [step4GoalIndex]);

  const isAcademic = goal?.goal_type === "academic";

  const options: { id: Timeline; label: string }[] = isAcademic
    ? [
        { id: "this_year", label: "This Year" },
        { id: "unknown", label: "I don't know yet" },
      ]
    : [
        { id: "this_year", label: "This Year" },
        { id: "next_year", label: "Next Year" },
        { id: "in_2", label: "In 2 Years" },
        { id: "in_3", label: "In 3 Years" },
        { id: "in_4", label: "In 4+ Years" },
        { id: "unknown", label: "I don't know yet" },
      ];

  const canContinue = useMemo(() => {
    if (!timeline) return false;
    if (timeline === "this_year") {
      if (isAcademic) return true;
      if (month === null) return false;
      if (knowsDate === null) return false;
      if (knowsDate && !exactDate) return false;
      return true;
    }
    if (timeline === "next_year") return month !== null;
    return true;
  }, [timeline, month, knowsDate, exactDate, isAcademic]);

  const computeGoalUpdate = (): { exam_date: string | null; exam_year: number | null } => {
    const y = new Date().getFullYear();
    if (!goal) return { exam_date: null, exam_year: null };
    if (timeline === "this_year") {
      if (isAcademic) {
        const d = new Date();
        d.setMonth(d.getMonth() + 3);
        return { exam_date: d.toISOString().slice(0, 10), exam_year: d.getFullYear() };
      }
      if (knowsDate && exactDate) {
        return { exam_date: exactDate, exam_year: new Date(exactDate).getFullYear() };
      }
      return { exam_date: null, exam_year: y };
    }
    if (timeline === "next_year") return { exam_date: null, exam_year: y + 1 };
    if (timeline === "in_2") return { exam_date: null, exam_year: y + 2 };
    if (timeline === "in_3") return { exam_date: null, exam_year: y + 3 };
    if (timeline === "in_4") return { exam_date: null, exam_year: y + 4 };
    // unknown
    if (isAcademic) {
      const d = new Date();
      d.setMonth(d.getMonth() + 3);
      return { exam_date: d.toISOString().slice(0, 10), exam_year: d.getFullYear() };
    }
    const ed = defaultExamDate(goal.goal_name);
    return { exam_date: ed, exam_year: new Date(ed).getFullYear() };
  };

  const totalNonSkill = selectedGoals.filter((g) => g.goal_type !== "side_skill").length;
  const currentNonSkillIndex =
    selectedGoals.slice(0, step4GoalIndex).filter((g) => g.goal_type !== "side_skill").length + 1;
  const isLast =
    selectedGoals
      .slice(step4GoalIndex + 1)
      .every((g) => g.goal_type === "side_skill");

  const onNext = async () => {
    if (!canContinue || !goal) return;
    const upd = computeGoalUpdate();
    const priority = calcPriority(upd.exam_date, upd.exam_year);
    const updated = selectedGoals.map((g, i) =>
      i === step4GoalIndex ? { ...g, ...upd, priority } : g,
    );
    setSelectedGoals(updated);

    // Persist the just-edited goal immediately via UPSERT so an
    // edit-then-back-out cannot leave stale timeline data behind.
    if (user) {
      const currentGoal = updated[step4GoalIndex];
      await supabase.from("goals").upsert(
        {
          id: currentGoal.id,
          user_id: user.id,
          goal_type: currentGoal.goal_type,
          goal_name: currentGoal.goal_name,
          exam_date: currentGoal.exam_date,
          exam_year: currentGoal.exam_year,
          priority: currentGoal.priority,
          status: "active",
        },
        { onConflict: "id" },
      );
    }

    if (!isLast) {
      setStep4GoalIndex(step4GoalIndex + 1);
      return;
    }

    // batch upsert (covers any side_skill rows defaulted in the effect above)
    if (!user) return;
    setSaving(true);
    setError(null);
    const rows = updated.map((g) => ({
      id: g.id,
      user_id: user.id,
      goal_type: g.goal_type,
      goal_name: g.goal_name,
      exam_date: g.exam_date,
      exam_year: g.exam_year,
      priority: g.priority,
      status: "active",
    }));
    const { error: insErr } = await supabase
      .from("goals")
      .upsert(rows, { onConflict: "id" });
    setSaving(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    nextStep();
  };

  if (!goal) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <p className="italic text-[#B46A72] text-base">No goals to schedule.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-32">
        <p className="text-sm italic text-[#6B7280]">
          Goal {currentNonSkillIndex} of {totalNonSkill}
        </p>
        <h1 className="mt-2 font-serif font-semibold text-3xl text-[#2D3A47]">
          When are you appearing for{" "}
          <span className="italic text-[#B46A72]">{goal.goal_name}</span>?
        </h1>
        <p className="mt-1 italic text-[#6B7280] text-base">
          This helps us set the right pace
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {options.map((opt) => {
            const sel = timeline === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setTimeline(opt.id);
                  setMonth(null);
                  setKnowsDate(null);
                  setExactDate("");
                }}
                className={`w-full rounded-2xl border-2 p-4 text-left font-serif text-[#2D3A47] active:scale-[0.99] transition ${
                  sel ? "border-[#B46A72] bg-[#F7C8D3]/20" : "border-[#F7C8D3] bg-white/70"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {(timeline === "this_year" || timeline === "next_year") && !isAcademic && (
          <div className="mt-5">
            <p className="text-[#2D3A47] text-base">Which month?</p>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {MONTHS.map((m, i) => (
                <button
                  key={m}
                  onClick={() => setMonth(i)}
                  className={`shrink-0 rounded-full px-4 py-2 border text-base transition ${
                    month === i
                      ? "bg-[#B46A72] text-[#FFF7E6] border-[#B46A72]"
                      : "border-[#F7C8D3] text-[#2D3A47] bg-white/60"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {timeline === "this_year" && !isAcademic && month !== null && (
          <div className="mt-5">
            <p className="text-[#2D3A47] text-base">Do you know the exact date?</p>
            <div className="mt-2 flex gap-2">
              {[
                { v: true, l: "Yes" },
                { v: false, l: "No" },
              ].map((o) => (
                <button
                  key={o.l}
                  onClick={() => setKnowsDate(o.v)}
                  className={`rounded-full px-5 py-2 border text-base transition ${
                    knowsDate === o.v
                      ? "bg-[#B46A72] text-[#FFF7E6] border-[#B46A72]"
                      : "border-[#F7C8D3] text-[#2D3A47] bg-white/60"
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
            {knowsDate === true && (
              <input
                type="date"
                value={exactDate}
                onChange={(e) => setExactDate(e.target.value)}
                className="mt-3 rounded-xl py-3 px-4 text-base border border-[#F7C8D3] bg-white/80 w-full font-serif"
              />
            )}
          </div>
        )}

        {error && (
          <p className="mt-4 italic text-base text-[#B46A72]">{error}</p>
        )}
      </div>

      <button
        disabled={!canContinue || saving}
        onClick={onNext}
        className={`fixed bottom-6 left-4 right-4 z-20 bg-[#B46A72] text-[#FFF7E6] rounded-xl py-3 font-semibold text-lg shadow-sm transition ${
          !canContinue || saving ? "opacity-50" : ""
        }`}
      >
        {saving ? "Saving…" : isLast ? "Continue" : "Next Goal →"}
      </button>
    </div>
  );
}
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/lib/auth-store";
import { useOnboardingStore } from "@/lib/onboarding-store";

type SubjectRow = {
  id: string;
  subject_name: string | null;
  current_level: string | null;
};

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export function Step7SubjectLevels() {
  const user = useAuthStore((s) => s.user);
  const selectedGoals = useOnboardingStore((s) => s.selectedGoals);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [levels, setLevels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const goalIds = useMemo(
    () => selectedGoals.filter((goal) => goal.goal_type !== "side_skill").map((goal) => goal.id),
    [selectedGoals],
  );

  useEffect(() => {
    if (!user || goalIds.length === 0) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error: loadError } = await supabase
        .from("subjects")
        .select("id, subject_name, current_level")
        .eq("user_id", user.id)
        .in("goal_id", goalIds)
        .order("subject_name", { ascending: true });
      if (cancelled) return;
      if (loadError) {
        setError(loadError.message);
      } else {
        setSubjects(data ?? []);
        setLevels(
          Object.fromEntries(
            (data ?? [])
              .filter((subject) => subject.current_level)
              .map((subject) => [subject.id, subject.current_level!]),
          ),
        );
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [goalIds, user]);

  const canContinue = subjects.length > 0 && subjects.every((subject) => levels[subject.id]);

  const chooseLevel = async (subjectId: string, level: string) => {
    setLevels((current) => ({ ...current, [subjectId]: level }));
    setSavingId(subjectId);
    setError(null);
    const { error: saveError } = await supabase
      .from("subjects")
      .update({ current_level: level, ai_assessed_level: level })
      .eq("id", subjectId);
    setSavingId(null);
    if (saveError) setError(saveError.message);
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32">
        <h1 className="font-serif font-semibold text-3xl text-[#2D3A47]">
          Where are you starting?
        </h1>
        <p className="mt-1 font-serif italic text-[#B46A72]">Rate each subject honestly</p>

        {loading ? (
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-28 rounded-2xl border border-[#F7C8D3] bg-white/60 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {subjects.map((subject) => (
              <div key={subject.id} className="rounded-2xl border border-[#F7C8D3] bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-serif font-semibold text-[#2D3A47]">{subject.subject_name}</p>
                  {savingId === subject.id && (
                    <p className="text-xs italic font-serif text-[#A9B7C6]">Saving</p>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {LEVELS.map((level) => {
                    const selected = levels[subject.id] === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => chooseLevel(subject.id, level)}
                        className={`min-h-11 rounded-xl border px-2 text-sm font-serif transition ${
                          selected
                            ? "border-[#B46A72] bg-[#B46A72] text-[#FFF7E6]"
                            : "border-[#F7C8D3] bg-white/70 text-[#2D3A47]"
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <p className="mt-4 font-serif italic text-sm text-[#B46A72]">{error}</p>}
      </div>

      <button
        disabled={!canContinue}
        onClick={nextStep}
        className={`fixed bottom-6 left-4 right-4 z-20 bg-[#B46A72] text-[#FFF7E6] rounded-xl py-3 font-serif font-semibold text-lg shadow-sm transition ${
          !canContinue ? "opacity-50" : ""
        }`}
      >
        Continue
      </button>
    </div>
  );
}

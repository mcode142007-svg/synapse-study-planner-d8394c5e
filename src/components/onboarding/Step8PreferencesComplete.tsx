import { useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/lib/auth-store";
import { generateStudyPlan } from "@/lib/api/onboarding.functions";
import { useOnboardingStore } from "@/lib/onboarding-store";

type PlanPreviewItem = {
  id: string;
  topic: string | null;
  scheduled_date: string | null;
  scheduled_start_time: string | null;
  scheduled_end_time: string | null;
  task_type: string | null;
  estimated_minutes: number | null;
  subjects?: { subject_name?: string | null } | Array<{ subject_name?: string | null }> | null;
  syllabus?: { chapter_name?: string | null } | Array<{ chapter_name?: string | null }> | null;
};

const LANGUAGES = [
  { id: "english", label: "English" },
  { id: "hinglish", label: "Hinglish" },
  { id: "hindi", label: "Hindi" },
];

function relationName<T extends Record<string, unknown>>(value: T | T[] | null | undefined) {
  if (!value) return null;
  return Array.isArray(value) ? value[0] : value;
}

export function Step8PreferencesComplete() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const router = useRouter();
  const { hoursPerDay, languagePreference, parentContact, guardianMode, setField } =
    useOnboardingStore();
  const [parentEnabled, setParentEnabled] = useState(guardianMode || !!parentContact);
  const [plan, setPlan] = useState<PlanPreviewItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = plan.slice(0, 14);

  const onGenerate = async () => {
    if (!user || generating) return;
    setGenerating(true);
    setError(null);
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        language_preference: languagePreference,
        parent_contact: parentEnabled ? parentContact : null,
        guardian_mode: parentEnabled,
      })
      .eq("id", user.id);
    if (profileError) {
      setGenerating(false);
      setError(profileError.message);
      return;
    }

    try {
      const result = await generateStudyPlan({ data: { hoursPerDay } });
      setPlan(result.plan as PlanPreviewItem[]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const onConfirm = async () => {
    await router.invalidate();
    await navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32">
        <h1 className="font-serif font-semibold text-3xl text-[#2D3A47]">Finish your setup</h1>
        <p className="mt-1 font-serif italic text-[#B46A72]">We will generate your first 30 days</p>

        {plan.length === 0 ? (
          <>
            <p className="mt-6 text-xs italic font-serif text-[#A9B7C6] uppercase tracking-wide">
              Language
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {LANGUAGES.map((language) => {
                const selected = languagePreference === language.id;
                return (
                  <button
                    key={language.id}
                    type="button"
                    onClick={() => setField("languagePreference", language.id)}
                    className={`min-h-11 rounded-xl border px-2 text-sm font-serif transition ${
                      selected
                        ? "border-[#B46A72] bg-[#B46A72] text-[#FFF7E6]"
                        : "border-[#F7C8D3] bg-white/70 text-[#2D3A47]"
                    }`}
                  >
                    {language.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-[#F7C8D3] bg-white/70 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-serif text-[#2D3A47]">Parent notifications</p>
                  <p className="mt-1 text-xs italic font-serif text-[#A9B7C6]">
                    Optional progress nudges
                  </p>
                </div>
                <Switch checked={parentEnabled} onCheckedChange={setParentEnabled} />
              </div>
              {parentEnabled && (
                <input
                  type="text"
                  value={parentContact}
                  onChange={(event) => setField("parentContact", event.target.value)}
                  placeholder="Email or phone"
                  className="mt-4 rounded-xl py-3 px-4 text-base border border-[#F7C8D3] bg-white/80 w-full font-serif"
                />
              )}
            </div>
          </>
        ) : (
          <div className="mt-6">
            <h2 className="font-serif font-semibold text-2xl text-[#2D3A47]">Your plan is ready</h2>
            <p className="mt-1 font-serif italic text-[#A9B7C6]">Preview the first 7 days</p>
            <div className="mt-4 grid gap-3">
              {preview.map((item) => {
                const subject = relationName(item.subjects)?.subject_name;
                const chapter = relationName(item.syllabus)?.chapter_name;
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#F7C8D3] bg-white/75 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs italic font-serif text-[#A9B7C6]">
                          {item.scheduled_date} · {item.scheduled_start_time}
                        </p>
                        <p className="mt-1 font-serif font-semibold text-[#2D3A47]">
                          {subject ?? "Study"} · {item.topic}
                        </p>
                      </div>
                      <p className="shrink-0 rounded-full bg-[#A8B58A]/20 px-3 py-1 text-xs font-serif text-[#2D3A47]">
                        {item.estimated_minutes ?? 0}m
                      </p>
                    </div>
                    <p className="mt-2 text-xs italic font-serif text-[#A9B7C6]">
                      {chapter ?? item.task_type ?? "Practice"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {error && <p className="mt-4 font-serif italic text-sm text-[#B46A72]">{error}</p>}
      </div>

      {plan.length === 0 ? (
        <button
          disabled={generating || (parentEnabled && !parentContact.trim())}
          onClick={onGenerate}
          className={`fixed bottom-6 left-4 right-4 z-20 bg-[#B46A72] text-[#FFF7E6] rounded-xl py-3 font-serif font-semibold text-lg shadow-sm transition ${
            generating || (parentEnabled && !parentContact.trim()) ? "opacity-50" : ""
          }`}
        >
          {generating ? "Generating plan..." : "Generate my plan"}
        </button>
      ) : (
        <button
          onClick={onConfirm}
          className="fixed bottom-6 left-4 right-4 z-20 bg-[#B46A72] text-[#FFF7E6] rounded-xl py-3 font-serif font-semibold text-lg shadow-sm transition"
        >
          Looks good, take me to dashboard
        </button>
      )}
    </div>
  );
}

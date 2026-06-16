import { useEffect, useMemo, useRef, useState } from "react";
import { SelectableCard } from "./SelectableCard";
import { useOnboardingStore } from "@/lib/onboarding-store";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/lib/auth-store";
import { clearGoalsAndDownstream } from "@/lib/onboarding-cascade";

const USER_TYPES = [
  { id: "school", icon: "🎒", label: "School Student" },
  { id: "college", icon: "🎓", label: "College Student" },
  { id: "working", icon: "💼", label: "Working Professional" },
  { id: "self", icon: "📖", label: "Self Learner" },
];

const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);
const COLLEGE_YEARS = [1, 2, 3, 4, 5];

export function Step1WhoAreYou() {
  const {
    userType,
    grade,
    collegeYear,
    degree,
    guardianMode,
    parentContact,
    setField,
    nextStep,
    resetGoalsBranch,
  } = useOnboardingStore();
  const user = useAuthStore((s) => s.user);
  const [saving, setSaving] = useState(false);
  const [showGuardianToggle, setShowGuardianToggle] = useState(false);
  // Snapshot the userType at the moment this step mounts so we can detect edits.
  const initialUserTypeRef = useRef<string>(userType);

  // Lock guardian mode on for grades 1-4
  useEffect(() => {
    if (userType === "school" && grade !== null) {
      if (grade <= 4) {
        setField("guardianMode", true);
        setShowGuardianToggle(false);
      } else {
        setShowGuardianToggle(true);
      }
    }
  }, [userType, grade, setField]);

  const canContinue = useMemo(() => {
    if (!userType) return false;
    if (userType === "school") {
      if (grade === null) return false;
      if (grade >= 5 && guardianMode && !parentContact.trim()) return false;
      return true;
    }
    if (userType === "college") {
      return collegeYear !== null && degree.trim().length > 0;
    }
    return true;
  }, [userType, grade, guardianMode, parentContact, collegeYear, degree]);

  const selectType = (id: string) => {
    setField("userType", id);
    // reset follow-ups
    setField("grade", null);
    setField("collegeYear", null);
    setField("degree", "");
    setField("guardianMode", false);
    setField("parentContact", "");
  };

  const onContinue = async () => {
    if (!canContinue || !user || saving) return;
    setSaving(true);
    const payload = {
      id: user.id,
      user_type: userType,
      grade: userType === "school" ? grade : null,
      college_year: userType === "college" ? collegeYear : null,
      degree: userType === "college" ? degree : null,
      guardian_mode: userType === "school" ? guardianMode : false,
      parent_contact:
        userType === "school" && guardianMode ? parentContact : null,
    };
    const initial = initialUserTypeRef.current;
    const userTypeChanged = !!initial && initial !== userType;
    if (userTypeChanged) {
      // Cascade: nuke goals + subjects + syllabus and reset goals-branch state.
      await clearGoalsAndDownstream(user.id);
      resetGoalsBranch();
    }
    const { error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" });
    setSaving(false);
    if (!error) {
      initialUserTypeRef.current = userType;
      nextStep();
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32">
        <h1 className="font-serif font-semibold text-3xl text-[#2D3A47]">
          Who are you?
        </h1>
        <p className="mt-1 font-serif italic text-[#B46A72]">
          Help us personalise your experience
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {USER_TYPES.map((t) => (
            <SelectableCard
              key={t.id}
              selected={userType === t.id}
              onClick={() => selectType(t.id)}
            >
              <span className="text-3xl">{t.icon}</span>
              <span className="font-serif font-semibold text-[#2D3A47] text-center text-base leading-tight">
                {t.label}
              </span>
            </SelectableCard>
          ))}
        </div>

        {/* Follow-ups */}
        <div
          className="overflow-hidden transition-all duration-300"
          style={{ maxHeight: userType === "school" ? 600 : 0 }}
        >
          <div className="mt-6">
            <p className="font-serif text-[#2D3A47] text-lg">
              Which grade are you in?
            </p>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => setField("grade", g)}
                  className={`shrink-0 rounded-full px-4 py-2 border font-serif text-sm transition ${
                    grade === g
                      ? "bg-[#B46A72] text-[#FFF7E6] border-[#B46A72]"
                      : "border-[#F7C8D3] text-[#2D3A47] bg-white/60"
                  }`}
                >
                  Grade {g}
                </button>
              ))}
            </div>
            {grade !== null && grade <= 4 && (
              <div className="mt-4 rounded-2xl border border-[#A8B58A]/40 bg-[#A8B58A]/10 p-4">
                <p className="font-serif italic text-[#A8B58A]">
                  Guardian mode is enabled for your safety 🌿
                </p>
              </div>
            )}
            {grade !== null && grade >= 5 && showGuardianToggle && (
              <div className="mt-4 rounded-2xl border border-[#F7C8D3]/40 bg-white/70 backdrop-blur p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-serif font-semibold text-[#2D3A47]">
                      Enable Guardian Mode?
                    </p>
                    <p className="font-serif italic text-sm text-[#A9B7C6] mt-1">
                      A parent or guardian will receive weekly summaries
                    </p>
                  </div>
                  <button
                    onClick={() => setField("guardianMode", !guardianMode)}
                    role="switch"
                    aria-checked={guardianMode}
                    className={`relative w-12 h-7 rounded-full transition shrink-0 ${
                      guardianMode ? "bg-[#B46A72]" : "bg-[#F7C8D3]/60"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform ${
                        guardianMode ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: guardianMode ? 100 : 0 }}
                >
                  <input
                    type="text"
                    value={parentContact}
                    onChange={(e) => setField("parentContact", e.target.value)}
                    placeholder="Parent's WhatsApp number or email"
                    className="mt-3 rounded-xl py-3 px-4 text-base border border-[#F7C8D3] bg-white/80 w-full font-serif"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className="overflow-hidden transition-all duration-300"
          style={{ maxHeight: userType === "college" ? 400 : 0 }}
        >
          <div className="mt-6">
            <p className="font-serif text-[#2D3A47] text-lg">
              Which year are you in?
            </p>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {COLLEGE_YEARS.map((y) => (
                <button
                  key={y}
                  onClick={() => setField("collegeYear", y)}
                  className={`shrink-0 rounded-full px-4 py-2 border font-serif text-sm transition ${
                    collegeYear === y
                      ? "bg-[#B46A72] text-[#FFF7E6] border-[#B46A72]"
                      : "border-[#F7C8D3] text-[#2D3A47] bg-white/60"
                  }`}
                >
                  {y === 1 ? "1st" : y === 2 ? "2nd" : y === 3 ? "3rd" : `${y}th`} year
                </button>
              ))}
            </div>
            <p className="mt-5 font-serif text-[#2D3A47] text-lg">
              What are you studying?
            </p>
            <input
              type="text"
              value={degree}
              onChange={(e) => setField("degree", e.target.value)}
              placeholder="e.g. B.Tech Computer Science"
              className="mt-3 rounded-xl py-3 px-4 text-base border border-[#F7C8D3] bg-white/80 w-full font-serif"
            />
          </div>
        </div>
      </div>

      <button
        disabled={!canContinue || saving}
        onClick={onContinue}
        className={`fixed bottom-6 left-4 right-4 z-20 bg-[#B46A72] text-[#FFF7E6] rounded-xl py-3 font-serif font-semibold text-lg shadow-sm transition ${
          !canContinue || saving ? "opacity-50" : ""
        }`}
      >
        {saving ? "Saving…" : "Continue"}
      </button>
    </div>
  );
}
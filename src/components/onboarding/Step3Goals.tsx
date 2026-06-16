import { useMemo, useRef, useState } from "react";
import { useOnboardingStore, type SelectedGoal } from "@/lib/onboarding-store";
import { useAuthStore } from "@/lib/auth-store";
import { clearGoalsAndDownstream } from "@/lib/onboarding-cascade";

type Chip = { label: string; type: SelectedGoal["goal_type"] };

function Chips({
  items,
  selectedNames,
  toggle,
  disabledNames,
}: {
  items: Chip[];
  selectedNames: Set<string>;
  toggle: (c: Chip) => void;
  disabledNames?: Set<string>;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {items.map((c) => {
        const sel = selectedNames.has(c.label);
        const disabled = disabledNames?.has(c.label) && !sel;
        return (
          <button
            key={c.label}
            type="button"
            onClick={() => !disabled && toggle(c)}
            title={disabled ? "Complete or drop one skill to add another" : undefined}
            className={`rounded-full px-4 py-2 border text-sm font-serif active:scale-95 transition-all duration-150 ${
              sel
                ? "bg-[#B46A72] text-[#FFF7E6] border-[#B46A72]"
                : "border-[#F7C8D3] bg-white/70 text-[#2D3A47]"
            } ${disabled ? "opacity-40 pointer-events-none" : ""}`}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 text-xs italic font-serif text-[#A9B7C6] uppercase tracking-wide">
      {children}
    </p>
  );
}

function SubSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 text-sm italic font-serif text-[#A9B7C6]">{children}</p>
  );
}

export function Step3Goals() {
  const { userType, grade, selectedGoals, setSelectedGoals, nextStep } =
    useOnboardingStore();
  const user = useAuthStore((s) => s.user);
  const [saving, setSaving] = useState(false);
  // Snapshot the goal signature at mount so we can detect edits on Continue.
  const initialSigRef = useRef<string>(
    selectedGoals
      .map((g) => `${g.goal_type}:${g.goal_name}`)
      .sort()
      .join("|"),
  );

  const [otherExamName, setOtherExamName] = useState("");
  const [languageName, setLanguageName] = useState("");
  const [otherSkillName, setOtherSkillName] = useState("");
  const [codingSubs, setCodingSubs] = useState<string[]>([]);
  const [codingOther, setCodingOther] = useState("");

  const selectedNames = useMemo(
    () => new Set(selectedGoals.map((g) => g.goal_name.split(" — ")[0])),
    [selectedGoals],
  );

  const academicChips: Chip[] = useMemo(() => {
    if (userType === "school" && grade !== null) {
      if (grade <= 8)
        return [
          { label: "Unit Tests", type: "academic" },
          { label: "Half Yearly Exams", type: "academic" },
          { label: "Annual Exams", type: "academic" },
        ];
      return [
        { label: "Unit Tests", type: "academic" },
        { label: "Half Yearly Exams", type: "academic" },
        { label: "Pre-Boards", type: "academic" },
        { label: "Board Exams", type: "academic" },
      ];
    }
    if (userType === "college") {
      return [
        { label: "Mid-Semester Exams", type: "academic" },
        { label: "End-Semester Exams", type: "academic" },
        { label: "Internal Assessments", type: "academic" },
        { label: "Viva / Practicals", type: "academic" },
      ];
    }
    return [];
  }, [userType, grade]);

  const showAcademic = academicChips.length > 0;

  const competitive: Record<string, Chip[]> = {
    Engineering: ["JEE Main", "JEE Advanced", "BITSAT", "VITEEE", "IAT"].map(
      (l) => ({ label: l, type: "competitive" }),
    ),
    Medical: [{ label: "NEET", type: "competitive" }],
    Design: ["NIFT", "NID", "UCEED"].map((l) => ({ label: l, type: "competitive" })),
    Management: ["CAT", "XAT", "SNAP"].map((l) => ({ label: l, type: "competitive" })),
    Government: ["GATE", "UPSC", "SSC CGL", "SSC CHSL", "SBI PO", "IBPS PO", "RBI Grade B"].map(
      (l) => ({ label: l, type: "competitive" }),
    ),
    Undergraduate: [{ label: "CUET", type: "competitive" }],
    International: ["SAT", "IELTS", "TOEFL", "GRE", "GMAT"].map((l) => ({
      label: l,
      type: "competitive",
    })),
  };

  const showOlympiads =
    userType === "school" && grade !== null && grade >= 1 && grade <= 12;
  const olympiads: Chip[] = [
    "IMO",
    "NSO",
    "IEO",
    "SOF Olympiad",
    "Unified Council Olympiad",
  ].map((l) => ({ label: l, type: "competitive" }));

  const sideSkills: Chip[] = [
    { label: "Coding", type: "side_skill" },
    { label: "Data Science", type: "side_skill" },
    { label: "UI/UX Design", type: "side_skill" },
    { label: "Personal Finance", type: "side_skill" },
    { label: "Language Learning", type: "side_skill" },
    { label: "Other Skill", type: "side_skill" },
  ];

  const sideSkillCount = selectedGoals.filter((g) => g.goal_type === "side_skill").length;
  const sideSkillDisabled = sideSkillCount >= 2 ? new Set(sideSkills.map((s) => s.label)) : undefined;

  const otherSelected = selectedGoals.some((g) => g.goal_type === "other");
  const codingSelected = selectedNames.has("Coding");
  const langSelected = selectedNames.has("Language Learning");
  const otherSkillSelected = selectedNames.has("Other Skill");

  const upsertGoal = (chip: Chip, nameOverride?: string) => {
    const baseLabel = chip.label;
    const existing = selectedGoals.find(
      (g) => g.goal_name === baseLabel || g.goal_name.startsWith(`${baseLabel} — `),
    );
    if (existing && nameOverride === undefined) {
      setSelectedGoals(selectedGoals.filter((g) => g.id !== existing.id));
      if (baseLabel === "Coding") setCodingSubs([]);
      if (baseLabel === "Language Learning") setLanguageName("");
      if (baseLabel === "Other Skill") setOtherSkillName("");
      return;
    }
    const name = nameOverride ?? baseLabel;
    if (existing) {
      setSelectedGoals(
        selectedGoals.map((g) =>
          g.id === existing.id ? { ...g, goal_name: name } : g,
        ),
      );
    } else {
      setSelectedGoals([
        ...selectedGoals,
        {
          id: crypto.randomUUID(),
          goal_type: chip.type,
          goal_name: name,
          exam_date: null,
          exam_year: null,
          priority: null,
        },
      ]);
    }
  };

  const toggleOther = () => {
    const existing = selectedGoals.find((g) => g.goal_type === "other");
    if (existing) {
      setSelectedGoals(selectedGoals.filter((g) => g.id !== existing.id));
      setOtherExamName("");
    } else {
      setSelectedGoals([
        ...selectedGoals,
        {
          id: crypto.randomUUID(),
          goal_type: "other",
          goal_name: "",
          exam_date: null,
          exam_year: null,
          priority: null,
        },
      ]);
    }
  };

  const updateOtherName = (v: string) => {
    setOtherExamName(v);
    const existing = selectedGoals.find((g) => g.goal_type === "other");
    if (existing) {
      setSelectedGoals(
        selectedGoals.map((g) =>
          g.id === existing.id ? { ...g, goal_name: v } : g,
        ),
      );
    }
  };

  const toggleCodingSub = (sub: string) => {
    const next = codingSubs.includes(sub)
      ? codingSubs.filter((s) => s !== sub)
      : [...codingSubs, sub];
    setCodingSubs(next);
    const parts = next.map((s) =>
      s === "Other" && codingOther.trim() ? `Other (${codingOther.trim()})` : s,
    );
    const display = parts.length ? `Coding — ${parts.join(", ")}` : "Coding";
    upsertGoal({ label: "Coding", type: "side_skill" }, display);
  };

  const updateCodingOther = (v: string) => {
    setCodingOther(v);
    if (!codingSubs.includes("Other")) return;
    const parts = codingSubs.map((s) =>
      s === "Other" && v.trim() ? `Other (${v.trim()})` : s,
    );
    const display = parts.length ? `Coding — ${parts.join(", ")}` : "Coding";
    upsertGoal({ label: "Coding", type: "side_skill" }, display);
  };

  const updateLanguage = (v: string) => {
    setLanguageName(v);
    upsertGoal(
      { label: "Language Learning", type: "side_skill" },
      v ? `Language Learning — ${v}` : "Language Learning",
    );
  };

  const updateOtherSkill = (v: string) => {
    setOtherSkillName(v);
    upsertGoal(
      { label: "Other Skill", type: "side_skill" },
      v ? `Other Skill — ${v}` : "Other Skill",
    );
  };

  const canContinue = useMemo(() => {
    if (selectedGoals.length === 0) return false;
    if (otherSelected && !otherExamName.trim()) return false;
    if (codingSelected && codingSubs.length === 0) return false;
    if (codingSelected && codingSubs.includes("Other") && !codingOther.trim())
      return false;
    if (langSelected && !languageName.trim()) return false;
    if (otherSkillSelected && !otherSkillName.trim()) return false;
    return true;
  }, [
    selectedGoals,
    otherSelected,
    otherExamName,
    codingSelected,
    codingSubs,
    codingOther,
    langSelected,
    languageName,
    otherSkillSelected,
    otherSkillName,
  ]);

  const onContinue = async () => {
    if (!canContinue || saving) return;
    const currentSig = selectedGoals
      .map((g) => `${g.goal_type}:${g.goal_name}`)
      .sort()
      .join("|");
    const changed = !!initialSigRef.current && currentSig !== initialSigRef.current;
    if (changed && user) {
      setSaving(true);
      // Wipe stale goals + dependent subjects/syllabus so Step 4 re-inserts fresh.
      await clearGoalsAndDownstream(user.id);
      // Regenerate ids so the upcoming upsert in Step 4 creates fresh rows.
      setSelectedGoals(
        selectedGoals.map((g) => ({ ...g, id: crypto.randomUUID() })),
      );
      setSaving(false);
    }
    initialSigRef.current = currentSig;
    nextStep();
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32">
        <h1 className="font-serif font-semibold text-3xl text-[#2D3A47]">
          What are you preparing for?
        </h1>
        <p className="mt-1 font-serif italic text-[#B46A72]">
          Select all that apply
        </p>

        {showAcademic && (
          <>
            <SectionLabel>Academic Goals</SectionLabel>
            <Chips items={academicChips} selectedNames={selectedNames} toggle={upsertGoal} />
          </>
        )}

        <SectionLabel>Competitive Goals</SectionLabel>
        {Object.entries(competitive).map(([cat, items]) => (
          <div key={cat}>
            <SubSectionLabel>{cat}</SubSectionLabel>
            <Chips items={items} selectedNames={selectedNames} toggle={upsertGoal} />
          </div>
        ))}
        {showOlympiads && (
          <div>
            <SubSectionLabel>Olympiads</SubSectionLabel>
            <Chips items={olympiads} selectedNames={selectedNames} toggle={upsertGoal} />
          </div>
        )}
        <div>
          <SubSectionLabel>Other</SubSectionLabel>
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              type="button"
              onClick={toggleOther}
              className={`rounded-full px-4 py-2 border text-sm font-serif active:scale-95 transition-all duration-150 ${
                otherSelected
                  ? "bg-[#B46A72] text-[#FFF7E6] border-[#B46A72]"
                  : "border-[#F7C8D3] bg-white/70 text-[#2D3A47]"
              }`}
            >
              My exam isn't listed
            </button>
          </div>
          <div
            className="overflow-hidden transition-all duration-300"
            style={{ maxHeight: otherSelected ? 100 : 0 }}
          >
            <input
              type="text"
              value={otherExamName}
              onChange={(e) => updateOtherName(e.target.value)}
              placeholder="Tell us your exam name"
              className="mt-3 rounded-xl py-3 px-4 text-base border border-[#F7C8D3] bg-white/80 w-full font-serif"
            />
          </div>
        </div>

        <SectionLabel>Side Skills</SectionLabel>
        <p className="text-xs italic font-serif text-[#A9B7C6] mt-1">
          Maximum 2 active at a time
        </p>
        <Chips
          items={sideSkills}
          selectedNames={selectedNames}
          toggle={upsertGoal}
          disabledNames={sideSkillDisabled}
        />

        <div
          className="overflow-hidden transition-all duration-300"
          style={{ maxHeight: codingSelected ? 400 : 0 }}
        >
          <SubSectionLabel>Which area of coding?</SubSectionLabel>
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              "Python",
              "Web Development",
              "DSA",
              "C++",
              "Java",
              "Machine Learning",
              "Android Development",
              "iOS Development",
              "Game Development",
              "Cybersecurity",
              "Cloud Computing",
              "Blockchain",
              "Other",
            ].map((s) => {
              const sel = codingSubs.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleCodingSub(s)}
                  className={`rounded-full px-4 py-2 border text-sm font-serif active:scale-95 transition-all duration-150 ${
                    sel
                      ? "bg-[#B46A72] text-[#FFF7E6] border-[#B46A72]"
                      : "border-[#F7C8D3] bg-white/70 text-[#2D3A47]"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {codingSubs.includes("Other") && (
            <input
              type="text"
              value={codingOther}
              onChange={(e) => updateCodingOther(e.target.value)}
              placeholder="Specify your coding interest"
              className="mt-3 rounded-xl py-3 px-4 text-base border border-[#F7C8D3] bg-white/80 w-full font-serif"
            />
          )}
        </div>

        <div
          className="overflow-hidden transition-all duration-300"
          style={{ maxHeight: langSelected ? 100 : 0 }}
        >
          <input
            type="text"
            value={languageName}
            onChange={(e) => updateLanguage(e.target.value)}
            placeholder="Which language?"
            className="mt-3 rounded-xl py-3 px-4 text-base border border-[#F7C8D3] bg-white/80 w-full font-serif"
          />
        </div>

        <div
          className="overflow-hidden transition-all duration-300"
          style={{ maxHeight: otherSkillSelected ? 100 : 0 }}
        >
          <input
            type="text"
            value={otherSkillName}
            onChange={(e) => updateOtherSkill(e.target.value)}
            placeholder="What skill?"
            className="mt-3 rounded-xl py-3 px-4 text-base border border-[#F7C8D3] bg-white/80 w-full font-serif"
          />
        </div>
      </div>

      <button
        disabled={!canContinue || saving}
        onClick={onContinue}
        className={`fixed bottom-6 left-4 right-4 z-20 bg-[#B46A72] text-[#FFF7E6] rounded-xl py-3 font-serif font-semibold text-lg shadow-sm transition ${
          !canContinue || saving ? "opacity-50" : ""
        }`}
      >
        {saving ? "Updating…" : "Continue"}
      </button>
    </div>
  );
}
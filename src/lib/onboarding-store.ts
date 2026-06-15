import { create } from "zustand";

export type OnboardingField =
  | "userType"
  | "grade"
  | "collegeYear"
  | "degree"
  | "guardianMode"
  | "parentContact"
  | "midPrepSelected";

export const TOTAL_STEPS = 8;

export type SelectedGoal = {
  id: string;
  goal_type: "academic" | "competitive" | "side_skill" | "other";
  goal_name: string;
  exam_date: string | null;
  exam_year: number | null;
  priority: number | null;
};

type OnboardingState = {
  currentStep: number;
  userType: string;
  grade: number | null;
  collegeYear: number | null;
  degree: string;
  guardianMode: boolean;
  parentContact: string;
  midPrepSelected: boolean | null;
  selectedGoals: SelectedGoal[];
  setSelectedGoals: (goals: SelectedGoal[]) => void;
  step4GoalIndex: number;
  setStep4GoalIndex: (i: number) => void;
  setField: <K extends OnboardingField>(
    key: K,
    value: OnboardingState[K],
  ) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  hydrate: (partial: Partial<OnboardingState>) => void;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 1,
  userType: "",
  grade: null,
  collegeYear: null,
  degree: "",
  guardianMode: false,
  parentContact: "",
  midPrepSelected: null,
  selectedGoals: [],
  setSelectedGoals: (goals) => set({ selectedGoals: goals }),
  step4GoalIndex: 0,
  setStep4GoalIndex: (i) => set({ step4GoalIndex: i }),
  setField: (key, value) => set({ [key]: value } as never),
  setStep: (step) => set({ currentStep: step }),
  nextStep: () =>
    set((s) => ({ currentStep: Math.min(TOTAL_STEPS, s.currentStep + 1) })),
  prevStep: () => set((s) => ({ currentStep: Math.max(1, s.currentStep - 1) })),
  hydrate: (partial) => set(partial),
}));
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

type OnboardingState = {
  currentStep: number;
  userType: string;
  grade: number | null;
  collegeYear: number | null;
  degree: string;
  guardianMode: boolean;
  parentContact: string;
  midPrepSelected: boolean | null;
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
  setField: (key, value) => set({ [key]: value } as never),
  setStep: (step) => set({ currentStep: step }),
  nextStep: () =>
    set((s) => ({ currentStep: Math.min(TOTAL_STEPS, s.currentStep + 1) })),
  prevStep: () => set((s) => ({ currentStep: Math.max(1, s.currentStep - 1) })),
  hydrate: (partial) => set(partial),
}));
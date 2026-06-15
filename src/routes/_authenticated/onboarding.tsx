import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Leaves } from "@/components/Leaves";
import { ProgressHeader } from "@/components/onboarding/ProgressHeader";
import { Step1WhoAreYou } from "@/components/onboarding/Step1WhoAreYou";
import { Step2Journey } from "@/components/onboarding/Step2Journey";
import { Step3Goals } from "@/components/onboarding/Step3Goals";
import { Step4Timeline } from "@/components/onboarding/Step4Timeline";
import { useOnboardingStore } from "@/lib/onboarding-store";
import { useAuthStore } from "@/lib/auth-store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/onboarding")({
  beforeLoad: ({ context }) => {
    const ctx = context as { onboardingComplete?: boolean };
    if (ctx.onboardingComplete) throw redirect({ to: "/dashboard" });
  },
  component: OnboardingPage,
});

function OnboardingPage() {
  const user = useAuthStore((s) => s.user);
  const {
    currentStep,
    prevStep,
    hydrate,
    step4GoalIndex,
    setStep4GoalIndex,
  } = useOnboardingStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [{ data: profile }, { data: goals }] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "user_type, grade, college_year, degree, guardian_mode, parent_contact",
          )
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("goals")
          .select("id, goal_type, goal_name, exam_date, exam_year, priority")
          .eq("user_id", user.id),
      ]);
      if (cancelled) return;

      const hasProfile = !!(profile && profile.user_type);
      const hasGoals = !!(goals && goals.length > 0);

      const patch: Parameters<typeof hydrate>[0] = {};
      if (hasProfile) {
        patch.userType = profile!.user_type ?? "";
        patch.grade = profile!.grade ?? null;
        patch.collegeYear = profile!.college_year ?? null;
        patch.degree = profile!.degree ?? "";
        patch.guardianMode = !!profile!.guardian_mode;
        patch.parentContact = profile!.parent_contact ?? "";
      }
      if (hasGoals) {
        patch.selectedGoals = goals!.map((g) => ({
          id: g.id,
          goal_type: (g.goal_type ?? "other") as SelectedGoal["goal_type"],
          goal_name: g.goal_name ?? "",
          exam_date: g.exam_date ?? null,
          exam_year: g.exam_year ?? null,
          priority: g.priority ?? null,
        }));
        patch.midPrepSelected = true;
      }

      // Resume from earliest incomplete step
      let resumeStep = 1;
      if (hasProfile) resumeStep = 2;
      if (hasGoals) resumeStep = 5;
      patch.currentStep = resumeStep;

      hydrate(patch);
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, hydrate]);

  const onBack = () => {
    if (currentStep === 4 && step4GoalIndex > 0) {
      setStep4GoalIndex(step4GoalIndex - 1);
      return;
    }
    if (currentStep === 4) setStep4GoalIndex(0);
    prevStep();
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <Leaves />
      <div className="relative z-10 flex flex-col min-h-screen max-w-md w-full mx-auto">
        <ProgressHeader onBack={onBack} />
        {hydrated ? (
          <>
            {currentStep === 1 && <Step1WhoAreYou />}
            {currentStep === 2 && <Step2Journey />}
            {currentStep === 3 && <Step3Goals />}
            {currentStep === 4 && <Step4Timeline />}
            {currentStep > 4 && (
              <div className="flex-1 flex items-center justify-center px-4">
                <p className="font-serif italic text-[#B46A72] text-center">
                  Step {currentStep} coming soon.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}
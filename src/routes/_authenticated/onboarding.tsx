import { createFileRoute, redirect } from "@tanstack/react-router";
import { Leaves } from "@/components/Leaves";

export const Route = createFileRoute("/_authenticated/onboarding")({
  beforeLoad: ({ context }) => {
    const ctx = context as { onboardingComplete?: boolean };
    if (ctx.onboardingComplete) throw redirect({ to: "/dashboard" });
  },
  component: OnboardingPage,
});

function OnboardingPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <Leaves />
      <div className="relative z-10 text-center">
        <h1 className="font-serif font-semibold text-3xl text-[#2D3A47]">Welcome to Synapse</h1>
        <p className="mt-2 font-serif italic text-[#B46A72]">
          Onboarding flow coming next.
        </p>
      </div>
    </div>
  );
}
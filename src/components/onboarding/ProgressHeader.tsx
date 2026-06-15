import { TOTAL_STEPS, useOnboardingStore } from "@/lib/onboarding-store";

export function ProgressHeader({ onBack }: { onBack?: () => void }) {
  const currentStep = useOnboardingStore((s) => s.currentStep);
  const pct = (currentStep / TOTAL_STEPS) * 100;
  return (
    <div className="relative z-10 pt-6 px-4">
      <div className="flex items-center min-h-[28px]">
        {currentStep > 1 && onBack ? (
          <button
            onClick={onBack}
            aria-label="Back"
            className="text-[#2D3A47] active:scale-95 transition"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
        ) : null}
      </div>
      <p className="mt-2 text-xs italic text-[#A9B7C6] font-serif">
        Step {currentStep} of {TOTAL_STEPS}
      </p>
      <div className="mt-2 h-1.5 w-full rounded-full bg-[#FFF7E6] border border-[#F7C8D3]/40 overflow-hidden">
        <div
          className="h-full bg-[#B46A72] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
import { SelectableCard } from "./SelectableCard";
import { useOnboardingStore } from "@/lib/onboarding-store";

export function Step2Journey() {
  const { midPrepSelected, setField, nextStep } = useOnboardingStore();

  const select = (fresh: boolean) => setField("midPrepSelected", !fresh);

  const canContinue = midPrepSelected !== null;

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32">
        <h1 className="font-serif font-semibold text-3xl text-[#2D3A47]">
          Where are you in your journey?
        </h1>
        <p className="mt-1 font-serif italic text-[#B46A72]">
          We'll build your plan accordingly
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <SelectableCard
            selected={midPrepSelected === false}
            onClick={() => select(true)}
            className="!min-h-[140px]"
          >
            <span className="text-3xl">🌱</span>
            <span className="font-serif font-semibold text-xl text-[#2D3A47]">
              Starting Fresh
            </span>
            <span className="font-serif italic text-sm text-[#A9B7C6] text-center">
              I'm beginning my preparation from scratch
            </span>
          </SelectableCard>

          <SelectableCard
            selected={midPrepSelected === true}
            onClick={() => select(false)}
            className="!min-h-[140px]"
          >
            <span className="text-3xl">📍</span>
            <span className="font-serif font-semibold text-xl text-[#2D3A47]">
              Already Mid-Prep
            </span>
            <span className="font-serif italic text-sm text-[#A9B7C6] text-center">
              I've already covered some topics and want to continue
            </span>
          </SelectableCard>
        </div>
      </div>

      <button
        disabled={!canContinue}
        onClick={() => canContinue && nextStep()}
        className={`fixed bottom-6 left-4 right-4 z-20 bg-[#B46A72] text-[#FFF7E6] rounded-xl py-3 font-serif font-semibold text-lg shadow-sm transition ${
          !canContinue ? "opacity-50" : ""
        }`}
      >
        Continue
      </button>
    </div>
  );
}
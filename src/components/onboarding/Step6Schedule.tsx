import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/lib/auth-store";
import { useOnboardingStore } from "@/lib/onboarding-store";

const SLOTS = ["Early Morning", "Morning", "Afternoon", "Evening", "Night"];

export function Step6Schedule() {
  const user = useAuthStore((s) => s.user);
  const { hoursPerDay, peakHours, setField, nextStep } = useOnboardingStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue = useMemo(() => peakHours.length > 0, [peakHours]);

  const toggleSlot = (slot: string) => {
    const next = peakHours.includes(slot)
      ? peakHours.filter((item) => item !== slot)
      : [...peakHours, slot];
    setField("peakHours", next);
  };

  const onContinue = async () => {
    if (!user || !canContinue || saving) return;
    setSaving(true);
    setError(null);
    const { error: saveError } = await supabase
      .from("profiles")
      .update({ peak_hours: peakHours })
      .eq("id", user.id);
    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    nextStep();
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32">
        <h1 className="font-serif font-semibold text-3xl text-[#2D3A47]">
          Build your study rhythm
        </h1>
        <p className="mt-1 font-serif italic text-[#B46A72]">Pick the hours you can protect</p>

        <div className="mt-7 rounded-2xl border border-[#F7C8D3] bg-white/70 p-5">
          <div className="flex items-end justify-between gap-3">
            <p className="font-serif text-[#2D3A47]">Hours per day</p>
            <p className="font-serif text-3xl font-semibold text-[#B46A72]">{hoursPerDay}</p>
          </div>
          <Slider
            className="mt-5"
            min={1}
            max={12}
            step={1}
            value={[hoursPerDay]}
            onValueChange={(value) => setField("hoursPerDay", value[0] ?? 3)}
          />
        </div>

        <p className="mt-6 text-xs italic font-serif text-[#A9B7C6] uppercase tracking-wide">
          Peak Hours
        </p>
        <div className="mt-3 grid gap-3">
          {SLOTS.map((slot) => {
            const checked = peakHours.includes(slot);
            return (
              <button
                key={slot}
                type="button"
                onClick={() => toggleSlot(slot)}
                className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
                  checked ? "border-[#B46A72] bg-[#F7C8D3]/20" : "border-[#F7C8D3] bg-white/70"
                }`}
              >
                <Checkbox
                  checked={checked}
                  onClick={(event) => event.stopPropagation()}
                  onCheckedChange={() => toggleSlot(slot)}
                />
                <span className="font-serif text-[#2D3A47]">{slot}</span>
              </button>
            );
          })}
        </div>

        {error && <p className="mt-4 font-serif italic text-sm text-[#B46A72]">{error}</p>}
      </div>

      <button
        disabled={!canContinue || saving}
        onClick={onContinue}
        className={`fixed bottom-6 left-4 right-4 z-20 bg-[#B46A72] text-[#FFF7E6] rounded-xl py-3 font-serif font-semibold text-lg shadow-sm transition ${
          !canContinue || saving ? "opacity-50" : ""
        }`}
      >
        {saving ? "Saving..." : "Continue"}
      </button>
    </div>
  );
}

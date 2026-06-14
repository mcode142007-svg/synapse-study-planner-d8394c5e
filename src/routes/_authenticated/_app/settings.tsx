import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Synapse" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
      <h1 className="font-serif font-semibold text-3xl text-[#2D3A47]">Settings</h1>
      <button
        onClick={signOut}
        className="border border-[#B46A72] text-[#B46A72] rounded-xl py-3 px-6 font-serif font-semibold min-h-[44px] active:scale-95 transition-transform duration-75"
      >
        Sign out
      </button>
    </div>
  );
}
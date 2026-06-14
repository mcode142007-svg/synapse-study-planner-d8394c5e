import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Leaves } from "@/components/Leaves";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Synapse" },
      { name: "description", content: "AI-powered personalised study planning for Indian students." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate({ to: "/login", replace: true });
        return;
      }
      const { data: row } = await supabase
        .from("users")
        .select("onboarding_complete")
        .eq("id", data.user.id)
        .maybeSingle();
      navigate({
        to: row?.onboarding_complete ? "/dashboard" : "/onboarding",
        replace: true,
      });
    })();
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <Leaves />
      <h1 className="relative z-10 text-4xl font-serif font-semibold text-[#2D3A47]">Synapse</h1>
    </div>
  );
}

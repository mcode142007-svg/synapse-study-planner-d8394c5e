import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });
    const { data: row } = await supabase
      .from("users")
      .select("onboarding_complete")
      .eq("id", data.user.id)
      .maybeSingle();
    return { user: data.user, onboardingComplete: !!row?.onboarding_complete };
  },
  component: () => <Outlet />,
});
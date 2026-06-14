import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Leaves } from "@/components/Leaves";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/_authenticated/_app")({
  beforeLoad: ({ context }) => {
    const ctx = context as { onboardingComplete?: boolean };
    if (!ctx.onboardingComplete) throw redirect({ to: "/onboarding" });
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="relative min-h-screen pb-20">
      <Leaves />
      <main className="relative z-10 max-w-md mx-auto px-4 pt-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
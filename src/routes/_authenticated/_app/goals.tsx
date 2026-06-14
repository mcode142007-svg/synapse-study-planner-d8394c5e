import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_app/goals")({
  head: () => ({ meta: [{ title: "Goals — Synapse" }] }),
  component: () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <h1 className="font-serif font-semibold text-3xl text-[#2D3A47]">Goals</h1>
    </div>
  ),
});
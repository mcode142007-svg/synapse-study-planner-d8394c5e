import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/components/AuthCard";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Synapse" },
      { name: "description", content: "Sign in to Synapse." },
    ],
  }),
  component: () => <AuthCard mode="login" />,
});
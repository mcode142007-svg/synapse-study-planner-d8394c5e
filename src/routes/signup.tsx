import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/components/AuthCard";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Synapse" },
      { name: "description", content: "Create your Synapse account." },
    ],
  }),
  component: () => <AuthCard mode="signup" />,
});
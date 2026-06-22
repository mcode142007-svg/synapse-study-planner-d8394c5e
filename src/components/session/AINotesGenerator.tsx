import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { generateAiNotes } from "@/lib/api/session.functions";

type AINotesGeneratorProps = {
  topic: string;
  subject: string;
  exam: string;
  studentLevel: string;
  language: string;
  userId: string;
  chapterId: string;
  subjectId: string;
  onSaved: () => void;
};

function renderMarkdown(text: string) {
  return text.split("\n").map((line, index) => {
    if (line.startsWith("### ")) {
      return (
        <h3 key={index} className="mt-4 text-xl font-semibold text-[#2D3A47]">
          {line.slice(4)}
        </h3>
      );
    }
    if (line.startsWith("## ")) {
      return (
        <h2 key={index} className="mt-5 text-2xl font-semibold text-[#2D3A47]">
          {line.slice(3)}
        </h2>
      );
    }
    if (line.startsWith("# ")) {
      return (
        <h1 key={index} className="mt-5 text-3xl font-semibold text-[#2D3A47]">
          {line.slice(2)}
        </h1>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <p key={index} className="pl-4 text-base leading-8 text-[#2D3A47]/80">
          • {line.slice(2)}
        </p>
      );
    }
    if (line.trim() === "") {
      return <div key={index} className="h-3" />;
    }
    return (
        <p key={index} className="text-base leading-8 text-[#2D3A47]/80">
        {line}
      </p>
    );
  });
}

export function AINotesGenerator({
  topic,
  subject,
  exam,
  studentLevel,
  language,
  userId,
  chapterId,
  subjectId,
  onSaved,
}: AINotesGeneratorProps) {
  const mutation = useMutation({
    mutationFn: async () =>
      await generateAiNotes({
        data: {
          topic,
          subject,
          exam,
          studentLevel,
          language,
          userId,
          chapterId,
          subjectId,
        },
      }),
    onSuccess: () => {
      toast.success("Notes saved");
      onSaved();
    },
  });

  useEffect(() => {
    if (!mutation.isIdle) return;
    mutation.mutate();
  }, [mutation]);

  return (
    <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#6B7280]">AI-generated notes</p>
          <h2 className="mt-2 text-xl font-semibold text-[#111827]">Study notes</h2>
        </div>
        {mutation.isLoading ? (
          <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-sm font-semibold text-[#6B7280]">
            Generating...
          </span>
        ) : null}
      </div>

      {mutation.isLoading ? (
        <div className="space-y-3">
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        </div>
      ) : mutation.isError ? (
        <div className="rounded-2xl bg-[#FEE2E2] p-4 text-base text-[#991B1B]">
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Unable to generate notes. Please try again."}
        </div>
      ) : mutation.data?.content ? (
        <div className="prose prose-slate max-w-none text-base text-[#374151]">
          {renderMarkdown(mutation.data.content)}
        </div>
      ) : null}
    </section>
  );
}

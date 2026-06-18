import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { useMemo } from "react";
import { getTimeline } from "@/lib/api/session.functions";

export const Route = createFileRoute("/timeline")({
  head: () => ({ meta: [{ title: "Timeline — Synapse" }] }),
  component: Timeline,
});

function dayLabelFor(dateStr: string) {
  try {
    const today = new Date();
    const d = new Date(dateStr);
    const diff = Math.ceil((d.setHours(0, 0, 0, 0) - new Date(today.setHours(0, 0, 0, 0))) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `Day ${diff + 1}`;
  } catch {
    return dateStr;
  }
}

function Timeline() {
  const navigate = useNavigate();
  const query = useQuery({
    queryKey: ["timeline"],
    queryFn: async () => getTimeline({}),
  });

  const groups = useMemo(() => {
    const items: Record<string, any[]> = {};
    const plans = query.data?.plans ?? [];
    let finalTasks = plans ? [...plans] : [];
    if (typeof window !== "undefined") {
      const demoMock = localStorage.getItem("synapse_demo_revision");
      if (demoMock) {
        try {
          finalTasks.push(JSON.parse(demoMock));
        } catch {
          // ignore malformed demo data
        }
      }
    }
    for (const p of finalTasks) {
      const dateStr = p.scheduled_date ? p.scheduled_date.split('T')[0] : "unscheduled";
      items[dateStr] = items[dateStr] || [];
      items[dateStr].push(p);
    }
    return Object.entries(items).sort((a, b) => {
      if (a[0] === "unscheduled") return 1;
      if (b[0] === "unscheduled") return -1;
      return new Date(a[0]).getTime() - new Date(b[0]).getTime();
    });
  }, [query.data]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8 px-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#111827] dark:text-white">30-day Timeline</h1>
          <p className="text-sm text-[#6B7280]">Overview of your scheduled study plan</p>
        </div>
        <button
          type="button"
          onClick={() => navigate({ to: "/_authenticated/_app/dashboard" })}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
        >
          <CalendarDays className="h-4 w-4" />
          Dashboard
        </button>
      </header>

      <div className="space-y-6">
        {groups.map(([date, items]) => (
          <section key={date} className="space-y-3">
            <h2 className="text-lg font-semibold text-[#2D3A47] dark:text-white">{dayLabelFor(date)}</h2>
            <div className="space-y-3">
              {items.map((task: any) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white p-4 dark:border-white/10 dark:bg-slate-900"
                >
                  <div>
                    <p className="text-sm text-[#6B7280]">{task.subjects?.subject_name ?? ""}</p>
                    <p className="mt-1 font-semibold text-[#111827] dark:text-white">{task.topic}</p>
                    <p className="text-xs text-[#6B7280]">{task.syllabus?.chapter_name ?? ""}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {task.task_type === "revision" ? (
                      <span className="rounded-full bg-red-100 text-red-700 border border-red-300 px-3 py-1 text-xs font-bold">
                        Revision: Poor Score
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-semibold text-[#111827]">
                        {task.task_type}
                      </span>
                    )}
                    <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#4338CA]">
                      {task.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

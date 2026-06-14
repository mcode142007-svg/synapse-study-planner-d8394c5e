import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

type Tab = { to: string; label: string; icon: ReactNode };

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const TABS: Tab[] = [
  { to: "/dashboard", label: "Dashboard", icon: <Icon d="M3 12 12 4l9 8M5 10v10h14V10" /> },
  { to: "/goals", label: "Goals", icon: <Icon d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" /> },
  { to: "/progress", label: "Progress", icon: <Icon d="M4 19h16M6 17v-6M11 17V7M16 17v-9" /> },
  { to: "/settings", label: "Settings", icon: <Icon d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /> },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-[#FFF7E6]/90 dark:bg-[#2D3A47]/90 backdrop-blur border-t border-[#F7C8D3]/40 dark:border-white/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex items-stretch justify-around h-16 max-w-md mx-auto">
        {TABS.map((t) => {
          const active = pathname === t.to || pathname.startsWith(t.to + "/");
          return (
            <li key={t.to} className="flex-1">
              <Link
                to={t.to}
                className={`flex flex-col items-center justify-center h-full min-w-[44px] min-h-[44px] gap-0.5 transition-colors duration-150 active:scale-95 ${
                  active ? "text-[#B46A72]" : "text-[#A9B7C6]"
                }`}
              >
                {t.icon}
                <span className="text-[11px] italic font-serif">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
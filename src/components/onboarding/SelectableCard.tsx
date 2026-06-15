import { type ReactNode } from "react";

export function SelectableCard({
  selected,
  onClick,
  children,
  className = "",
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border-2 backdrop-blur p-6 min-h-[120px] flex flex-col items-center justify-center gap-2 active:scale-95 transition-all duration-150 ${
        selected
          ? "border-[#B46A72] bg-[#F7C8D3]/30"
          : "border-[#F7C8D3] bg-white/70"
      } ${className}`}
    >
      {children}
    </button>
  );
}
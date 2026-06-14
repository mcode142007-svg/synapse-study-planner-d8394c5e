const LEAVES = [
  { left: "8%", duration: 14, delay: 0, driftX: 60 },
  { left: "24%", duration: 10, delay: 3, driftX: -40 },
  { left: "42%", duration: 13, delay: 6, driftX: 30 },
  { left: "60%", duration: 9, delay: 1, driftX: -50 },
  { left: "75%", duration: 15, delay: 5, driftX: 70 },
  { left: "90%", duration: 11, delay: 8, driftX: -30 },
];

export function Leaves() {
  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {LEAVES.map((l, i) => (
        <svg
          key={i}
          className="leaf"
          viewBox="0 0 24 24"
          style={{
            left: l.left,
            animationDuration: `${l.duration}s`,
            animationDelay: `${l.delay}s`,
            ["--drift-x" as string]: `${l.driftX}px`,
          }}
        >
          <path
            d="M12 2 C 6 4, 3 10, 4 18 C 4 19, 5 20, 6 20 C 14 21, 20 15, 22 6 C 22 5, 21 4, 20 4 C 17 4, 14 4, 12 2 Z"
            fill="currentColor"
          />
          <path d="M6 19 C 10 14, 16 9, 21 5" stroke="#7a8a5e" strokeWidth="0.6" fill="none" opacity="0.5" />
        </svg>
      ))}
    </div>
  );
}
export function ScoreRing({ value, size = 132 }: { value: number; size?: number }) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(Math.max(value, 0), 100) / 100) * c;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="score-ring-track" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="score-ring-value"
        />
      </svg>
      <div className="absolute text-center">
        <p className="font-display text-4xl font-bold text-success-strong">{value}%</p>
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">match</p>
      </div>
    </div>
  );
}

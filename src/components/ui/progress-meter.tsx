type ProgressMeterProps = {
  label: string;
  valueLabel: string;
  percent?: number;
};

export function ProgressMeter({
  label,
  valueLabel,
  percent = 0,
}: ProgressMeterProps) {
  const width = Math.min(100, Math.max(0, percent));

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="min-w-0 font-medium text-navy">{label}</p>
        <p className="shrink-0 text-muted">{valueLabel}</p>
      </div>
      <div
        className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-muted"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={width}
      >
        <span
          className="block h-full rounded-full bg-copper"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

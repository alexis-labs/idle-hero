export function ProgressBar({ value, label, detail }: { value: number; label?: string; detail?: string }) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div className="progress-block">
      {(label || detail) && (
        <div className="progress-meta">
          <span>{label}</span>
          <span>{detail}</span>
        </div>
      )}
      <div className="progress-track">
        <div className="progress-fill" style={{ transform: `scaleX(${clamped})` }} />
      </div>
    </div>
  );
}

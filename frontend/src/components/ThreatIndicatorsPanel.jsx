import GlassCard from "./GlassCard.jsx";

export default function ThreatIndicatorsPanel({ keywords = [], mlScore = 0, ruleScore = 0, confidence = 0 }) {
  return (
    <GlassCard title="Threat Indicators" eyebrow="Signals">
      <div className="grid gap-3 sm:grid-cols-3">
        <Signal label="ML Score" value={mlScore} />
        <Signal label="Rule Score" value={ruleScore} />
        <Signal label="Confidence" value={Math.round((confidence || 0) * 100)} suffix="%" />
      </div>

      <div className="mt-5">
        <p className="mb-3 text-sm font-medium text-slate-300">Suspicious keywords</p>
        {keywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-100"
              >
                {keyword}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No suspicious keywords detected.</p>
        )}
      </div>
    </GlassCard>
  );
}

function Signal({ label, value, suffix = "" }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">
        {value}
        {suffix}
      </p>
    </div>
  );
}

import GlassCard from "./GlassCard.jsx";

export default function FraudPatternAnalysisCard({
  category = "Awaiting Analysis",
  matchedPatterns = [],
  explanation = "",
}) {
  return (
    <GlassCard title="Fraud Pattern Analysis" eyebrow="Signature Match" className="lg:col-span-2">
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-cyan-200/70">
            Detected scam family
          </p>
          <p className="mt-3 text-2xl font-semibold text-cyan-50">{category}</p>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-slate-300">Matched indicators</p>
          {matchedPatterns.length > 0 ? (
            <div className="grid gap-2">
              {matchedPatterns.map((pattern) => (
                <div
                  key={pattern}
                  className="rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-200"
                >
                  {pattern}
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-white/10 bg-slate-950/40 px-3 py-3 text-sm text-slate-500">
              No signature indicators matched yet.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-white/10 bg-slate-950/40 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Threat explanation</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {explanation || "Run an analysis to see the matched fraud pattern explanation."}
        </p>
      </div>
    </GlassCard>
  );
}

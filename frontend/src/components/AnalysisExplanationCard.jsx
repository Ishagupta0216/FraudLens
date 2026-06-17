import GlassCard from "./GlassCard.jsx";

export default function AnalysisExplanationCard({ explanation }) {
  return (
    <GlassCard title="Analyst Explanation" eyebrow="Assessment">
      <p className="min-h-24 text-sm leading-7 text-slate-300">
        {explanation || "Submit a transaction narration or SMS message to generate an analyst-style fraud assessment."}
      </p>
    </GlassCard>
  );
}

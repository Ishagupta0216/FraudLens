import { riskTone } from "../utils/risk.js";
import GlassCard from "./GlassCard.jsx";

export default function ScamCategoryCard({ category = "Awaiting Analysis", level = "Low" }) {
  const tone = riskTone(level);

  return (
    <GlassCard title="Scam Category" eyebrow="Classification">
      <div className={`rounded-lg border ${tone.border} ${tone.bg} p-5`}>
        <p className={`text-2xl font-semibold ${tone.text}`}>{category}</p>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Pattern family identified from message signals and the final model-assisted risk score.
        </p>
      </div>
    </GlassCard>
  );
}

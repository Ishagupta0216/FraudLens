import GlassCard from "./GlassCard.jsx";

export default function StatsWidgets({ stats }) {
  const items = [
    {
      label: "Total Scans",
      value: stats?.total_predictions ?? 0,
      tone: "text-cyan-100",
    },
    {
      label: "High Risk Detections",
      value: stats?.high_risk_count ?? 0,
      tone: "text-rose-200",
    },
    {
      label: "Medium Risk Detections",
      value: stats?.medium_risk_count ?? 0,
      tone: "text-amber-200",
    },
    {
      label: "Low Risk Detections",
      value: stats?.low_risk_count ?? 0,
      tone: "text-emerald-200",
    },
  ];

  return (
    <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <GlassCard key={item.label} className="p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            {item.label}
          </p>
          <p className={`mt-3 text-3xl font-semibold ${item.tone}`}>{item.value}</p>
        </GlassCard>
      ))}
    </section>
  );
}

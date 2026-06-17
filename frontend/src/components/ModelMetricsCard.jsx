import { BarController, BarElement, CategoryScale, Chart, LinearScale, Tooltip } from "chart.js";
import { useEffect, useRef } from "react";
import { formatPercent } from "../utils/risk.js";
import GlassCard from "./GlassCard.jsx";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

export default function ModelMetricsCard({ metrics }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const values = metrics || {};

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !metrics) return;

    chartRef.current?.destroy();
    chartRef.current = null;

    chartRef.current = new Chart(canvas, {
      type: "bar",
      data: {
        labels: ["Accuracy", "Precision", "Recall", "F1"],
        datasets: [
          {
            data: [
              values.accuracy || 0,
              values.precision || 0,
              values.recall || 0,
              values.f1_score || 0,
            ],
            backgroundColor: ["#22d3ee", "#2dd4bf", "#a3e635", "#fbbf24"],
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            max: 1,
            grid: { color: "rgba(148, 163, 184, 0.12)" },
            ticks: { color: "#94a3b8" },
          },
          x: {
            grid: { display: false },
            ticks: { color: "#94a3b8" },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => formatPercent(context.raw),
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [metrics, values.accuracy, values.precision, values.recall, values.f1_score]);

  return (
    <GlassCard title="Model Metrics" eyebrow="Performance">
      {metrics ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Accuracy" value={formatPercent(values.accuracy)} />
            <Metric label="Precision" value={formatPercent(values.precision)} />
            <Metric label="Recall" value={formatPercent(values.recall)} />
            <Metric label="F1 Score" value={formatPercent(values.f1_score)} />
          </div>
          <div className="mt-5 h-44">
            <canvas ref={canvasRef} aria-label="Model metrics chart" role="img" />
          </div>
        </>
      ) : (
        <p className="text-sm leading-6 text-slate-400">
          Metrics are available after running backend training.
        </p>
      )}
    </GlassCard>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

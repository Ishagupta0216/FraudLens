import { ArcElement, Chart, DoughnutController, Tooltip } from "chart.js";
import { useEffect, useRef } from "react";

Chart.register(DoughnutController, ArcElement, Tooltip);

export default function ThreatScoreGauge({ score = 0, level = "Low" }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const safeScore = Math.max(0, Math.min(Number(score) || 0, 100));

  useEffect(() => {
    const color = safeScore >= 70 ? "#fb7185" : safeScore >= 40 ? "#fbbf24" : "#34d399";
    const canvas = canvasRef.current;

    if (!canvas) return;

    chartRef.current?.destroy();
    chartRef.current = null;

    chartRef.current = new Chart(canvas, {
      type: "doughnut",
      data: {
        datasets: [
          {
            data: [safeScore, 100 - safeScore],
            backgroundColor: [color, "rgba(148, 163, 184, 0.16)"],
            borderWidth: 0,
            cutout: "78%",
            circumference: 260,
            rotation: 230,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: { enabled: false },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [safeScore]);

  return (
    <div className="relative h-56">
      <canvas ref={canvasRef} aria-label="Threat score gauge" role="img" />
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
        <span className="text-5xl font-bold text-white">{safeScore}</span>
        <span className="mt-2 text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
          {level} Risk
        </span>
      </div>
    </div>
  );
}

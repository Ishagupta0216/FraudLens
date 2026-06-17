import { useEffect, useMemo, useState } from "react";
import { getMetrics, predictThreat } from "../api/fraudApi.js";
import AnalysisExplanationCard from "../components/AnalysisExplanationCard.jsx";
import FraudPatternAnalysisCard from "../components/FraudPatternAnalysisCard.jsx";
import GlassCard from "../components/GlassCard.jsx";
import ModelMetricsCard from "../components/ModelMetricsCard.jsx";
import RecentThreatsTable from "../components/RecentThreatsTable.jsx";
import ScamCategoryCard from "../components/ScamCategoryCard.jsx";
import StatsWidgets from "../components/StatsWidgets.jsx";
import ThreatIndicatorsPanel from "../components/ThreatIndicatorsPanel.jsx";
import ThreatScoreGauge from "../components/ThreatScoreGauge.jsx";
import {
  addLocalHistoryEntry,
  calculateLocalStats,
  clearLocalHistory,
  loadLocalHistory,
} from "../utils/historyStorage.js";
import { riskTone } from "../utils/risk.js";

const sampleText = "Your KYC will expire today. Verify immediately.";

export default function Dashboard() {
  const [text, setText] = useState(sampleText);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const [error, setError] = useState("");

  const currentLevel = result?.risk_level || "Low";
  const tone = useMemo(() => riskTone(currentLevel), [currentLevel]);
  const stats = useMemo(() => calculateLocalStats(history), [history]);

  async function loadDashboardData() {
    setRefreshing(true);
    try {
      const metricsData = await getMetrics();
      setMetrics(metricsData);
    } catch {
      setMetrics(null);
    } finally {
      setRefreshing(false);
    }
  }

  function handleClearHistory() {
    clearLocalHistory();
    setHistory([]);
  }

  useEffect(() => {
    setHistory(loadLocalHistory());
    loadDashboardData();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedText = text.trim();

    if (!trimmedText) {
      setError("Enter a UPI narration or SMS message to analyze.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const prediction = await predictThreat(trimmedText);
      setResult(prediction);
      setHistory((currentHistory) =>
        addLocalHistoryEntry(currentHistory, trimmedText, prediction)
      );
      await loadDashboardData();
    } catch (apiError) {
      setError(
        apiError.response?.data?.error ||
          "Unable to analyze the message. Check that the Flask backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(115deg,rgba(15,23,42,0.92),rgba(2,6,23,1)_42%,rgba(8,47,73,0.5))]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              FraudLens
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal text-white sm:text-4xl">
              UPI and SMS Fraud Detection
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Analyze suspicious narrations, score threat probability, identify scam patterns,
              and review recent investigations.
            </p>
          </div>
          <div className={`rounded-lg border px-4 py-3 ${tone.border} ${tone.bg}`}>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Current Risk</p>
            <p className={`mt-1 text-xl font-semibold ${tone.text}`}>{currentLevel}</p>
          </div>
        </header>

        <StatsWidgets stats={stats} />

        <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <GlassCard title="Message Analyzer" eyebrow="Input">
            <form onSubmit={handleSubmit}>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows="8"
                className="w-full resize-none rounded-lg border border-white/10 bg-slate-950/70 p-4 text-sm leading-6 text-slate-100 outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/15"
                placeholder="Paste a UPI narration or SMS message..."
              />
              {error && (
                <div className="mt-3 rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              )}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Analyzing..." : "Analyze Threat"}
                </button>
                <button
                  type="button"
                  onClick={() => setText(sampleText)}
                  className="rounded-lg border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/5"
                >
                  Load Sample
                </button>
              </div>
            </form>
          </GlassCard>

          <GlassCard title="Threat Score" eyebrow="Probability">
            <ThreatScoreGauge score={result?.risk_score || 0} level={currentLevel} />
          </GlassCard>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-3">
          <ThreatIndicatorsPanel
            keywords={result?.keywords || []}
            mlScore={result?.ml_score || 0}
            ruleScore={result?.rule_score || 0}
            confidence={result?.confidence || 0}
          />
          <ScamCategoryCard category={result?.category} level={currentLevel} />
          <AnalysisExplanationCard explanation={result?.explanation} />
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-3">
          <FraudPatternAnalysisCard
            category={result?.category}
            matchedPatterns={result?.matched_patterns || []}
            explanation={result?.explanation}
          />
          <ModelMetricsCard metrics={metrics} />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-3">
          <RecentThreatsTable history={history} onClearHistory={handleClearHistory} />
        </section>

        <footer className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>API target: {import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}</span>
          <span>{refreshing ? "Syncing dashboard data..." : "Dashboard data loaded"}</span>
        </footer>
      </div>
    </main>
  );
}

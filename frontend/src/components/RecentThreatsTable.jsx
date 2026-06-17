import { formatTimestamp, riskTone } from "../utils/risk.js";
import GlassCard from "./GlassCard.jsx";

export default function RecentThreatsTable({ history = [], onClearHistory }) {
  return (
    <GlassCard title="Recent Threats" eyebrow="History" className="xl:col-span-2">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-400">
          Stored locally in this browser. Latest 50 analyses are kept.
        </p>
        <button
          type="button"
          onClick={onClearHistory}
          disabled={history.length === 0}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-rose-300/40 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear History
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-[0.14em] text-slate-500">
              <th className="pb-3 pr-4 font-medium">Time</th>
              <th className="pb-3 pr-4 font-medium">Message</th>
              <th className="pb-3 pr-4 font-medium">Category</th>
              <th className="pb-3 pr-4 font-medium">Risk</th>
            </tr>
          </thead>
          <tbody>
            {history.length > 0 ? (
              history
                .slice()
                .reverse()
                .slice(0, 8)
                .map((item, index) => {
                  const tone = riskTone(item.risk_level);
                  return (
                    <tr key={`${item.timestamp}-${index}`} className="border-b border-white/5">
                      <td className="whitespace-nowrap py-4 pr-4 text-slate-400">
                        {formatTimestamp(item.timestamp)}
                      </td>
                      <td className="max-w-md py-4 pr-4 text-slate-200">
                        <span className="line-clamp-2">{item.text}</span>
                      </td>
                      <td className="whitespace-nowrap py-4 pr-4 text-slate-300">
                        {item.category}
                      </td>
                      <td className="whitespace-nowrap py-4 pr-4">
                        <span className={`rounded-full px-3 py-1 text-xs ring-1 ${tone.chip}`}>
                          {item.risk_score} / {item.risk_level}
                        </span>
                      </td>
                    </tr>
                  );
                })
            ) : (
              <tr>
                <td colSpan="4" className="py-8 text-center text-slate-500">
                  No predictions recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

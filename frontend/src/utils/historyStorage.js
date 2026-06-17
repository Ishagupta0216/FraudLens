const HISTORY_KEY = "fraudlens.history";
const HISTORY_LIMIT = 50;

export function loadLocalHistory() {
  try {
    const rawHistory = window.localStorage.getItem(HISTORY_KEY);
    const parsedHistory = rawHistory ? JSON.parse(rawHistory) : [];
    return Array.isArray(parsedHistory) ? parsedHistory : [];
  } catch {
    return [];
  }
}

export function saveLocalHistory(history) {
  const recentHistory = history.slice(-HISTORY_LIMIT);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(recentHistory));
  return recentHistory;
}

export function addLocalHistoryEntry(history, text, result) {
  const entry = {
    timestamp: new Date().toISOString(),
    text,
    risk_score: result.risk_score,
    risk_level: result.risk_level,
    category: result.category,
  };

  return saveLocalHistory([...history, entry]);
}

export function clearLocalHistory() {
  window.localStorage.removeItem(HISTORY_KEY);
}

export function calculateLocalStats(history) {
  return history.reduce(
    (stats, entry) => {
      stats.total_predictions += 1;

      if (entry.risk_level === "High") {
        stats.high_risk_count += 1;
      } else if (entry.risk_level === "Medium") {
        stats.medium_risk_count += 1;
      } else if (entry.risk_level === "Low") {
        stats.low_risk_count += 1;
      }

      return stats;
    },
    {
      total_predictions: 0,
      high_risk_count: 0,
      medium_risk_count: 0,
      low_risk_count: 0,
    }
  );
}

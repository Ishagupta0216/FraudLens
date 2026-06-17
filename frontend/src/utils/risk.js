export function riskTone(level) {
  if (level === "High") {
    return {
      text: "text-rose-200",
      border: "border-rose-400/40",
      bg: "bg-rose-500/15",
      chip: "bg-rose-500/20 text-rose-100 ring-rose-400/30",
    };
  }

  if (level === "Medium") {
    return {
      text: "text-amber-200",
      border: "border-amber-400/40",
      bg: "bg-amber-500/15",
      chip: "bg-amber-500/20 text-amber-100 ring-amber-400/30",
    };
  }

  return {
    text: "text-emerald-200",
    border: "border-emerald-400/40",
    bg: "bg-emerald-500/15",
    chip: "bg-emerald-500/20 text-emerald-100 ring-emerald-400/30",
  };
}

export function formatPercent(value) {
  if (typeof value !== "number") return "N/A";
  return `${Math.round(value * 100)}%`;
}

export function formatTimestamp(value) {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

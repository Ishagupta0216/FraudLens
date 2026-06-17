export default function GlassCard({ title, eyebrow, children, className = "" }) {
  return (
    <section
      className={`rounded-lg border border-white/10 bg-white/[0.07] p-5 shadow-glow backdrop-blur-xl ${className}`}
    >
      {(title || eyebrow) && (
        <div className="mb-4">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
              {eyebrow}
            </p>
          )}
          {title && <h2 className="mt-1 text-lg font-semibold text-slate-50">{title}</h2>}
        </div>
      )}
      {children}
    </section>
  );
}

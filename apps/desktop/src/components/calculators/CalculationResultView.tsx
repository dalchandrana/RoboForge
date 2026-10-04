import type { CalculationOutput } from '@roboforge/calculators';

interface Props<T> {
  output: CalculationOutput<T> | null;
  error?: string;
  summaryCards?: {
    label: string;
    value: string | number;
    subtext?: string;
    highlight?: boolean;
  }[];
}

export function CalculationResultView<T>({ output, error, summaryCards }: Props<T>) {
  if (error) {
    return (
      <div className="p-4 bg-red-950/60 border border-red-800 text-red-200 rounded-xl text-sm flex items-start gap-3 mt-4">
        <span className="text-red-400 text-base">⚠️</span>
        <div>
          <div className="font-bold">Calculation Error</div>
          <div className="text-xs text-red-300 mt-0.5">{error}</div>
        </div>
      </div>
    );
  }

  if (!output) return null;

  return (
    <div className="space-y-6 pt-6 border-t border-border-subtle mt-6 animate-fadeIn">
      {/* Summary Stat Cards */}
      {summaryCards && summaryCards.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {summaryCards.map((c, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-xl border transition-all ${
                c.highlight
                  ? 'bg-sky-950/40 border-sky-600/50 shadow-sm'
                  : 'bg-slate-900/60 border-border-subtle'
              }`}
            >
              <span className="text-xs font-medium text-text-muted block truncate">{c.label}</span>
              <span
                className={`text-lg font-bold font-mono block mt-1 truncate ${
                  c.highlight ? 'text-sky-300' : 'text-white'
                }`}
              >
                {c.value}
              </span>
              {c.subtext && (
                <span className="text-[11px] text-text-muted block mt-0.5 truncate">
                  {c.subtext}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Formula & Reference */}
      <div className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg border border-border-subtle text-xs">
        <span className="text-text-muted font-medium">Governing Formula:</span>
        <code className="font-mono text-sky-400 bg-sky-950/60 px-2.5 py-1 rounded border border-sky-800/40 font-bold">
          {output.formula}
        </code>
      </div>

      {/* Step-by-Step Worked Derivation */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
          <span>📐</span> Worked Mathematical Steps ({output.steps.length})
        </h4>
        <div className="space-y-2">
          {output.steps.map((st, i) => (
            <div
              key={i}
              className="p-3.5 bg-slate-950/60 rounded-xl border border-border-subtle/80 text-sm flex flex-col gap-1 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sky-300 text-xs flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-sky-900/60 text-sky-300 text-[10px] flex items-center justify-center font-bold font-mono">
                    {i + 1}
                  </span>
                  {st.label}
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30">
                  {st.math}
                </span>
              </div>
              <p className="text-xs text-text-muted pl-6">{st.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { monthShort, periodLabel } from "@/lib/format";
import type { PeriodCell, PeriodStatus } from "@/lib/iuran";

type Props = {
  cells: PeriodCell[];
};

const STYLES: Record<
  PeriodStatus | "future",
  { chip: string; text: string; icon: string; word: string }
> = {
  paid: {
    chip: "bg-emerald-50 ring-1 ring-emerald-200",
    text: "text-emerald-700",
    icon: "✓",
    word: "lunas",
  },
  pending: {
    chip: "bg-amber-50 ring-1 ring-amber-200",
    text: "text-amber-700",
    icon: "⏳",
    word: "menunggu verifikasi",
  },
  unpaid: {
    chip: "bg-rose-50 ring-1 ring-rose-200",
    text: "text-rose-700",
    icon: "!",
    word: "belum dibayar",
  },
  future: {
    chip: "bg-white ring-1 ring-slate-200",
    text: "text-slate-400",
    icon: "·",
    word: "belum jatuh tempo",
  },
};

const OUTSIDE = {
  chip: "bg-transparent ring-1 ring-dashed ring-slate-200",
  text: "text-slate-300",
  icon: "–",
};

export default function MonthGrid({ cells }: Props) {
  if (cells.length === 0) return null;

  const first = cells[0].period;
  const last = cells[cells.length - 1].period;
  const statusByPeriod = new Map(cells.map((cell) => [cell.period, cell.status]));
  const years = Array.from(
    new Set(cells.map((cell) => Number(cell.period.slice(0, 4)))),
  );

  return (
    <div className="space-y-3">
      {years.map((year) => (
        <div key={year}>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {year}
          </p>
          <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-12">
            {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => {
              const period = `${year}-${String(month).padStart(2, "0")}`;
              const recorded = statusByPeriod.get(period);
              const outside = period < first || (!recorded && period > last);
              const kind = recorded ?? "future";
              const style = outside ? OUTSIDE : STYLES[kind];
              const description = outside
                ? "di luar periode tagihan"
                : STYLES[kind].word;

              return (
                <div
                  key={period}
                  aria-label={`${periodLabel(period)}: ${description}`}
                  title={`${periodLabel(period)} — ${description}`}
                  className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 ${style.chip}`}
                >
                  <span className={`text-[11px] font-semibold ${style.text}`}>
                    {monthShort(month)}
                  </span>
                  <span
                    aria-hidden
                    className={`text-[10px] leading-none ${style.text}`}
                  >
                    {style.icon}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

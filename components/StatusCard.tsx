import { periodLabel, rupiah } from "@/lib/format";
import type { Timeline } from "@/lib/iuran";

type Props = {
  timeline: Timeline;
  arrearsAmount: number;
  monthlyAmount: number;
};

export default function StatusCard({ timeline, arrearsAmount, monthlyAmount }: Props) {
  const unpaidCount = timeline.unpaidPeriods.length;
  const pendingCount = timeline.pendingCount;
  const lastPeriod = timeline.cells[timeline.cells.length - 1]?.period;

  if (unpaidCount === 0 && pendingCount === 0) {
    return (
      <section className="rounded-2xl bg-emerald-600 p-5 text-white shadow-sm">
        <p className="text-sm font-medium text-emerald-50">Status iuran</p>
        <p className="mt-1 flex items-center gap-2 text-2xl font-bold">
          <span aria-hidden>✅</span> Lunas
        </p>
        <p className="mt-2 text-sm leading-relaxed text-emerald-50">
          Iuran kamu terbayar sampai{" "}
          <span className="font-semibold text-white">
            {periodLabel(timeline.coveredUntil ?? lastPeriod ?? "")}
          </span>
          .
        </p>
      </section>
    );
  }

  if (unpaidCount === 0 && pendingCount > 0) {
    return (
      <section className="rounded-2xl bg-brand-600 p-5 text-white shadow-sm">
        <p className="text-sm font-medium text-brand-100">Status iuran</p>
        <p className="mt-1 flex items-center gap-2 text-2xl font-bold">
          <span aria-hidden>⏳</span> Menunggu verifikasi
        </p>
        <p className="mt-2 text-sm leading-relaxed text-brand-50">
          {pendingCount} bulan sedang dicek bendahara. Kamu tidak perlu
          mengirim ulang bukti transfer.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Status iuran</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900">
            <span aria-hidden>⚠️</span> Belum lunas
          </p>
        </div>
        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
          {unpaidCount} bulan
        </span>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {rupiah(arrearsAmount)}
      </p>
      <p className="mt-0.5 text-sm text-slate-600">
        total tunggakan ({unpaidCount} × {rupiah(monthlyAmount)})
      </p>

      {timeline.coveredUntil ? (
        <p className="mt-3 text-sm text-slate-600">
          Sudah lunas sampai{" "}
          <span className="font-semibold text-slate-900">
            {periodLabel(timeline.coveredUntil)}
          </span>
          .
        </p>
      ) : (
        <p className="mt-3 text-sm text-slate-600">
          Belum ada pembayaran yang tercatat.
        </p>
      )}

      {pendingCount > 0 ? (
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-200">
          {pendingCount} bulan lain sedang menunggu verifikasi bendahara.
        </p>
      ) : null}
    </section>
  );
}

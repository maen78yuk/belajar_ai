import Link from "next/link";

import MonthGrid from "@/components/MonthGrid";
import SetupNotice from "@/components/SetupNotice";
import StatusCard from "@/components/StatusCard";
import {
  cardClass,
  mutedText,
  primaryButton,
  successBoxClass,
} from "@/components/styles";
import { periodLabel, rupiah } from "@/lib/format";
import { loadDashboard } from "@/lib/data";
import { DatabaseNotConfiguredError } from "@/lib/db";
import { requireMember } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ sukses?: string }>;
}) {
  const session = await requireMember();
  const params = await searchParams;

  let data;
  try {
    data = await loadDashboard(session.memberId);
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) return <SetupNotice />;
    throw error;
  }

  if (!data) {
    return (
      <div className={cardClass}>
        <h1 className="text-lg font-bold text-slate-900">
          Data anggota tidak ditemukan
        </h1>
        <p className={`${mutedText} mt-2`}>
          Akun ini belum terhubung ke data keanggotaan. Hubungi bendahara SP
          untuk memperbaikinya.
        </p>
      </div>
    );
  }

  const firstName = data.member.name.split(" ")[0];
  const pendingPayments = data.timeline.pendingCount;

  return (
    <div className="space-y-4">
      {params.sukses ? (
        <p className={successBoxClass}>
          Pembayaran tersimpan. Statusnya berubah setelah bendahara memeriksa
          bukti transfer kamu.
        </p>
      ) : null}

      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Halo, {firstName}
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          No. anggota {data.member.memberNo}
          {data.member.unit ? ` · ${data.member.unit}` : ""}
        </p>
      </div>

      <StatusCard
        timeline={data.timeline}
        arrearsAmount={data.arrearsAmount}
        monthlyAmount={data.monthlyAmount}
      />

      <section className={cardClass}>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Riwayat bulan
          </h2>
          <span className="text-xs text-slate-500">
            Jan {data.settings.periodStart.slice(0, 4)} – sekarang
          </span>
        </div>

        <MonthGrid cells={data.timeline.cells} />

        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="text-emerald-600">
              ✓
            </span>
            Lunas
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="text-amber-600">
              ⏳
            </span>
            Menunggu verifikasi
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="text-rose-600">
              !
            </span>
            Belum dibayar
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="text-slate-400">
              ·
            </span>
            Belum jatuh tempo
          </li>
        </ul>
      </section>

      <section className={cardClass}>
        <h2 className="text-sm font-semibold text-slate-900">
          Iuran &amp; cara bayar
        </h2>
        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          {rupiah(data.monthlyAmount)}
          <span className="text-sm font-medium text-slate-500"> / bulan</span>
        </p>
        <p className={`${mutedText} mt-2`}>{data.settings.bankInfo}</p>

        {data.timeline.firstUnpaid ? (
          <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
            Bulan berikutnya yang perlu dibayar:{" "}
            <span className="font-semibold">
              {periodLabel(data.timeline.firstUnpaid)}
            </span>
          </p>
        ) : (
          <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
            Semua bulan sudah tercatat.{" "}
            {pendingPayments > 0
              ? "Tinggal menunggu verifikasi bendahara."
              : "Terima kasih sudah tertib iuran!"}
          </p>
        )}

        <Link
          href="/bayar"
          className={`${primaryButton} mt-4 block text-center`}
        >
          Kirim bukti pembayaran
        </Link>
      </section>
    </div>
  );
}

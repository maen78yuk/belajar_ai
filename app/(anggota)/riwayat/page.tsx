import Link from "next/link";

import SetupNotice from "@/components/SetupNotice";
import {
  cardClass,
  mutedText,
  secondaryButton,
  successBoxClass,
} from "@/components/styles";
import { loadRiwayat } from "@/lib/data";
import { DatabaseNotConfiguredError } from "@/lib/db";
import { dateLabel, periodLabel, rupiah } from "@/lib/format";
import { requireMember } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const STATUS: Record<
  "pending" | "verified" | "rejected",
  { label: string; className: string }
> = {
  pending: {
    label: "Menunggu verifikasi",
    className: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  verified: {
    label: "Diterima",
    className: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  },
  rejected: {
    label: "Ditolak",
    className: "bg-rose-50 text-rose-700 ring-rose-200",
  },
};

export default async function RiwayatPage({
  searchParams,
}: {
  searchParams: Promise<{ kirim?: string }>;
}) {
  const session = await requireMember();
  const params = await searchParams;

  let items;
  try {
    items = await loadRiwayat(session.memberId);
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) return <SetupNotice />;
    throw error;
  }

  return (
    <div className="space-y-4">
      {params.kirim ? (
        <p className={successBoxClass}>
          Bukti pembayaran terkirim. Bendahara akan memeriksa dan mengubah
          statusnya.
        </p>
      ) : null}

      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Riwayat pembayaran
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Semua bukti yang pernah kamu kirim.
        </p>
      </div>

      {items.length === 0 ? (
        <div className={cardClass}>
          <p className="text-sm font-semibold text-slate-900">
            Belum ada pembayaran
          </p>
          <p className={`${mutedText} mt-1`}>
            Setelah kamu mengirim bukti transfer, riwayatnya muncul di sini.
          </p>
          <Link href="/bayar" className={`${secondaryButton} mt-4`}>
            Kirim bukti pembayaran
          </Link>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => {
            const status = STATUS[item.status];
            const periods = `${periodLabel(item.startPeriod)} – ${periodLabel(
              item.startPeriod,
            )}`;

            return (
              <li key={item.id} className={cardClass}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.months} bulan mulai {periodLabel(item.startPeriod)}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Dikirim {dateLabel(item.submittedAt)} ·{" "}
                      {item.method === "transfer" ? "Transfer" : "Tunai"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                <p className="mt-3 text-lg font-bold text-slate-900">
                  {rupiah(item.amount)}
                </p>
                <p className="sr-only">{periods}</p>

                {item.note ? (
                  <p className="mt-2 text-xs text-slate-600">“{item.note}”</p>
                ) : null}

                {item.status === "rejected" ? (
                  <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700 ring-1 ring-rose-200">
                    Bukti ini ditolak. Coba kirim ulang bukti yang lebih jelas.
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

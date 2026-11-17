import PayForm from "@/components/PayForm";
import SetupNotice from "@/components/SetupNotice";
import { cardClass, mutedText } from "@/components/styles";
import { loadDashboard } from "@/lib/data";
import { DatabaseNotConfiguredError } from "@/lib/db";
import { requireMember } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function BayarPage() {
  const session = await requireMember();

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
          Hubungi bendahara SP untuk memperbaiki data keanggotaanmu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Kirim bukti pembayaran
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Transfer dulu sesuai nominal, lalu unggah buktinya di sini.
        </p>
      </div>

      <PayForm
        packages={data.packages}
        startPeriod={data.timeline.nextPeriod}
        monthlyAmount={data.monthlyAmount}
        bankInfo={data.settings.bankInfo}
      />
    </div>
  );
}

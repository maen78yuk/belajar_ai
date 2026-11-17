import Link from "next/link";

import { primaryButton, secondaryButton } from "@/components/styles";
import { getSession } from "@/lib/auth";
import { homeForRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-between px-5 py-10">
      <div>
        <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
          Serikat Pekerja
        </span>

        <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-900">
          Cek iuran kamu tanpa harus tanya bendahara.
        </h1>

        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Masuk pakai email kantor, lalu langsung lihat iuran sudah lunas sampai
          bulan apa dan berapa yang masih kurang.
        </p>

        <ul className="mt-7 space-y-3 text-sm text-slate-700">
          <li className="flex items-start gap-3">
            <span aria-hidden>✅</span>
            <span>Status lunas sampai bulan apa</span>
          </li>
          <li className="flex items-start gap-3">
            <span aria-hidden>🧾</span>
            <span>Riwayat pembayaran sejak 2025</span>
          </li>
          <li className="flex items-start gap-3">
            <span aria-hidden>📤</span>
            <span>Kirim bukti transfer langsung dari HP</span>
          </li>
        </ul>
      </div>

      <div className="mt-10 space-y-3">
        {session ? (
          <Link
            href={homeForRole(session.role)}
            className={`${primaryButton} block text-center`}
          >
            Lanjut ke halaman saya
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className={`${primaryButton} block text-center`}
            >
              Masuk
            </Link>
            <Link
              href="/aktivasi"
              className={`${secondaryButton} block w-full text-center`}
            >
              Baru pertama kali? Aktifkan akun
            </Link>
          </>
        )}

        <p className="pt-2 text-center text-xs text-slate-500">
          Butuh bantuan? Hubungi bendahara SP kamu.
        </p>
      </div>
    </main>
  );
}

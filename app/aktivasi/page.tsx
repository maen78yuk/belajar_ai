import Link from "next/link";
import { redirect } from "next/navigation";

import ActivateForm from "@/components/ActivateForm";
import { getSession } from "@/lib/auth";
import { homeForRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function AktivasiPage() {
  const session = await getSession();
  if (session) redirect(homeForRole(session.role));

  return (
    <main className="mx-auto w-full max-w-md px-5 py-12">
      <Link
        href="/"
        className="text-sm font-semibold text-slate-500 hover:text-slate-800"
      >
        ← Kembali
      </Link>

      <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
        Aktifkan akun kamu
      </h1>
      <p className="mt-2 mb-7 text-sm leading-relaxed text-slate-600">
        Cukup sekali. Setelah aktif, kamu bisa masuk pakai email dan password
        ini kapan saja.
      </p>

      <ActivateForm />
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";

import LoginForm from "@/components/LoginForm";
import { getSession } from "@/lib/auth";
import { homeForRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
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
        Masuk ke akun kamu
      </h1>
      <p className="mt-2 mb-7 text-sm leading-relaxed text-slate-600">
        Pakai email kantor yang sudah terdaftar di data anggota.
      </p>

      <LoginForm />
    </main>
  );
}

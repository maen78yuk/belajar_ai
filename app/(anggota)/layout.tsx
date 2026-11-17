import Link from "next/link";

import LogoutButton from "@/components/LogoutButton";
import MemberNav from "@/components/MemberNav";
import { requireMember } from "@/lib/rbac";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireMember();

  return (
    <div className="min-h-dvh pb-24">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-3">
          <Link
            href="/dashboard"
            className="text-sm font-bold tracking-tight text-brand-700"
          >
            Iuran SP
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl px-4 pt-5">{children}</main>

      <MemberNav />
    </div>
  );
}

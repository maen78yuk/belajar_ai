import LogoutButton from "@/components/LogoutButton";
import { requireStaff } from "@/lib/rbac";

const ROLE_LABEL: Record<string, string> = {
  superadmin: "Superadmin",
  bendahara: "Bendahara",
  ketua: "Ketua",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireStaff();

  return (
    <div className="min-h-dvh">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-bold tracking-tight text-brand-700">
              Panel Pengurus
            </p>
            <p className="text-xs text-slate-500">
              {session.email} · {ROLE_LABEL[session.role] ?? session.role}
            </p>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "@/lib/auth";

export const STAFF_ROLES: SessionPayload["role"][] = [
  "superadmin",
  "bendahara",
  "ketua",
];

export function isStaffRole(role: SessionPayload["role"]): boolean {
  return STAFF_ROLES.includes(role);
}

/** Halaman anggota: wajib login dan harus punya data keanggotaan. */
export async function requireMember(): Promise<
  SessionPayload & { memberId: string }
> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "anggota" || !session.memberId) redirect("/admin");
  return session as SessionPayload & { memberId: string };
}

/** Halaman pengurus: superadmin, bendahara, atau ketua. */
export async function requireStaff(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isStaffRole(session.role)) redirect("/dashboard");
  return session;
}

export function homeForRole(role: SessionPayload["role"]): string {
  return isStaffRole(role) ? "/admin" : "/dashboard";
}

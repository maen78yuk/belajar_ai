import { desc, eq, ilike } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { members, payments, settings, users } from "@/lib/db/schema";
import {
  buildTimeline,
  currentPeriod,
  resolveStart,
  type Timeline,
} from "@/lib/iuran";

export type SettingsView = {
  monthlyAmount: number;
  periodStart: string;
  bankInfo: string;
  waTemplate: string;
};

export const DEFAULT_SETTINGS: SettingsView = {
  monthlyAmount: 20000,
  periodStart: "2025-01",
  bankInfo:
    "Setor ke bendahara dulu ya. Nomor rekening akan tampil di sini setelah pengurus mengisinya.",
  waTemplate:
    "Halo {nama}, iuran SP kamu untuk {bulan} belum tercatat. Mohon dicek ya. Terima kasih.",
};

export async function getSettings(): Promise<SettingsView> {
  const db = getDb();
  const [row] = await db.select().from(settings).limit(1);
  if (!row) return DEFAULT_SETTINGS;
  return {
    monthlyAmount: row.monthlyAmount,
    periodStart: row.periodStart,
    bankInfo: row.bankInfo ?? DEFAULT_SETTINGS.bankInfo,
    waTemplate: row.waTemplate ?? DEFAULT_SETTINGS.waTemplate,
  };
}

export async function getUserByEmail(email: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(users)
    .where(ilike(users.email, email))
    .limit(1);
  return row ?? null;
}

export async function getMemberByEmail(email: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(members)
    .where(ilike(members.email, email))
    .limit(1);
  return row ?? null;
}

export type DashboardData = {
  member: {
    id: string;
    name: string;
    memberNo: string;
    unit: string | null;
  };
  settings: SettingsView;
  timeline: Timeline;
  arrearsAmount: number;
  monthlyAmount: number;
  packages: { months: number; amount: number }[];
};

export async function loadDashboard(
  memberId: string,
): Promise<DashboardData | null> {
  const db = getDb();
  const [member] = await db
    .select()
    .from(members)
    .where(eq(members.id, memberId))
    .limit(1);
  if (!member) return null;

  const config = await getSettings();
  const rows = await db
    .select()
    .from(payments)
    .where(eq(payments.memberId, memberId))
    .orderBy(desc(payments.submittedAt));

  const until = currentPeriod();
  const start = resolveStart(member.joinedAt, config.periodStart, until);
  const timeline = buildTimeline({ start, until, payments: rows });

  return {
    member: {
      id: member.id,
      name: member.name,
      memberNo: member.memberNo,
      unit: member.unit,
    },
    settings: config,
    timeline,
    arrearsAmount: timeline.unpaidPeriods.length * config.monthlyAmount,
    monthlyAmount: config.monthlyAmount,
    packages: [3, 6, 12].map((months) => ({
      months,
      amount: months * config.monthlyAmount,
    })),
  };
}

export type RiwayatItem = {
  id: string;
  startPeriod: string;
  months: number;
  amount: number;
  method: "transfer" | "tunai";
  status: "pending" | "verified" | "rejected";
  note: string | null;
  submittedAt: Date;
  verifiedAt: Date | null;
};

export async function loadRiwayat(memberId: string): Promise<RiwayatItem[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(payments)
    .where(eq(payments.memberId, memberId))
    .orderBy(desc(payments.submittedAt));

  return rows.map((row) => ({
    id: row.id,
    startPeriod: row.startPeriod,
    months: row.months,
    amount: row.amount,
    method: row.method,
    status: row.status,
    note: row.note,
    submittedAt: row.submittedAt,
    verifiedAt: row.verifiedAt,
  }));
}

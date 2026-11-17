"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { DatabaseNotConfiguredError, getDb } from "@/lib/db";
import { members, payments } from "@/lib/db/schema";
import type { FormState } from "@/lib/form-state";
import { buildTimeline, currentPeriod, resolveStart } from "@/lib/iuran";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const MAX_PROOF_BYTES = 1_500_000;
const PACKAGE_MONTHS = [3, 6, 12];

export async function submitPaymentAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await getSession();
  if (!session || session.role !== "anggota" || !session.memberId) {
    return { error: "Sesi kamu sudah berakhir. Silakan masuk lagi." };
  }

  const months = Number(formData.get("months"));
  if (!PACKAGE_MONTHS.includes(months)) {
    return { error: "Pilih paket 3, 6, atau 12 bulan." };
  }

  const proof = formData.get("proof");
  if (!(proof instanceof File) || proof.size === 0) {
    return { error: "Lampirkan bukti transfer (foto atau PDF)." };
  }
  if (proof.size > MAX_PROOF_BYTES) {
    return { error: "Ukuran bukti maksimal 1,5 MB. Coba foto ulang atau kompres dulu." };
  }
  if (!ALLOWED_TYPES.includes(proof.type)) {
    return { error: "Format bukti harus JPG, PNG, WEBP, atau PDF." };
  }

  const note = String(formData.get("note") ?? "")
    .trim()
    .slice(0, 300);

  try {
    const db = getDb();
    const [member] = await db
      .select()
      .from(members)
      .where(eq(members.id, session.memberId))
      .limit(1);
    if (!member) return { error: "Data anggota tidak ditemukan." };

    const config = await getSettings();
    const rows = await db
      .select()
      .from(payments)
      .where(eq(payments.memberId, member.id));

    const until = currentPeriod();
    const start = resolveStart(member.joinedAt, config.periodStart, until);
    const timeline = buildTimeline({ start, until, payments: rows });

    const bytes = Buffer.from(await proof.arrayBuffer());
    const proofData = `data:${proof.type};base64,${bytes.toString("base64")}`;

    await db.insert(payments).values({
      memberId: member.id,
      startPeriod: timeline.nextPeriod,
      months,
      amount: months * config.monthlyAmount,
      method: "transfer",
      proofData,
      status: "pending",
      note: note || null,
    });
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return { error: "Database belum terhubung. Hubungi pengurus." };
    }
    throw error;
  }

  revalidatePath("/dashboard");
  revalidatePath("/riwayat");
  redirect("/riwayat?kirim=1");
}

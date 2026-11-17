"use server";

import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { createSession, destroySession } from "@/lib/auth";
import { getMemberByEmail, getUserByEmail } from "@/lib/data";
import { DatabaseNotConfiguredError, getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import type { FormState } from "@/lib/form-state";
import { homeForRole } from "@/lib/rbac";

const NO_DB =
  "Database belum terhubung. Hubungi pengurus untuk menyelesaikan setup.";

function normalizeEmail(value: FormDataEntryValue | null): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  let user;
  try {
    user = await getUserByEmail(email);
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) return { error: NO_DB };
    throw error;
  }

  if (!user) {
    return { error: "Email atau password salah." };
  }
  if (!user.isActive) {
    return { error: "Akun kamu nonaktif. Hubungi bendahara." };
  }

  const passwordMatches = await compare(password, user.passwordHash);
  if (!passwordMatches) {
    return { error: "Email atau password salah." };
  }

  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    memberId: user.memberId,
    name: "",
  });

  try {
    const db = getDb();
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));
  } catch {
    // Catatan waktu login tidak penting; jangan gagalkan proses masuk.
  }

  redirect(homeForRole(user.role));
}

export async function activateAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!email) return { error: "Email kantor wajib diisi." };
  if (password.length < 8) {
    return { error: "Password minimal 8 karakter." };
  }
  if (password !== confirm) {
    return { error: "Konfirmasi password belum sama." };
  }

  let member;
  try {
    member = await getMemberByEmail(email);
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) return { error: NO_DB };
    throw error;
  }

  if (!member) {
    return {
      error:
        "Email ini belum terdaftar sebagai anggota. Hubungi bendahara untuk didaftarkan.",
    };
  }
  if (!member.isActive) {
    return { error: "Keanggotaan kamu sedang tidak aktif." };
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return { error: "Email ini sudah punya akun. Silakan masuk." };
  }

  const passwordHash = await hash(password, 10);

  let created;
  try {
    const db = getDb();
    const rows = await db
      .insert(users)
      .values({
        email: member.email.toLowerCase(),
        passwordHash,
        role: "anggota",
        memberId: member.id,
      })
      .returning();
    created = rows[0];
  } catch {
    return {
      error: "Gagal membuat akun. Coba lagi, atau hubungi bendahara.",
    };
  }

  if (!created) return { error: "Gagal membuat akun. Coba lagi." };

  await createSession({
    userId: created.id,
    email: created.email,
    role: created.role,
    memberId: created.memberId,
    name: member.name,
  });

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

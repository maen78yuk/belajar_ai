"use client";

import Link from "next/link";
import { useActionState } from "react";

import SubmitButton from "@/components/SubmitButton";
import { errorBoxClass, inputClass, labelClass } from "@/components/styles";
import { activateAction } from "@/lib/actions/auth";
import type { FormState } from "@/lib/form-state";

const initialState: FormState = null;

export default function ActivateForm() {
  const [state, formAction] = useActionState(activateAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <p className={errorBoxClass} role="alert">
          {state.error}
        </p>
      ) : null}

      <div>
        <label className={labelClass} htmlFor="email">
          Email kantor
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="nama@perusahaan.co.id"
          className={inputClass}
        />
        <p className="mt-1.5 text-xs text-slate-500">
          Harus sama dengan email yang didaftarkan bendahara.
        </p>
      </div>

      <div>
        <label className={labelClass} htmlFor="password">
          Password baru
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
        <p className="mt-1.5 text-xs text-slate-500">Minimal 8 karakter.</p>
      </div>

      <div>
        <label className={labelClass} htmlFor="confirm">
          Ulangi password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </div>

      <SubmitButton pendingLabel="Mengaktifkan…">Aktifkan akun</SubmitButton>

      <p className="text-center text-sm text-slate-600">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-600 underline-offset-4 hover:underline"
        >
          Masuk
        </Link>
      </p>
    </form>
  );
}

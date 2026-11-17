"use client";

import Link from "next/link";
import { useActionState } from "react";

import SubmitButton from "@/components/SubmitButton";
import { errorBoxClass, inputClass, labelClass } from "@/components/styles";
import { loginAction } from "@/lib/actions/auth";
import type { FormState } from "@/lib/form-state";

const initialState: FormState = null;

export default function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

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
      </div>

      <div>
        <label className={labelClass} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </div>

      <SubmitButton pendingLabel="Sedang masuk…">Masuk</SubmitButton>

      <p className="text-center text-sm text-slate-600">
        Belum pernah aktivasi?{" "}
        <Link
          href="/aktivasi"
          className="font-semibold text-brand-600 underline-offset-4 hover:underline"
        >
          Aktifkan akun
        </Link>
      </p>
    </form>
  );
}

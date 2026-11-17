"use client";

import { useActionState, useState } from "react";

import SubmitButton from "@/components/SubmitButton";
import {
  errorBoxClass,
  inputClass,
  labelClass,
  mutedText,
} from "@/components/styles";
import { submitPaymentAction } from "@/lib/actions/payments";
import type { FormState } from "@/lib/form-state";
import { periodLabel, rupiah } from "@/lib/format";
import { periodRange } from "@/lib/iuran";

type Pkg = { months: number; amount: number };

const initialState: FormState = null;

export default function PayForm({
  packages,
  startPeriod,
  monthlyAmount,
  bankInfo,
}: {
  packages: Pkg[];
  startPeriod: string;
  monthlyAmount: number;
  bankInfo: string;
}) {
  const [state, formAction] = useActionState(submitPaymentAction, initialState);
  const [months, setMonths] = useState(packages[0]?.months ?? 3);
  const covered = periodRange(startPeriod, months);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <p className={errorBoxClass} role="alert">
          {state.error}
        </p>
      ) : null}

      <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <p className="text-sm font-medium text-slate-500">Total transfer</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          {rupiah(months * monthlyAmount)}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {periodLabel(covered[0])} – {periodLabel(covered[covered.length - 1])}{" "}
          ({months} bulan)
        </p>
        <p className={`${mutedText} mt-3 border-t border-slate-100 pt-3`}>
          {bankInfo}
        </p>
      </section>

      <fieldset>
        <legend className={labelClass}>Pilih paket pembayaran</legend>
        <div className="space-y-2">
          {packages.map((pkg) => {
            const active = months === pkg.months;
            return (
              <label
                key={pkg.months}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3.5 transition ${
                  active
                    ? "border-brand-500 bg-brand-50 ring-2 ring-brand-100"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="months"
                    value={pkg.months}
                    checked={active}
                    onChange={() => setMonths(pkg.months)}
                    className="h-4 w-4 accent-brand-600"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">
                      {pkg.months} bulan
                    </span>
                    <span className="block text-xs text-slate-500">
                      {rupiah(monthlyAmount)} / bulan
                    </span>
                  </span>
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {rupiah(pkg.amount)}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label className={labelClass} htmlFor="proof">
          Bukti transfer
        </label>
        <input
          id="proof"
          name="proof"
          type="file"
          required
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="block w-full cursor-pointer rounded-xl border border-slate-300 bg-white text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
        />
        <p className="mt-1.5 text-xs text-slate-500">
          Foto atau PDF, maksimal 1,5 MB.
        </p>
      </div>

      <div>
        <label className={labelClass} htmlFor="note">
          Catatan (opsional)
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          maxLength={300}
          placeholder="Contoh: transfer dari rekening istri"
          className={inputClass}
        />
      </div>

      <SubmitButton pendingLabel="Mengirim…">
        Kirim bukti pembayaran
      </SubmitButton>

      <p className="text-center text-xs text-slate-500">
        Setelah dikirim, status berubah menjadi “menunggu verifikasi” sampai
        bendahara memeriksanya.
      </p>
    </form>
  );
}

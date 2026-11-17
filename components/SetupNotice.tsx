import { cardClass, mutedText } from "@/components/styles";

export default function SetupNotice() {
  return (
    <div className={cardClass}>
      <h2 className="text-lg font-bold text-slate-900">Database belum terhubung</h2>
      <p className={`${mutedText} mt-2`}>
        Halaman ini butuh koneksi database. Selesaikan dua langkah ini:
      </p>
      <ol className="mt-4 space-y-2 text-sm text-slate-700">
        <li>
          1. Isi <code className="rounded bg-slate-100 px-1.5 py-0.5">DATABASE_URL</code>{" "}
          dan <code className="rounded bg-slate-100 px-1.5 py-0.5">AUTH_SECRET</code> di
          file <code className="rounded bg-slate-100 px-1.5 py-0.5">.env.local</code>.
        </li>
        <li>
          2. Jalankan{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5">npm run db:push</code>{" "}
          untuk membuat tabel.
        </li>
      </ol>
    </div>
  );
}

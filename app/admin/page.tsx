import { cardClass, mutedText } from "@/components/styles";

export default function AdminHomePage() {
  return (
    <div className={cardClass}>
      <h1 className="text-lg font-bold text-slate-900">
        Panel pengurus sedang disiapkan
      </h1>
      <p className={`${mutedText} mt-2`}>
        Halaman ini sudah dilindungi peran pengurus. Verifikasi bukti transfer,
        data anggota, daftar tunggakan, dan import Excel akan masuk pada tahap
        berikutnya.
      </p>
    </div>
  );
}

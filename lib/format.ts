const rupiahFormat = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

export function rupiah(value: number): string {
  return `Rp ${rupiahFormat.format(value)}`;
}

const MONTHS_LONG = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export function monthName(month: number): string {
  return MONTHS_LONG[month - 1] ?? "";
}

export function monthShort(month: number): string {
  return MONTHS_SHORT[month - 1] ?? "";
}

/** "2025-03" -> "Maret 2025" */
export function periodLabel(period: string): string {
  const [year, month] = period.split("-");
  return `${monthName(Number(month))} ${year}`;
}

/** "2025-03" -> "Mar" */
export function periodShort(period: string): string {
  const [, month] = period.split("-");
  return monthShort(Number(month));
}

export function dateLabel(value: Date | string | null): string {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

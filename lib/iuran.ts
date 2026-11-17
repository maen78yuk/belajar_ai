export type PeriodStatus = "paid" | "pending" | "unpaid";

export type PeriodCell = {
  period: string;
  status: PeriodStatus;
};

export type PaymentLike = {
  startPeriod: string;
  months: number;
  status: "pending" | "verified" | "rejected";
};

export type Timeline = {
  cells: PeriodCell[];
  unpaidPeriods: string[];
  pendingCount: number;
  coveredUntil: string | null;
  firstUnpaid: string | null;
  nextPeriod: string;
};

const PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isPeriod(value: string): boolean {
  return PERIOD_PATTERN.test(value);
}

/** Bulan berjalan menurut zona waktu Asia/Jakarta, format "YYYY-MM". */
export function currentPeriod(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  return `${year}-${month}`;
}

export function nextPeriod(period: string): string {
  const [year, month] = period.split("-").map(Number);
  if (month === 12) return `${year + 1}-01`;
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export function periodRange(start: string, months: number): string[] {
  const result: string[] = [];
  let cursor = start;
  for (let index = 0; index < Math.max(0, months); index += 1) {
    result.push(cursor);
    cursor = nextPeriod(cursor);
  }
  return result;
}

export function listPeriods(start: string, until: string): string[] {
  const result: string[] = [];
  let cursor = start;
  let guard = 0;
  while (cursor <= until && guard < 1200) {
    result.push(cursor);
    cursor = nextPeriod(cursor);
    guard += 1;
  }
  return result;
}

/** Period terakhir dari dua period ("YYYY-MM" aman dibandingkan sebagai string). */
export function laterPeriod(a: string, b: string): string {
  return a > b ? a : b;
}

/** "2025-03-14" -> "2025-03" */
export function monthOf(value: string | Date | null): string | null {
  if (!value) return null;
  if (value instanceof Date) {
    return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}`;
  }
  const match = /^(\d{4})-(\d{2})/.exec(value);
  return match ? `${match[1]}-${match[2]}` : null;
}

/**
 * Bulan pertama yang ditagih: gabungan periode mulai sistem dan bulan bergabung,
 * tidak pernah melewati bulan berjalan.
 */
export function resolveStart(
  joinedAt: string | Date | null,
  configuredStart: string,
  until: string,
): string {
  const joined = monthOf(joinedAt);
  const base = joined ? laterPeriod(configuredStart, joined) : configuredStart;
  return base > until ? until : base;
}

/**
 * Bangun cakupan bulan dari daftar pembayaran.
 * Pembayaran `verified` menang atas `pending` bila bulan bertumpuk,
 * dan `rejected` diabaikan sepenuhnya.
 */
export function buildTimeline(input: {
  start: string;
  until: string;
  payments: PaymentLike[];
}): Timeline {
  const statuses = new Map<string, "paid" | "pending">();

  for (const payment of input.payments) {
    if (payment.status === "rejected") continue;
    const target = payment.status === "verified" ? "paid" : "pending";
    for (const period of periodRange(payment.startPeriod, payment.months)) {
      const existing = statuses.get(period);
      if (existing === "paid") continue;
      statuses.set(period, target);
    }
  }

  const cells: PeriodCell[] = listPeriods(input.start, input.until).map(
    (period) => ({
      period,
      status: statuses.get(period) ?? "unpaid",
    }),
  );

  const unpaidPeriods = cells
    .filter((cell) => cell.status === "unpaid")
    .map((cell) => cell.period);

  let coveredUntil: string | null = null;
  for (const cell of cells) {
    if (cell.status !== "paid") break;
    coveredUntil = cell.period;
  }

  return {
    cells,
    unpaidPeriods,
    pendingCount: cells.filter((cell) => cell.status === "pending").length,
    coveredUntil,
    firstUnpaid: unpaidPeriods[0] ?? null,
    nextPeriod: unpaidPeriods[0] ?? nextPeriod(input.until),
  };
}

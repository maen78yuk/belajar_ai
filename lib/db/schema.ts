import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", [
  "superadmin",
  "bendahara",
  "ketua",
  "anggota",
]);

export const paymentMethod = pgEnum("payment_method", ["transfer", "tunai"]);

export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "verified",
  "rejected",
]);

export const members = pgTable("members", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberNo: text("member_no").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  unit: text("unit"),
  joinedAt: date("joined_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("anggota"),
  memberId: uuid("member_id").references(() => members.id, {
    onDelete: "set null",
  }),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  startPeriod: text("start_period").notNull(),
  months: integer("months").notNull(),
  amount: integer("amount").notNull(),
  method: paymentMethod("method").notNull().default("transfer"),
  proofData: text("proof_data"),
  status: paymentStatus("status").notNull().default("pending"),
  note: text("note"),
  submittedAt: timestamp("submitted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  verifiedById: uuid("verified_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
});

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  monthlyAmount: integer("monthly_amount").notNull().default(20000),
  periodStart: text("period_start").notNull().default("2025-01"),
  bankInfo: text("bank_info"),
  waTemplate: text("wa_template"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  target: text("target"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Member = typeof members.$inferSelect;
export type User = typeof users.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type SettingsRow = typeof settings.$inferSelect;

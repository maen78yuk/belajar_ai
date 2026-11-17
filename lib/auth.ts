import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "sp_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type UserRole = "superadmin" | "bendahara" | "ketua" | "anggota";

export type SessionPayload = {
  userId: string;
  email: string;
  role: UserRole;
  memberId: string | null;
  name: string;
};

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET belum diset. Tambahkan AUTH_SECRET di file .env.local.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, getSecret());
    const role = payload.role;
    if (
      role !== "superadmin" &&
      role !== "bendahara" &&
      role !== "ketua" &&
      role !== "anggota"
    ) {
      return null;
    }

    return {
      userId: String(payload.userId),
      email: String(payload.email),
      role,
      memberId: payload.memberId ? String(payload.memberId) : null,
      name: String(payload.name ?? ""),
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

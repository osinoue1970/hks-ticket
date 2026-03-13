import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie) return null;

  try {
    const data = JSON.parse(sessionCookie.value);
    const employee = await prisma.employee.findUnique({
      where: { id: data.id },
    });
    return employee;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (!session.isAdmin) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

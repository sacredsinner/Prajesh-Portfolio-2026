"use server"

import { cookies } from "next/headers"
import { ADMIN_EMAIL } from "@/lib/auth"

export async function loginLocalAdmin(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const password = String(formData.get("password") || "").trim()

  const isAllowedUser =
    email === "admin" ||
    email.startsWith("admin@") ||
    email === "admin@local.test" ||
    email === ADMIN_EMAIL.toLowerCase()

  if (isAllowedUser && password === "admin@123") {
    const cookieStore = await cookies()
    cookieStore.set("dev_admin_session", "true", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    return { ok: true }
  }

  return { ok: false, error: "Invalid credentials. Use admin / admin@123 for local login." }
}

export async function logoutLocalAdmin() {
  const cookieStore = await cookies()
  cookieStore.delete("dev_admin_session")
  return { ok: true }
}

import type { Metadata } from "next"
import { ForgotPasswordForm } from "@/components/password-reset-form"

export const metadata: Metadata = { title: "Forgot password", robots: { index: false, follow: false } }

export default function ForgotPasswordPage() {
  return <main className="flex min-h-screen items-center justify-center px-6 py-16"><ForgotPasswordForm /></main>
}

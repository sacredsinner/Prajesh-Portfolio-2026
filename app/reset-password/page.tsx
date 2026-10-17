import type { Metadata } from "next"
import { ResetPasswordForm } from "@/components/password-reset-form"

export const metadata: Metadata = { title: "Reset password", robots: { index: false, follow: false } }

type Props = { searchParams: Promise<{ token?: string }> }

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams
  return <main className="flex min-h-screen items-center justify-center px-6 py-16">{token ? <ResetPasswordForm token={token} /> : <p className="text-sm text-destructive">This reset link is missing its token.</p>}</main>
}

import { createClient } from '@/lib/supabase/client'
import type { ConfirmResetInput, ForgotPasswordInput, LoginInput, SignupInput } from '../types'

function buildCallbackUrl(redirectPath?: string) {
  const url = new URL(
    '/auth/callback',
    process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
  )
  if (redirectPath) url.searchParams.set('redirect', redirectPath)
  return url.toString()
}

export async function login(input: LoginInput) {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword(input)
  if (error) throw error
}

export async function signup(input: SignupInput, redirectPath?: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { emailRedirectTo: buildCallbackUrl(redirectPath) },
  })
  if (error) throw error
  return { needsEmailConfirmation: !data.session }
}

export async function sendPasswordReset(input: ForgotPasswordInput) {
  const supabase = createClient()
  // Sin redirectTo: el email de recuperación solo lleva el código {{ .Token }},
  // no un enlace clicable (ver plantilla en Supabase) — un enlace se puede
  // consumir en el momento en que llega el correo si algún escáner de seguridad
  // de correo lo previsita, igual que pasaba con el magic link de login.
  const { error } = await supabase.auth.resetPasswordForEmail(input.email)
  if (error) throw error
}

export async function confirmPasswordReset(email: string, input: ConfirmResetInput) {
  const supabase = createClient()
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token: input.token,
    type: 'recovery',
  })
  if (verifyError) throw verifyError

  const { error: updateError } = await supabase.auth.updateUser({ password: input.password })
  if (updateError) throw updateError
}

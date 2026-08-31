import { createClient } from '@/lib/supabase/client'
import type { ForgotPasswordInput, LoginInput, SignupInput, UpdatePasswordInput } from '../types'

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
  const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
    redirectTo: buildCallbackUrl('/actualizar-contrasena'),
  })
  if (error) throw error
}

export async function updatePassword(input: UpdatePasswordInput) {
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password: input.password })
  if (error) throw error
}

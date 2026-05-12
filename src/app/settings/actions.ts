'use server'

import { createClient } from '@/lib/supabase/server'
import { defaultDashboardLayout } from '@/components/layout/grid/defaultLayout'
import type { DashboardLayout } from '@/types/layout'

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('인증이 필요합니다.')
  return { supabase, userId: user.id }
}

export async function getDashboardLayout(): Promise<DashboardLayout> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { data, error } = await supabase
    .from('user_settings')
    .select('dashboard_layout')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return (data?.dashboard_layout as DashboardLayout) ?? defaultDashboardLayout
}

export async function saveDashboardLayout(layout: DashboardLayout): Promise<void> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, dashboard_layout: layout }, { onConflict: 'user_id' })

  if (error) throw new Error(error.message)
}

export async function resetDashboardLayout(): Promise<void> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, dashboard_layout: defaultDashboardLayout }, { onConflict: 'user_id' })

  if (error) throw new Error(error.message)
}

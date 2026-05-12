'use server'

import { createClient } from '@/lib/supabase/server'
import { dbToRegretItem, regretItemToDb } from '@/lib/db/mappers'
import type { RegretItem } from '@/types'

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('인증이 필요합니다.')
  return { supabase, userId: user.id }
}

export async function getRegretItems(): Promise<RegretItem[]> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { data, error } = await supabase
    .from('regret_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(dbToRegretItem)
}

export async function createRegretItem(item: RegretItem): Promise<RegretItem> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { data, error } = await supabase
    .from('regret_items')
    .insert(regretItemToDb(item, userId))
    .select()
    .single()

  if (error) throw new Error(error.message)
  return dbToRegretItem(data)
}

export async function deleteRegretItem(id: string): Promise<void> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { error } = await supabase
    .from('regret_items')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

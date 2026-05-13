'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { dbToInsight, insightToDb } from '@/lib/db/mappers'
import type { Insight } from '@/types'

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('인증이 필요합니다.')
  return { supabase, userId: user.id }
}

export async function getInsights(): Promise<Insight[]> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(dbToInsight)
}

export async function createInsight(item: Insight): Promise<Insight> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { data, error } = await supabase
    .from('insights')
    .insert(insightToDb(item, userId))
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
  return dbToInsight(data)
}

export async function deleteInsight(id: string): Promise<void> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { error } = await supabase
    .from('insights')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

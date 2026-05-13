'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { dbToWant, wantToDb } from '@/lib/db/mappers'
import type { WantItem } from '@/types'

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('?몄쬆???꾩슂?⑸땲??')
  return { supabase, userId: user.id }
}

export async function getWants(): Promise<WantItem[]> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { data, error } = await supabase
    .from('wants')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(dbToWant)
}

export async function createWant(item: WantItem): Promise<WantItem> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { data, error } = await supabase
    .from('wants')
    .insert(wantToDb(item, userId))
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/', 'page')
  return dbToWant(data)
}

export async function updateWant(id: string, updates: Partial<WantItem>): Promise<WantItem> {
  const { supabase, userId } = await getAuthenticatedUser()

  // camelCase ??snake_case 遺遺?蹂??(蹂寃쎈맂 ?꾨뱶留?
  // Partial update: only map fields that are actually present
  const dbUpdates: Record<string, unknown> = {}
  if (updates.name !== undefined)                   dbUpdates.name = updates.name
  if (updates.price !== undefined)                  dbUpdates.price = updates.price
  if (updates.category !== undefined)               dbUpdates.category = updates.category
  if (updates.reason !== undefined)                 dbUpdates.reason = updates.reason
  if (updates.status !== undefined)                 dbUpdates.status = updates.status
  if (updates.score !== undefined)                  dbUpdates.score = updates.score
  if (updates.requiredCapital !== undefined)        dbUpdates.required_capital = updates.requiredCapital
  if (updates.targetDate !== undefined)             dbUpdates.target_date = updates.targetDate
  if (updates.priority !== undefined)               dbUpdates.priority = updates.priority
  if (updates.targetMonths !== undefined)           dbUpdates.target_months = updates.targetMonths
  if (updates.expectedYield !== undefined)          dbUpdates.expected_yield = updates.expectedYield
  if (updates.monthlyCashflowNeeded !== undefined)  dbUpdates.monthly_cashflow_needed = updates.monthlyCashflowNeeded
  if (updates.currency !== undefined)               dbUpdates.currency = updates.currency

  const { data, error } = await supabase
    .from('wants')
    .update(dbUpdates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return dbToWant(data)
}

export async function deleteWant(id: string): Promise<void> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { error } = await supabase
    .from('wants')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}


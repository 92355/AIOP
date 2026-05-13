'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { dbToRetro, retroToDb, todoToDb } from '@/lib/db/mappers'
import type { KptRetro, RetroItem, TodoItem } from '@/types'

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('인증이 필요합니다.')
  return { supabase, userId: user.id }
}

export async function getRetros(): Promise<KptRetro[]> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { data, error } = await supabase
    .from('retros')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(dbToRetro)
}

// date 기준 upsert — UNIQUE(user_id, date) 활용
export async function saveRetro(retro: KptRetro): Promise<void> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { error } = await supabase
    .from('retros')
    .upsert(retroToDb(retro, userId), { onConflict: 'user_id,date' })

  if (error) throw new Error(error.message)
}

export async function deleteRetroByDate(date: string): Promise<void> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { error } = await supabase
    .from('retros')
    .delete()
    .eq('user_id', userId)
    .eq('date', date)

  if (error) throw new Error(error.message)
}

export async function addRetroItem(
  date: string,
  section: 'keep' | 'problem' | 'try',
  item: RetroItem,
  todo?: TodoItem,
): Promise<void> {
  const { supabase, userId } = await getAuthenticatedUser()

  const { data: existing } = await supabase
    .from('retros')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle()

  const now = new Date().toISOString()

  if (existing) {
    const retro = dbToRetro(existing)
    const updatedRetro: KptRetro = {
      ...retro,
      [section]: [...retro[section], item],
      updatedAt: now,
    }
    const { error } = await supabase
      .from('retros')
      .update(retroToDb(updatedRetro, userId))
      .eq('user_id', userId)
      .eq('date', date)
    if (error) throw new Error(error.message)
  } else {
    const newRetro: KptRetro = {
      id: crypto.randomUUID(),
      date,
      keep: section === 'keep' ? [item] : [],
      problem: section === 'problem' ? [item] : [],
      try: section === 'try' ? [item] : [],
      createdAt: now,
      updatedAt: now,
    }
    const { error } = await supabase
      .from('retros')
      .insert(retroToDb(newRetro, userId))
    if (error) throw new Error(error.message)
  }

  if (todo) {
    const { error } = await supabase.from('todos').insert(todoToDb(todo, userId))
    if (error) throw new Error(error.message)
  }

  revalidatePath('/', 'layout')
}

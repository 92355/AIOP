'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { dbToRetro, retroToDb, todoToDb } from '@/lib/db/mappers'
import type { KptRetro, RetroItem, TodoItem } from '@/types'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function ensureUuid(value: string): string {
  return UUID_PATTERN.test(value) ? value : crypto.randomUUID()
}

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('?몄쬆???꾩슂?⑸땲??')
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

// date 湲곗? upsert ??UNIQUE(user_id, date) ?쒖슜
export async function saveRetro(retro: KptRetro): Promise<void> {
  const { supabase, userId } = await getAuthenticatedUser()
  const safeRetro: KptRetro = {
    ...retro,
    id: ensureUuid(retro.id),
  }
  const { error } = await supabase
    .from('retros')
    .upsert(retroToDb(safeRetro, userId), { onConflict: 'user_id,date' })

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

  revalidatePath('/', 'page')
}


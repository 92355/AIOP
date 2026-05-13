'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { dbToNote, noteToDb } from '@/lib/db/mappers'
import type { Note, NoteStatus } from '@/types'

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('?몄쬆???꾩슂?⑸땲??')
  return { supabase, userId: user.id }
}

export async function getNotes(): Promise<Note[]> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(dbToNote)
}

export async function createNote(item: Note): Promise<Note> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { data, error } = await supabase
    .from('notes')
    .insert(noteToDb(item, userId))
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/', 'page')
  return dbToNote(data)
}

export async function updateNoteStatus(id: string, status: NoteStatus): Promise<void> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { error } = await supabase
    .from('notes')
    .update({ status })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export async function deleteNote(id: string): Promise<void> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}


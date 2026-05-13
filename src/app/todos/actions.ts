'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { dbToTodo, todoToDb } from '@/lib/db/mappers'
import type { TodoItem, TodoStatus } from '@/types'

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('인증이 필요합니다.')
  return { supabase, userId: user.id }
}

export async function getTodos(): Promise<TodoItem[]> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(dbToTodo)
}

export async function createTodo(item: TodoItem): Promise<TodoItem> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { data, error } = await supabase
    .from('todos')
    .insert(todoToDb(item, userId))
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
  return dbToTodo(data)
}

export async function updateTodoStatus(id: string, status: TodoStatus): Promise<void> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { error } = await supabase
    .from('todos')
    .update({ status })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export async function updateTodoMemo(id: string, memo: string | undefined): Promise<void> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { error } = await supabase
    .from('todos')
    .update({ memo: memo ?? null })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export async function updateTodoTitle(id: string, title: string): Promise<void> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { error } = await supabase
    .from('todos')
    .update({ title })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export async function deleteTodo(id: string): Promise<void> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

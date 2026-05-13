'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { dbToSubscription, subscriptionToDb } from '@/lib/db/mappers'
import type { Subscription, SubscriptionStatus } from '@/types'

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('?몄쬆???꾩슂?⑸땲??')
  return { supabase, userId: user.id }
}

export async function getSubscriptions(): Promise<Subscription[]> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(dbToSubscription)
}

export async function createSubscription(item: Subscription): Promise<Subscription> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { data, error } = await supabase
    .from('subscriptions')
    .insert(subscriptionToDb(item, userId))
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/', 'page')
  return dbToSubscription(data)
}

export async function updateSubscriptionStatus(id: string, status: SubscriptionStatus): Promise<void> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { error } = await supabase
    .from('subscriptions')
    .update({ status })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export async function deleteSubscription(id: string): Promise<void> {
  const { supabase, userId } = await getAuthenticatedUser()
  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}


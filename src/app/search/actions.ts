'use server'

import { getWants } from '@/app/wants/actions'
import { getSubscriptions } from '@/app/subscriptions/actions'
import { getInsights } from '@/app/insights/actions'
import { getNotes } from '@/app/notes/actions'
import { getTodos } from '@/app/todos/actions'
import { getRetros } from '@/app/retros/actions'
import { searchAllDomains, type SearchGroup } from '@/lib/globalSearch'

export async function searchDomains(query: string, maxPerDomain = 3): Promise<SearchGroup[]> {
  if (query.trim().length < 1) return []
  const [wants, subscriptions, insights, notes, todos, retros] = await Promise.all([
    getWants(),
    getSubscriptions(),
    getInsights(),
    getNotes(),
    getTodos(),
    getRetros(),
  ])
  return searchAllDomains({ wants, subscriptions, insights, notes, todos, retros }, query, maxPerDomain)
}

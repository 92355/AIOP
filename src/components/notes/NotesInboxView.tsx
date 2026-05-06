"use client";

import { Send } from "lucide-react";
import { notes } from "@/data/mockData";

export function NotesInboxView() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-soft">
        <h2 className="text-3xl font-semibold text-zinc-50">Quick Capture</h2>
        <p className="mt-2 text-zinc-500">분류하기 전의 생각을 빠르게 받아두는 공간입니다.</p>
        <textarea
          className="mt-6 min-h-64 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm leading-6 text-zinc-200 outline-none placeholder:text-zinc-600"
          placeholder="사고 싶은 것, 책에서 본 문장, 나중에 정리할 생각..."
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {["want", "insight", "subscription", "later"].map((tag) => (
              <span key={tag} className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">#{tag}</span>
            ))}
          </div>
          <button type="button" className="flex h-11 items-center gap-2 rounded-2xl bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-300">
            <Send className="h-4 w-4" />
            Capture
          </button>
        </div>
      </section>
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-soft">
        <h3 className="text-xl font-semibold text-zinc-50">Recent Notes</h3>
        <p className="mt-1 text-sm text-zinc-500">나중에 Wants, Insights, Subscriptions로 흘러갈 수 있습니다.</p>
        <div className="mt-5 space-y-3">
          {notes.map((item) => (
            <article key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <div className="flex items-start justify-between gap-4">
                <h4 className="font-medium text-zinc-100">{item.title}</h4>
                <span className="text-xs text-zinc-500">{item.createdAt}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{item.body}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400">#{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

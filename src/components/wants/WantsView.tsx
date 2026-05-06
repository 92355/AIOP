"use client";

import { Plus } from "lucide-react";
import { wants } from "@/data/mockData";
import { WantCard } from "@/components/wants/WantCard";

const filters = ["All", "Productivity", "Lifestyle", "Investment", "Hobby"];

export function WantsView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-zinc-50">구매 욕구를 운영 가능한 목표로 바꾸기</h2>
          <p className="mt-2 text-zinc-500">가격, 이유, 판단 점수, 필요한 자산 규모를 한 번에 봅니다.</p>
        </div>
        <button type="button" className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-300">
          <Plus className="h-4 w-4" />
          Add Want
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {filters.map((filter, index) => (
          <button
            key={filter}
            type="button"
            className={`rounded-2xl border px-4 py-2 text-sm ${
              index === 0
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {wants.map((item) => (
          <WantCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

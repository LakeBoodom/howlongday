'use client'

import { useState } from 'react'

export interface FaqEntry {
  q: string
  a: string
}

export function FaqAccordion({ items }: { items: FaqEntry[] }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <ul className="divide-y divide-white/10 overflow-hidden rounded-card border border-white/10 bg-white/[0.03]">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <li key={i}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.03]"
              aria-expanded={isOpen}
            >
              <span className="font-medium text-white">{item.q}</span>
              <span
                aria-hidden
                className={`text-neutral-3 transition ${isOpen ? 'rotate-45' : ''}`}
              >
                +
              </span>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-sm leading-relaxed text-neutral-2">
                {item.a}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

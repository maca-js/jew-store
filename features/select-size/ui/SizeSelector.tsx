'use client'

import { cn } from '@/shared/lib/cn'

interface SizeSelectorProps {
  sizes: string[]
  selected: string | null
  onSelect: (size: string) => void
  label: string
}

export function SizeSelector({ sizes, selected, onSelect, label }: SizeSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-sans tracking-widest uppercase text-brand-muted">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onSelect(size)}
            className={cn(
              'w-11 h-11 text-sm font-sans border transition-colors',
              selected === size
                ? 'bg-brand-black text-brand-white border-brand-black'
                : 'bg-brand-white text-brand-black border-brand-border hover:border-brand-black',
            )}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  )
}

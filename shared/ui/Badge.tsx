import { cn } from '@/shared/lib/cn'

type BadgeVariant = 'new' | 'sale' | 'bestseller'

const labels: Record<BadgeVariant, string> = {
  new: 'New',
  sale: 'Sale',
  bestseller: 'Best Seller',
}

interface BadgeProps {
  variant: BadgeVariant
  className?: string
}

export function Badge({ variant, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-block text-[10px] font-sans tracking-widest uppercase px-2 py-1',
        {
          'bg-brand-black text-brand-white': variant === 'new',
          'bg-red-500 text-brand-white': variant === 'sale',
          'bg-brand-gray text-brand-black border border-brand-border':
            variant === 'bestseller',
        },
        className,
      )}
    >
      {labels[variant]}
    </span>
  )
}

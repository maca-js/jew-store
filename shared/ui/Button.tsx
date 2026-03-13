import { cn } from '@/shared/lib/cn'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-sans tracking-widest uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-brand-black text-brand-white hover:bg-brand-black/80':
              variant === 'primary',
            'border border-brand-black text-brand-black hover:bg-brand-black hover:text-brand-white':
              variant === 'outline',
            'text-brand-black hover:text-brand-muted': variant === 'ghost',
          },
          {
            'text-xs px-4 py-2': size === 'sm',
            'text-xs px-6 py-3': size === 'md',
            'text-sm px-8 py-4': size === 'lg',
          },
          className,
        )}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'

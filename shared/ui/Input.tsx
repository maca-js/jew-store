import { cn } from '@/shared/lib/cn'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-sans tracking-widest uppercase text-brand-muted"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full border border-brand-border bg-brand-white px-4 py-3 text-sm font-sans text-brand-black placeholder:text-brand-muted focus:outline-none focus:border-brand-black transition-colors',
            error && 'border-red-400',
            className,
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 font-sans">{error}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

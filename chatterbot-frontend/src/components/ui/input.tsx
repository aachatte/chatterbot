import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full rounded-md border border-[color:var(--cb-border)] bg-surface px-4 py-3 text-base text-surface-foreground shadow-sm transition placeholder:text-[color:var(--cb-text-tertiary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
      className
    )}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input }

import * as React from 'react'

import { cn } from '@/lib/utils'

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[color:var(--cb-border)] bg-surface p-6 shadow-card',
        className
      )}
      {...props}
    />
  )
}

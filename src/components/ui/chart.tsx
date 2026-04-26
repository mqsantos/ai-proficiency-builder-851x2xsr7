import * as React from 'react'
import { cn } from '@/lib/utils'

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config?: Record<string, any>
  }
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('w-full', className)} {...props}>
    {children}
  </div>
))
ChartContainer.displayName = 'ChartContainer'

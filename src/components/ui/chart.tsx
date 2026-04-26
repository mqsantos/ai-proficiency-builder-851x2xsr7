import * as React from 'react'
import { cn } from '@/lib/utils'
import { Tooltip } from 'recharts'

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

export const ChartTooltip = Tooltip

export const ChartTooltipContent = React.forwardRef<HTMLDivElement, any>(
  (
    {
      active,
      payload,
      className,
      indicator = 'dot',
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref,
  ) => {
    if (!active || !payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn('rounded-lg border bg-background px-3 py-2 text-sm shadow-md', className)}
      >
        {!hideLabel && label ? <div className="font-medium mb-1.5">{label}</div> : null}
        <div className="grid gap-1.5">
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {!hideIndicator && (
                  <div
                    className={cn(
                      'shrink-0',
                      indicator === 'dot' && 'h-2 w-2 rounded-full',
                      indicator === 'line' && 'w-1 h-3 rounded-full',
                      indicator === 'dashed' && 'w-3 h-0.5 rounded-full border-b border-dashed',
                    )}
                    style={{
                      backgroundColor: item.color || item.payload?.fill,
                    }}
                  />
                )}
                <span className="text-muted-foreground">{item.name}</span>
              </div>
              <span className="font-medium tabular-nums text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
)
ChartTooltipContent.displayName = 'ChartTooltipContent'

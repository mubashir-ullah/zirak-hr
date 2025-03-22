import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  variant?: "default" | "card" | "avatar" | "text" | "button"
}

/**
 * A skeleton loader component that provides visual feedback during content loading
 */
export function Skeleton({
  className,
  variant = "default",
  ...props
}: SkeletonProps) {
  const variantClasses = {
    default: "w-full h-4 rounded-md",
    card: "w-full h-40 rounded-lg",
    avatar: "h-12 w-12 rounded-full",
    text: "h-4 w-3/4 rounded-md",
    button: "h-10 w-20 rounded-md",
  }

  return (
    <div
      className={cn(
        "animate-pulse bg-muted/60",
        variantClasses[variant],
        className
      )}
      {...props}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

/**
 * A skeleton card component for showing loading state of card elements
 */
export function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("space-y-4 rounded-lg border p-6", className)}
      {...props}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="space-y-3">
        <Skeleton variant="avatar" className="h-12 w-12" />
        <Skeleton variant="text" className="h-5 w-1/2" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton variant="button" />
        <Skeleton variant="button" />
      </div>
      <span className="sr-only">Loading card content...</span>
    </div>
  )
}

/**
 * A skeleton table component for showing loading state of table elements
 */
export function SkeletonTable({ 
  className, 
  rowCount = 5,
  columnCount = 4,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { 
  rowCount?: number
  columnCount?: number
}) {
  return (
    <div
      className={cn("w-full space-y-4", className)}
      {...props}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex space-x-4 pb-2">
        {Array.from({ length: columnCount }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-8 flex-1" />
        ))}
      </div>
      
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex space-x-4">
          {Array.from({ length: columnCount }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-6 flex-1" />
          ))}
        </div>
      ))}
      
      <span className="sr-only">Loading table content...</span>
    </div>
  )
}

import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = {
  default: "bg-blue-100 text-blue-800 border border-blue-200",
  secondary: "bg-gray-100 text-gray-800 border border-gray-200",
  destructive: "bg-red-100 text-red-800 border border-red-200",
  outline: "bg-white text-gray-700 border border-gray-300",
}

function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

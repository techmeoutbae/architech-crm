import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none tracking-[0.01em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-[#163f68]/15 bg-[#163f68] text-white",
        secondary: "border-slate-200/90 bg-slate-100/90 text-slate-600",
        success: "border-emerald-200/90 bg-emerald-50/90 text-emerald-700",
        warning: "border-amber-200/90 bg-amber-50/90 text-amber-700",
        destructive: "border-rose-200/90 bg-rose-50/90 text-rose-700",
        outline: "border-slate-200 text-slate-700",
        blue: "border-sky-200/90 bg-sky-50/90 text-sky-700",
        purple: "border-violet-200/90 bg-violet-50/90 text-violet-700",
        orange: "border-orange-200/90 bg-orange-50/90 text-orange-700",
        indigo: "border-indigo-200/90 bg-indigo-50/90 text-indigo-700",
        cyan: "border-cyan-200/90 bg-cyan-50/90 text-cyan-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-[transform,box-shadow,background-color,color,border-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91bbff] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-[#0a2e52] bg-[linear-gradient(180deg,#123c67_0%,#0a2744_100%)] text-white shadow-[0_18px_34px_-22px_rgba(8,33,61,0.92)] hover:-translate-y-0.5 hover:shadow-[0_22px_40px_-22px_rgba(8,33,61,0.98)]",
        destructive:
          "border border-red-700 bg-[linear-gradient(180deg,#d13c3c_0%,#b42323_100%)] text-white shadow-[0_18px_34px_-22px_rgba(127,29,29,0.8)] hover:-translate-y-0.5 hover:shadow-[0_22px_42px_-24px_rgba(127,29,29,0.88)]",
        outline:
          "border border-slate-200/90 bg-white/92 text-slate-700 shadow-[0_14px_24px_-22px_rgba(15,23,42,0.35)] hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950",
        secondary:
          "border border-slate-200/75 bg-slate-100/90 text-slate-700 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.24)] hover:bg-slate-200/80 hover:text-slate-900",
        ghost: "text-slate-600 hover:bg-white/75 hover:text-slate-950",
        link: "h-auto rounded-none px-0 py-0 text-[#1b4d7e] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2.5",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 px-6 text-[15px]",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

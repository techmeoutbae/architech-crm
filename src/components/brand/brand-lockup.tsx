import { cn } from "@/lib/utils"

interface BrandLockupProps {
  className?: string
  compact?: boolean
  theme?: "light" | "dark"
}

export function BrandLockup({
  className,
  compact = false,
  theme = "dark",
}: BrandLockupProps) {
  const isDark = theme === "dark"

  return (
    <div className={cn("flex items-center", className)}>
      {compact ? (
        <div
          className={cn(
            "inline-flex h-10 min-w-[3.5rem] items-center justify-center rounded-[14px] border px-3 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.4)]",
            isDark
              ? "border-white/12 bg-white/[0.08] text-white"
              : "border-slate-200/80 bg-white text-slate-900"
          )}
        >
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em]">CRM</span>
        </div>
      ) : (
        <div className="min-w-0">
          <p
            className={cn(
              "text-[0.68rem] font-semibold uppercase tracking-[0.14em]",
              isDark ? "text-white/46" : "text-slate-500"
            )}
          >
            Architech Designs
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <p
              className={cn(
                "truncate text-base font-semibold tracking-[-0.03em]",
                isDark ? "text-white" : "text-slate-950"
              )}
            >
              Architech CRM
            </p>
            <span
              className={cn(
                "hidden text-xs font-medium sm:inline",
                isDark ? "text-white/42" : "text-slate-400"
              )}
            >
              Client operations
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

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
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-2xl border text-[0.72rem] font-bold tracking-[0.24em] shadow-[0_16px_30px_-18px_rgba(15,23,42,0.7)]",
          isDark
            ? "border-white/15 bg-white/10 text-white backdrop-blur-md"
            : "border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#eef4fb_100%)] text-slate-900"
        )}
      >
        AD
      </div>

      {!compact ? (
        <div className="min-w-0">
          <p
            className={cn(
              "truncate text-sm font-semibold tracking-[0.02em]",
              isDark ? "text-white" : "text-slate-950"
            )}
          >
            Architech Designs CRM
          </p>
          <p
            className={cn(
              "truncate text-[0.72rem] font-medium uppercase tracking-[0.18em]",
              isDark ? "text-white/55" : "text-slate-500"
            )}
          >
            Client portal and operations
          </p>
        </div>
      ) : null}
    </div>
  )
}

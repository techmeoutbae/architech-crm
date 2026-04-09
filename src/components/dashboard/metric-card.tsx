import type { LucideIcon } from "lucide-react"
import { ArrowUpRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const toneStyles = {
  blue: {
    icon: "border-[#dbe8fb] bg-[#eef5ff] text-[#1c5385]",
    accent: "from-[#eff6ff] via-[#f7fbff] to-white",
    detail: "text-[#40698f]",
  },
  emerald: {
    icon: "border-[#d7ece5] bg-[#edf8f3] text-[#2f6f59]",
    accent: "from-[#effaf5] via-[#f8fcfa] to-white",
    detail: "text-[#4c7468]",
  },
  violet: {
    icon: "border-[#e7def7] bg-[#f5f1fe] text-[#624d9b]",
    accent: "from-[#f6f3ff] via-[#faf8ff] to-white",
    detail: "text-[#75648f]",
  },
  amber: {
    icon: "border-[#f2e4cb] bg-[#fff8ec] text-[#8b6830]",
    accent: "from-[#fff8ef] via-[#fffdfa] to-white",
    detail: "text-[#856c47]",
  },
  rose: {
    icon: "border-[#f3dfe3] bg-[#fff3f5] text-[#9a4b5b]",
    accent: "from-[#fff4f6] via-[#fffafb] to-white",
    detail: "text-[#8e6670]",
  },
  slate: {
    icon: "border-slate-200 bg-slate-100/90 text-slate-700",
    accent: "from-slate-50 via-white to-white",
    detail: "text-slate-500",
  },
} as const

interface MetricCardProps {
  title: string
  value: string
  detail?: string
  eyebrow?: string
  icon: LucideIcon
  tone?: keyof typeof toneStyles
}

export function MetricCard({
  title,
  value,
  detail,
  eyebrow,
  icon: Icon,
  tone = "blue",
}: MetricCardProps) {
  const styles = toneStyles[tone]

  return (
    <Card className="group overflow-hidden">
      <CardContent className="p-0">
        <div className={cn("bg-gradient-to-br p-5 sm:p-6", styles.accent)}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {eyebrow ? (
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {eyebrow}
                </p>
              ) : null}
              <p className="mt-2 text-sm font-medium text-slate-500">{title}</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-[2.15rem]">
                {value}
              </p>
            </div>

            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border shadow-[0_14px_32px_-24px_rgba(15,23,42,0.45)] transition-transform duration-200 group-hover:-translate-y-0.5",
                styles.icon
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>

          {detail ? (
            <div className={cn("mt-5 flex items-center gap-2 text-sm", styles.detail)}>
              <ArrowUpRight className="h-4 w-4" />
              <span>{detail}</span>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

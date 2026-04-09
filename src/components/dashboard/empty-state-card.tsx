import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface EmptyStateCardProps {
  icon: LucideIcon
  title: string
  description: string
  hint?: string
  action?: ReactNode
}

export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  hint,
  action,
}: EmptyStateCardProps) {
  return (
    <Card className="border-dashed border-slate-200/90 bg-white/74">
      <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center sm:px-10 sm:py-14">
        <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#eef4fb_100%)] text-slate-400 shadow-[0_18px_38px_-30px_rgba(15,23,42,0.22)] sm:h-16 sm:w-16">
          <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>
        <h3 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-slate-950 sm:text-xl">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 sm:leading-7">{description}</p>
        {hint ? (
          <p className="mt-2 max-w-sm text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
            {hint}
          </p>
        ) : null}
        {action ? <div className="mt-5 flex flex-wrap justify-center gap-3">{action}</div> : null}
      </CardContent>
    </Card>
  )
}

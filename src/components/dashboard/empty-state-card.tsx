import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface EmptyStateCardProps {
  icon: LucideIcon
  title: string
  description: string
}

export function EmptyStateCard({
  icon: Icon,
  title,
  description,
}: EmptyStateCardProps) {
  return (
    <Card className="border-dashed border-slate-200/90 bg-white/72">
      <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center sm:px-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#eef4fb_100%)] text-slate-400 shadow-[0_18px_38px_-30px_rgba(15,23,42,0.22)]">
          <Icon className="h-7 w-7" />
        </div>
        <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-slate-950">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">{description}</p>
      </CardContent>
    </Card>
  )
}

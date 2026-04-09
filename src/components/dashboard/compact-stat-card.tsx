import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const toneStyles = {
  blue: "border-[#dce8fa] bg-[#f4f8fe] text-[#1b4d7e]",
  violet: "border-[#eadff8] bg-[#f8f4fe] text-[#65529d]",
  emerald: "border-[#dcebe5] bg-[#f4fbf7] text-[#2f6a58]",
  amber: "border-[#f3e5cf] bg-[#fff9ef] text-[#8d6831]",
  rose: "border-[#f2dfe4] bg-[#fff6f7] text-[#9a5361]",
  slate: "border-slate-200 bg-white/86 text-slate-700",
  cyan: "border-cyan-200/80 bg-cyan-50/80 text-cyan-700",
  indigo: "border-indigo-200/80 bg-indigo-50/80 text-indigo-700",
} as const

interface CompactStatCardProps {
  label: string
  value: string | number
  detail?: string
  tone?: keyof typeof toneStyles
}

export function CompactStatCard({
  label,
  value,
  detail,
  tone = "slate",
}: CompactStatCardProps) {
  return (
    <Card className={cn("overflow-hidden border shadow-[0_18px_44px_-34px_rgba(15,23,42,0.28)]", toneStyles[tone])}>
      <CardContent className="p-4 sm:p-5">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-current/55">{label}</p>
        <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950">{value}</p>
        {detail ? <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p> : null}
      </CardContent>
    </Card>
  )
}

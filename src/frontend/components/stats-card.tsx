import { Card, CardContent } from "@/components/ui/card"
import { type LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatsCard({ title, value, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground md:text-sm">{title}</p>
            <div className="mt-1 flex flex-wrap items-baseline gap-1 md:gap-2">
              <p className="text-lg font-bold text-foreground md:text-2xl">{value}</p>
              {trend && (
                <span
                  className={`text-xs font-medium ${
                    trend.isPositive ? "text-success" : "text-destructive"
                  }`}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              )}
            </div>
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 md:h-10 md:w-10">
            <Icon className="h-4 w-4 text-primary md:h-5 md:w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

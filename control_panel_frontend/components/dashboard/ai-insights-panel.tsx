"use client"

import type { Issue } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Brain, AlertTriangle, TrendingUp } from "lucide-react"

interface AIInsightsPanelProps {
  issues: Issue[]
}

export function AIInsightsPanel({ issues }: AIInsightsPanelProps) {
  const openIssues = issues.filter((i) => i.status !== "resolved")
  const criticalIssues = openIssues.filter((i) => i.riskLevel === "critical")
  const avgHealthScore = Math.round(
    openIssues.reduce((acc, i) => acc + i.healthScore, 0) / (openIssues.length || 1)
  )

  const topInsight = criticalIssues.length > 0
    ? `${criticalIssues.length} critical issues need immediate attention`
    : avgHealthScore < 50
      ? "Infrastructure health below threshold"
      : "All systems operating normally"

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
          <Brain className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-semibold text-card-foreground">AI Insight</h3>
          <p className={cn(
            "truncate text-[10px]",
            criticalIssues.length > 0 ? "text-destructive" : "text-muted-foreground"
          )}>
            {topInsight}
          </p>
        </div>
        {criticalIssues.length > 0 ? (
          <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
        ) : (
          <TrendingUp className="h-4 w-4 shrink-0 text-success" />
        )}
      </div>
    </div>
  )
}

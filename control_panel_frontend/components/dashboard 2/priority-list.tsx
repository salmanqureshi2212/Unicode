"use client"

import type { Issue } from "@/lib/types"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle2, Clock, User } from "lucide-react"

interface PriorityListProps {
  issues: Issue[]
  selectedIssue: Issue | null
  onSelectIssue: (issue: Issue) => void
}

function getRiskBadgeStyle(riskLevel: string) {
  switch (riskLevel) {
    case "critical":
      return "bg-destructive/20 text-destructive border-destructive/30"
    case "high":
      return "bg-warning/20 text-warning border-warning/30"
    case "medium":
      return "bg-primary/20 text-primary border-primary/30"
    case "low":
      return "bg-success/20 text-success border-success/30"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "open":
      return <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
    case "assigned":
      return <User className="h-3.5 w-3.5 text-primary" />
    case "in-progress":
      return <Clock className="h-3.5 w-3.5 text-warning" />
    case "resolved":
      return <CheckCircle2 className="h-3.5 w-3.5 text-success" />
    default:
      return null
  }
}

function getHealthBarColor(score: number) {
  if (score < 40) return "bg-destructive"
  if (score < 60) return "bg-warning"
  if (score < 75) return "bg-primary"
  return "bg-success"
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  return "Just now"
}

export function PriorityList({ issues, selectedIssue, onSelectIssue }: PriorityListProps) {
  // Sort issues by priority (critical first, then by health score)
  const sortedIssues = [...issues]
    .filter((i) => i.status !== "resolved")
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      const priorityDiff = priorityOrder[a.riskLevel] - priorityOrder[b.riskLevel]
      if (priorityDiff !== 0) return priorityDiff
      return a.healthScore - b.healthScore
    })

  return (
    <div className="flex h-full min-h-[280px] flex-col">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priority Queue</h3>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {sortedIssues.length}
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {sortedIssues.map((issue, index) => (
          <button
            key={issue.id}
            type="button"
            onClick={() => onSelectIssue(issue)}
            className={cn(
              "group w-full rounded-lg border border-border bg-card p-2.5 text-left transition-all duration-200",
              selectedIssue?.id === issue.id
                ? "border-primary bg-primary/5 ring-1 ring-primary/50 scale-[1.02]"
                : "hover:border-muted-foreground/30 hover:bg-secondary/50 hover:scale-[1.01]",
              issue.riskLevel === "critical" && selectedIssue?.id !== issue.id && "animate-pulse-ring"
            )}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "flex h-5 w-5 items-center justify-center rounded text-xs font-bold transition-colors",
                  selectedIssue?.id === issue.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground group-hover:bg-muted"
                )}>
                  {index + 1}
                </span>
                <h3 className={cn(
                  "line-clamp-1 text-sm font-medium transition-colors",
                  selectedIssue?.id === issue.id ? "text-primary" : "text-card-foreground"
                )}>{issue.title}</h3>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                  getRiskBadgeStyle(issue.riskLevel)
                )}
              >
                {issue.riskLevel}
              </span>
            </div>

            <p className="mb-2 text-xs text-muted-foreground">{issue.location}</p>

            <div className="mb-2 flex items-center gap-3">
              <div className="flex flex-1 items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn("h-full rounded-full transition-all", getHealthBarColor(issue.healthScore))}
                    style={{ width: `${issue.healthScore}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{issue.healthScore}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                {getStatusIcon(issue.status)}
                <span className="capitalize">{issue.status.replace("-", " ")}</span>
              </div>
              <span>{formatRelativeTime(issue.reportedAt)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

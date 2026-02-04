"use client"

import type { Issue } from "@/lib/types"
import { Activity, AlertTriangle, CheckCircle2, LayoutGrid, Map, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  issues: Issue[]
}

export function DashboardHeader({ issues }: DashboardHeaderProps) {
  const criticalCount = issues.filter((i) => i.riskLevel === "critical" && i.status !== "resolved").length
  const openCount = issues.filter((i) => i.status === "open").length
  const resolvedToday = issues.filter((i) => {
    const today = new Date()
    const reportedDate = new Date(i.reportedAt)
    return i.status === "resolved" && reportedDate.toDateString() === today.toDateString()
  }).length

  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Urban Control Room</h1>
            <p className="text-xs text-muted-foreground">Infrastructure Management Platform</p>
          </div>
        </div>

        {/* Nav Icons */}
        <nav className="flex items-center gap-1">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground"
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Map className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <AlertTriangle className="h-5 w-5" />
            {criticalCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {criticalCount}
              </span>
            )}
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Settings className="h-5 w-5" />
          </button>
        </nav>

        {/* Quick Stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={cn("h-2.5 w-2.5 rounded-full", criticalCount > 0 ? "bg-destructive animate-pulse" : "bg-success")} />
            <span className="text-sm text-muted-foreground">
              {criticalCount > 0 ? `${criticalCount} Critical` : "All Clear"}
            </span>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm text-foreground font-medium">{openCount}</span>
            <span className="text-sm text-muted-foreground">Open</span>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="text-sm text-foreground font-medium">{resolvedToday}</span>
            <span className="text-sm text-muted-foreground">Resolved Today</span>
          </div>
        </div>
      </div>
    </header>
  )
}

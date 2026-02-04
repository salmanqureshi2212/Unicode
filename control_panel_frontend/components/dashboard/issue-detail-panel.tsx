"use client"

import type { Issue, Employee } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertTriangle, CheckCircle2, Clock, MapPin, Sparkles, User, X } from "lucide-react"

interface IssueDetailPanelProps {
  issue: Issue | null
  employees: Employee[]
  onClose: () => void
  onAssign: (issueId: string, employeeId: string) => void
  onResolve: (issueId: string) => void
}

function getRiskBadgeStyle(riskLevel: string) {
  switch (riskLevel) {
    case "critical":
      return "bg-destructive text-destructive-foreground"
    case "high":
      return "bg-warning text-warning-foreground"
    case "medium":
      return "bg-primary text-primary-foreground"
    case "low":
      return "bg-success text-success-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getStatusConfig(status: string) {
  switch (status) {
    case "open":
      return { icon: AlertTriangle, label: "Open", color: "text-destructive" }
    case "assigned":
      return { icon: User, label: "Assigned", color: "text-primary" }
    case "in-progress":
      return { icon: Clock, label: "In Progress", color: "text-warning" }
    case "resolved":
      return { icon: CheckCircle2, label: "Resolved", color: "text-success" }
    default:
      return { icon: AlertTriangle, label: status, color: "text-muted-foreground" }
  }
}

function getHealthColor(score: number) {
  if (score < 40) return "text-destructive"
  if (score < 60) return "text-warning"
  if (score < 75) return "text-primary"
  return "text-success"
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function IssueDetailPanel({
  issue,
  employees,
  onClose,
  onAssign,
  onResolve,
}: IssueDetailPanelProps) {
  if (!issue) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-6">
        <div className="mb-4 rounded-full bg-secondary p-4">
          <MapPin className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-lg font-medium text-foreground">No Issue Selected</h3>
        <p className="text-center text-sm text-muted-foreground">
          Select an issue from the map or priority list to view details
        </p>
      </div>
    )
  }

  const statusConfig = getStatusConfig(issue.status)
  const StatusIcon = statusConfig.icon
  const assignedEmployee = employees.find((e) => e.id === issue.assignedTo)

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card animate-slide-in" key={issue.id}>
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border p-4">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">{issue.id}</span>
            <span
              className={cn(
                "rounded px-2 py-0.5 text-xs font-semibold uppercase",
                getRiskBadgeStyle(issue.riskLevel)
              )}
            >
              {issue.riskLevel}
            </span>
          </div>
          <h2 className="text-lg font-semibold text-card-foreground">{issue.title}</h2>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{issue.location}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Before Photo */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Issue Photo
          </h4>
          <div className="aspect-video overflow-hidden rounded-lg bg-secondary">
            {issue.imageUrl ? (
              <img
                src={`http://localhost:8080${issue.imageUrl}`}
                alt={issue.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
                <div className="text-center">
                  <div className="mb-2 text-4xl">
                    {issue.category === "road" ? "🛣️" : issue.category === "bridge" ? "🌉" : issue.category === "utility" ? "⚡" : "🏢"}
                  </div>
                  <span className="text-xs text-muted-foreground">No Image Available</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Health Score */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Health Score
          </h4>
          <div className="flex items-center gap-4">
            <div className={cn("text-4xl font-bold", getHealthColor(issue.healthScore))}>
              {issue.healthScore}%
            </div>
            <div className="flex-1">
              <div className="h-3 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    issue.healthScore < 40
                      ? "bg-destructive"
                      : issue.healthScore < 60
                        ? "bg-warning"
                        : issue.healthScore < 75
                          ? "bg-primary"
                          : "bg-success"
                  )}
                  style={{ width: `${issue.healthScore}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {issue.healthScore < 40
                  ? "Critical condition - immediate action required"
                  : issue.healthScore < 60
                    ? "Poor condition - prioritize repair"
                    : issue.healthScore < 75
                      ? "Fair condition - monitor closely"
                      : "Good condition - routine maintenance"}
              </p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Status
          </h4>
          <div className="flex items-center gap-2">
            <StatusIcon className={cn("h-5 w-5", statusConfig.color)} />
            <span className="font-medium text-foreground">{statusConfig.label}</span>
            {assignedEmployee && (
              <span className="text-sm text-muted-foreground">
                — {assignedEmployee.name}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Reported {formatDate(issue.reportedAt)}
          </p>
        </div>

        {/* AI Suggestion */}
        <div className="mb-4">
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI Suggestion
          </h4>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="text-sm leading-relaxed text-foreground">
              {(() => {
                try {
                  if (typeof issue.aiInsight === "string" && issue.aiInsight.startsWith("{")) {
                    const parsed = JSON.parse(issue.aiInsight)
                    return parsed.ai_suggestion || parsed.aiSuggestion || "No suggestion available"
                  }
                  return issue.aiInsight || "No AI suggestion available"
                } catch (e) {
                  return issue.aiInsight || "No AI suggestion available"
                }
              })()}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-border p-4">
        <div className="mb-3">
          <label htmlFor="assign-select" className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Assign to Employee
          </label>
          <Select
            value={issue.assignedTo || ""}
            onValueChange={(value) => onAssign(issue.id, value)}
          >
            <SelectTrigger id="assign-select" className="w-full">
              <SelectValue placeholder="Select employee..." />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                      {employee.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <span className="font-medium">{employee.name}</span>
                      <span className="ml-2 text-muted-foreground">— {employee.role}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => onAssign(issue.id, "")}
            disabled={!issue.assignedTo}
          >
            Unassign
          </Button>
          <Button
            className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
            onClick={() => onResolve(issue.id)}
            disabled={issue.status === "resolved"}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark Resolved
          </Button>
        </div>
      </div>
    </div>
  )
}

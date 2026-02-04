"use client"

import type { IssueCategory, Issue } from "@/lib/types"
import { cn } from "@/lib/utils"
import { CircleAlert, BrickWall, Droplets, Construction } from "lucide-react"

interface CategoryFilterProps {
  issues: Issue[]
  selectedCategory: IssueCategory | "all"
  onSelectCategory: (category: IssueCategory | "all") => void
}

const categories: { id: IssueCategory | "all"; label: string; icon: typeof CircleAlert }[] = [
  { id: "all", label: "All Issues", icon: CircleAlert },
  { id: "pothole", label: "Potholes", icon: CircleAlert },
  { id: "bridge", label: "Bridges", icon: BrickWall },
  { id: "water-leakage", label: "Water Leaks", icon: Droplets },
  { id: "infrastructure", label: "Infrastructure", icon: Construction },
]

export function CategoryFilter({ issues, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const getCategoryCount = (category: IssueCategory | "all") => {
    if (category === "all") return issues.filter((i) => i.status !== "resolved").length
    return issues.filter((i) => i.category === category && i.status !== "resolved").length
  }

  const getCriticalCount = (category: IssueCategory | "all") => {
    if (category === "all") return issues.filter((i) => i.riskLevel === "critical" && i.status !== "resolved").length
    return issues.filter((i) => i.category === category && i.riskLevel === "critical" && i.status !== "resolved").length
  }

  return (
    <div className="space-y-2">
      <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Categories
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon
          const count = getCategoryCount(cat.id)
          const criticalCount = getCriticalCount(cat.id)
          const isSelected = selectedCategory === cat.id

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={cn(
                "relative flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-muted-foreground/50 hover:bg-secondary/50"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className={cn(
                  "truncate text-xs font-medium",
                  isSelected ? "text-primary" : "text-card-foreground"
                )}>
                  {cat.label}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {count} active
                </p>
              </div>
              {criticalCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                  {criticalCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

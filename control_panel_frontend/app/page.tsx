"use client"

import { useState, useMemo, useEffect } from "react"
import type { Issue, IssueCategory, Employee } from "@/lib/types"
import { issues as initialIssues, jurisdictionZones } from "@/lib/mock-data"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { JurisdictionMap } from "@/components/dashboard/jurisdiction-map"
import { PriorityList } from "@/components/dashboard/priority-list"
import { IssueDetailPanel } from "@/components/dashboard/issue-detail-panel"
import { CategoryFilter } from "@/components/dashboard/category-filter"
import { AIInsightsPanel } from "@/components/dashboard/ai-insights-panel" // Import AIInsightsPanel

export default function ControlRoomDashboard() {
  const [issues, setIssues] = useState<Issue[]>(initialIssues)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | "all">("all")
  const [employees, setEmployees] = useState<Employee[]>([])

  // Filter issues by category
  const filteredIssues = useMemo(() => {
    if (selectedCategory === "all") return issues
    return issues.filter((issue) => issue.category === selectedCategory)
  }, [issues, selectedCategory])

  const handleSelectIssue = (issue: Issue) => {
    setSelectedIssue(issue)
  }

  const handleCloseDetail = () => {
    setSelectedIssue(null)
  }

  const handleSelectCategory = (category: IssueCategory | "all") => {
    setSelectedCategory(category)
    setSelectedIssue(null) // Clear selection when changing category
  }

  const handleAssign = (issueId: string, employeeId: string) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              assignedTo: employeeId || null,
              status: employeeId ? "assigned" : "open",
            }
          : issue
      )
    )
    if (selectedIssue?.id === issueId) {
      setSelectedIssue((prev) =>
        prev
          ? {
              ...prev,
              assignedTo: employeeId || null,
              status: employeeId ? "assigned" : "open",
            }
          : null
      )
    }
  }

  const handleResolve = (issueId: string) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              status: "resolved",
            }
          : issue
      )
    )
    if (selectedIssue?.id === issueId) {
      setSelectedIssue((prev) =>
        prev
          ? {
              ...prev,
              status: "resolved",
            }
          : null
      )
    }
  }

  // Fetch issues from backend on load and sort by priority descending
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/issues?sortBy=priority")
        if (!res.ok) return
        const data = await res.json()

        // Map backend issue shape to frontend Issue type
        const mapped: Issue[] = data.map((it: any) => {
          const riskRaw = it.aiAnalysis?.risk_level || it.aiAnalysis?.riskLevel || "Safe"
          const riskLevelMap: Record<string, string> = {
            Critical: "critical",
            critical: "critical",
            Warning: "high",
            warning: "high",
            Safe: "low",
            safe: "low",
          }

          const riskLevel = (riskLevelMap[riskRaw] as any) || "medium"

          const healthScore =
            it.aiAnalysis?.health_score || it.healthScore || Math.max(30, Math.min(90, it.priority || 50))

          return {
            id: it._id,
            title: it.title,
            location: it.address || it.location?.address || "",
            coordinates: { lat: it.location?.coordinates[1] || 0, lng: it.location?.coordinates[0] || 0 },
            healthScore: Number(healthScore),
            riskLevel: riskLevel as any,
            status: (it.status === "in_progress" ? "in-progress" : it.status) as any,
            assignedTo: it.assignedTo || null,
            aiInsight: it.aiAnalysis ? JSON.stringify(it.aiAnalysis) : "",
            reportedAt: it.createdAt || it.updatedAt,
            imageUrl: it.imageUrl || it.image || "",
            category: (it.category as any) || "infrastructure",
            // include priority so UI can use numeric ordering if desired
            priority: it.priority ?? 0,
          }
        })

        setIssues(mapped)
      } catch (err) {
        console.error("Failed to fetch issues:", err)
      }
    }

    fetchIssues()
  }, [])

  // Fetch employees from backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/employees")
        if (!res.ok) return
        const data = await res.json()

        const mapped: Employee[] = (data || []).map((e: any) => ({
          id: e._id || e.id,
          name: e.name || `${e.firstName || ''} ${e.lastName || ''}`.trim(),
          role: e.role || e.position || "",
        }))

        setEmployees(mapped)
      } catch (err) {
        console.error("Failed to fetch employees:", err)
      }
    }

    fetchEmployees()
  }, [])

  return (
    <div className="flex h-screen flex-col bg-background">
      <DashboardHeader issues={issues} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Priority List & Categories */}
        <aside className="flex w-72 shrink-0 flex-col gap-3 border-r border-border bg-card p-3">
          <div className="min-h-0 flex-1 overflow-hidden">
            <PriorityList
              issues={filteredIssues}
              selectedIssue={selectedIssue}
              onSelectIssue={handleSelectIssue}
            />
          </div>
          <CategoryFilter
            issues={issues}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />
        </aside>

        {/* Center - Map View (Larger) */}
        <main className="flex flex-1 flex-col p-3">
          <div className="flex-1">
            <JurisdictionMap
              zones={jurisdictionZones}
              issues={filteredIssues}
              selectedIssue={selectedIssue}
              onSelectIssue={handleSelectIssue}
            />
          </div>
        </main>

        {/* Right Panel - Issue Detail (Narrower) */}
        <aside className="w-80 shrink-0 border-l border-border bg-background p-3">
            <IssueDetailPanel
              issue={selectedIssue}
              employees={employees}
              onClose={handleCloseDetail}
              onAssign={handleAssign}
              onResolve={handleResolve}
            />
        </aside>
      </div>
    </div>
  )
}

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

  // Filter issues by category - exclude completed/resolved issues
  const filteredIssues = useMemo(() => {
    const active = issues.filter((issue) => issue.status !== "completed" && issue.status !== "resolved")
    if (selectedCategory === "all") return active
    return active.filter((issue) => issue.category === selectedCategory)
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

  const handleAssign = async (issueId: string, employeeId: string) => {
    try {
      if (employeeId) {
        // Call backend API to assign issue to employee
        const res = await fetch(`http://localhost:8080/api/employees/employee/assign/${employeeId}/${issueId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        })
        if (!res.ok) {
          const error = await res.json()
          console.error("Failed to assign employee:", error.message)
          return
        }

        const data = await res.json()
        console.log("Assignment successful:", data)

        // Update local state with response data
        const updatedIssue = data.issue
        setIssues((prev) =>
          prev.map((issue) =>
            issue.id === issueId
              ? {
                  ...issue,
                  assignedTo: updatedIssue.assignedTo?._id || employeeId,
                  status: "assigned" as const,
                }
              : issue
          )
        )
        if (selectedIssue?.id === issueId) {
          setSelectedIssue((prev) =>
            prev
              ? {
                  ...prev,
                  assignedTo: updatedIssue.assignedTo?._id || employeeId,
                  status: "assigned" as const,
                }
              : null
          )
        }
      } else {
        // Unassign
        if (selectedIssue?.assignedTo) {
          const res = await fetch(
            `http://localhost:8080/api/employees/employee/unassign/${selectedIssue.assignedTo}/${issueId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
            }
          )
          if (!res.ok) {
            console.error("Failed to unassign employee:", res.statusText)
            return
          }
        }

        setIssues((prev) =>
          prev.map((issue) =>
            issue.id === issueId
              ? {
                  ...issue,
                  assignedTo: null,
                  status: "open" as const,
                }
              : issue
          )
        )
        if (selectedIssue?.id === issueId) {
          setSelectedIssue((prev) =>
            prev
              ? {
                  ...prev,
                  assignedTo: null,
                  status: "open" as const,
                }
              : null
          )
        }
      }
    } catch (err) {
      console.error("Error assigning employee:", err)
    }
  }

  const handleResolve = async (issueId: string) => {
    try {
      const issue = issues.find((i) => i.id === issueId)
      if (!issue || !issue.assignedTo) {
        console.error("Issue not found or not assigned")
        return
      }

      // Call backend to mark issue as completed
      const res = await fetch(
        `http://localhost:8080/api/employees/employee/complete/${issue.assignedTo}/${issueId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      )
      if (!res.ok) {
        console.error("Failed to complete issue:", res.statusText)
        return
      }

      // Remove completed issue from list
      setIssues((prev) => prev.filter((i) => i.id !== issueId))

      // Close detail panel if this issue was selected
      if (selectedIssue?.id === issueId) {
        setSelectedIssue(null)
      }
    } catch (err) {
      console.error("Error completing issue:", err)
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
          // Get priority score from backend
          const priority = it.priority ?? 0

          // Calculate risk level based on priority score
          // Priority > 70 = Critical, > 60 = High, > 40 = Medium, > 20 = Low
          let riskLevel: "critical" | "high" | "medium" | "low"
          if (priority > 70) {
            riskLevel = "critical"
          } else if (priority > 60) {
            riskLevel = "high"
          } else if (priority > 40) {
            riskLevel = "medium"
          } else if (priority > 20) {
            riskLevel = "low"
          } else {
            riskLevel = "low"
          }

          // Health score: use AI analysis if available, otherwise use priority as base
          const healthScore =
            it.aiAnalysis?.health_score || 
            it.healthScore || 
            Math.max(20, Math.min(95, priority))

          return {
            id: it._id,
            title: it.title,
            location: it.address || it.location?.address || "",
            coordinates: { lat: it.location?.coordinates[1] || 0, lng: it.location?.coordinates[0] || 0 },
            healthScore: Number(healthScore),
            riskLevel,
            status: (it.status === "in_progress" ? "in-progress" : it.status) as any,
            assignedTo: it.assignedTo || null,
            aiInsight: it.aiAnalysis ? JSON.stringify(it.aiAnalysis) : "",
            reportedAt: it.createdAt || it.updatedAt,
            imageUrl: it.imageUrl || it.image || "",
            category: (it.category as any) || "infrastructure",
            priority,
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
          name: e.name || e.username || "Unknown",
          role: e.role || e.position || "",
        }))

        setEmployees(mapped)
      } catch (err) {
        console.error("Failed to fetch employees:", err)
      }
    }

    fetchEmployees()
  }, [])

  // Update jurisdiction zones dynamically based on active issues
  const updatedZones = useMemo(() => {
    return jurisdictionZones.map((zone) => {
      const zoneIssues = issues.filter(
        (issue) =>
          issue.status !== "resolved" &&
          issue.coordinates.lat >= Math.min(...zone.bounds.map((b) => b.lat)) &&
          issue.coordinates.lat <= Math.max(...zone.bounds.map((b) => b.lat)) &&
          issue.coordinates.lng >= Math.min(...zone.bounds.map((b) => b.lng)) &&
          issue.coordinates.lng <= Math.max(...zone.bounds.map((b) => b.lng))
      )
      const avgHealth =
        zoneIssues.length > 0
          ? Math.round(zoneIssues.reduce((sum, i) => sum + i.healthScore, 0) / zoneIssues.length)
          : 0
      return {
        ...zone,
        issueCount: zoneIssues.length,
        avgHealthScore: avgHealth,
      }
    })
  }, [issues])

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
              zones={updatedZones}
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

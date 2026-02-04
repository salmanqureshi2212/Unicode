export type RiskLevel = "critical" | "high" | "medium" | "low"
export type IssueStatus = "open" | "assigned" | "in-progress" | "resolved"

export type IssueCategory = "pothole" | "bridge" | "water-leakage" | "infrastructure"

export interface Issue {
  id: string
  title: string
  location: string
  coordinates: { lat: number; lng: number }
  healthScore: number
  riskLevel: RiskLevel
  status: IssueStatus
  assignedTo: string | null
  aiInsight: string
  reportedAt: string
  imageUrl: string
  category: IssueCategory
  priority?: number
}

export interface Employee {
  id: string
  name: string
  role: string
  avatar: string
}

export interface JurisdictionZone {
  id: string
  name: string
  bounds: { lat: number; lng: number }[]
  issueCount: number
  avgHealthScore: number
}

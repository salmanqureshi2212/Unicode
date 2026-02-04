"use client"

import { useEffect, useRef, useState } from "react"
import type { Issue, JurisdictionZone } from "@/lib/types"
import { cn } from "@/lib/utils"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface JurisdictionMapProps {
  zones: JurisdictionZone[]
  issues: Issue[]
  selectedIssue: Issue | null
  onSelectIssue: (issue: Issue) => void
}

function getRiskColor(riskLevel: string) {
  switch (riskLevel) {
    case "critical":
      return "#ef4444" // red
    case "high":
      return "#f97316" // orange
    case "medium":
      return "#eab308" // amber
    case "low":
      return "#22c55e" // green
    default:
      return "#6b7280" // gray
  }
}

function getZoneColor(score: number) {
  if (score < 40) return { stroke: "#ef4444", fill: "rgba(239, 68, 68, 0.15)" }
  if (score < 60) return { stroke: "#f97316", fill: "rgba(249, 115, 22, 0.15)" }
  if (score < 75) return { stroke: "#eab308", fill: "rgba(234, 179, 8, 0.15)" }
  return { stroke: "#22c55e", fill: "rgba(34, 197, 94, 0.15)" }
}

export function JurisdictionMap({ zones, issues, selectedIssue, onSelectIssue }: JurisdictionMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map())
  const labelMarkersRef = useRef<L.Marker[]>([])
  const [isMapReady, setIsMapReady] = useState(false)
  
  // Create a stable key for issues to detect changes
  const issuesKey = issues.map(i => i.id).sort().join(",")

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const initMap = async () => {
      // Mumbai center coordinates
      const center: [number, number] = [19.0760, 72.8377]

      // Constrain map to Greater Mumbai bounds (approximate)
      const mumbaiBounds = L.latLngBounds([18.83, 72.77], [19.35, 72.99])

      const map = L.map(mapRef.current!, {
        center,
        zoom: 12,
        minZoom: 11,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
        maxBounds: mumbaiBounds,
        maxBoundsViscosity: 1.0,
        worldCopyJump: false,
      })

      // Ensure bounds are enforced after init
      map.setMaxBounds(mumbaiBounds)

      // Add dark theme tile layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map)

      // Add zoom control to bottom right
      L.control.zoom({ position: "bottomright" }).addTo(map)

      // Draw jurisdiction zones
      // Highlight Greater Mumbai border
      const mumbaiBorder = L.rectangle(mumbaiBounds, {
        color: "#60a5fa",
        weight: 3,
        opacity: 0.95,
        fill: false,
        dashArray: "6,4",
      }).addTo(map)

      // Add subtle glow marker at top-left to label the city
      L.marker([19.18, 72.82], {
        icon: L.divIcon({
          className: "mumbai-label",
          html: `<div style="background: rgba(96,165,250,0.9); padding:6px 10px; border-radius:6px; color:#021124; font-weight:600; font-size:12px;">Mumbai</div>`,
          iconSize: [0, 0],
        }),
      }).addTo(map)

      for (const zone of zones) {
        const colors = getZoneColor(zone.avgHealthScore)
        const polygon = L.polygon(
          zone.bounds.map((b) => [b.lat, b.lng] as [number, number]),
          {
            color: colors.stroke,
            weight: 2,
            fillColor: colors.fill,
            fillOpacity: 0.3,
            dashArray: "5, 5",
          }
        ).addTo(map)

        // Add zone label
        const center = polygon.getBounds().getCenter()
        L.marker(center, {
          icon: L.divIcon({
            className: "zone-label",
            html: `<div style="
              background: rgba(24, 24, 27, 0.95);
              padding: 6px 10px;
              border-radius: 6px;
              border: 1px solid ${colors.stroke};
              color: white;
              font-size: 11px;
              font-weight: 500;
              white-space: nowrap;
              box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            ">
              <div style="font-weight: 600; margin-bottom: 2px;">${zone.name}</div>
              <div style="display: flex; align-items: center; gap: 6px; font-size: 10px; opacity: 0.8;">
                <span>${zone.issueCount} issues</span>
                <span style="color: ${colors.stroke};">${zone.avgHealthScore}%</span>
              </div>
            </div>`,
            iconSize: [0, 0],
          }),
        }).addTo(map)
      }

      // Add issue markers
      for (const issue of issues) {
        if (issue.status === "resolved") continue

        const color = getRiskColor(issue.riskLevel)
        const marker = L.circleMarker([issue.coordinates.lat, issue.coordinates.lng], {
          radius: issue.riskLevel === "critical" ? 14 : issue.riskLevel === "high" ? 12 : 10,
          fillColor: color,
          color: "white",
          weight: 2,
          fillOpacity: 0.9,
        }).addTo(map)

        // Add issue ID label
        const labelIcon = L.divIcon({
          className: "issue-marker-label",
          html: `<div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${issue.riskLevel === "critical" ? 28 : issue.riskLevel === "high" ? 24 : 20}px;
            height: ${issue.riskLevel === "critical" ? 28 : issue.riskLevel === "high" ? 24 : 20}px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            color: white;
            font-size: 9px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
            ${issue.riskLevel === "critical" ? "animation: pulse 2s infinite;" : ""}
          ">${issue.id.split("-")[1]}</div>`,
          iconSize: [0, 0],
          iconAnchor: [issue.riskLevel === "critical" ? 14 : issue.riskLevel === "high" ? 12 : 10, issue.riskLevel === "critical" ? 14 : issue.riskLevel === "high" ? 12 : 10],
        })

        const labelMarker = L.marker([issue.coordinates.lat, issue.coordinates.lng], {
          icon: labelIcon,
        }).addTo(map)

        // Click handlers
        marker.on("click", () => onSelectIssue(issue))
        labelMarker.on("click", () => onSelectIssue(issue))

        // Tooltip
        const tooltipContent = `
          <div style="min-width: 180px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${issue.title}</div>
            <div style="font-size: 11px; opacity: 0.8; margin-bottom: 6px;">${issue.location}</div>
            <div style="display: flex; gap: 12px; font-size: 11px;">
              <span>Health: <strong style="color: ${color};">${issue.healthScore}%</strong></span>
              <span style="text-transform: uppercase; font-weight: 600; color: ${color};">${issue.riskLevel}</span>
            </div>
          </div>
        `
        marker.bindTooltip(tooltipContent, {
          className: "custom-tooltip",
          direction: "top",
          offset: [0, -10],
        })
        labelMarker.bindTooltip(tooltipContent, {
          className: "custom-tooltip",
          direction: "top",
          offset: [0, -10],
        })

        markersRef.current.set(issue.id, marker)
      }

      mapInstanceRef.current = map
      setIsMapReady(true)

      // Add custom styles
      const style = document.createElement("style")
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .custom-tooltip {
          background: rgba(24, 24, 27, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 8px !important;
          padding: 10px 12px !important;
          color: white !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
        }
        .custom-tooltip::before {
          border-top-color: rgba(24, 24, 27, 0.95) !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3) !important;
        }
        .leaflet-control-zoom a {
          background: rgba(24, 24, 27, 0.95) !important;
          color: white !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(40, 40, 45, 0.95) !important;
        }
      `
      document.head.appendChild(style)
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [zones, issuesKey, onSelectIssue])

  // Handle selected issue changes - fly to and highlight
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return

    // Reset all markers to default style
    for (const [id, marker] of markersRef.current) {
      const issue = issues.find((i) => i.id === id)
      if (issue) {
        marker.setStyle({
          radius: issue.riskLevel === "critical" ? 14 : issue.riskLevel === "high" ? 12 : 10,
          weight: 2,
        })
      }
    }

    // Highlight selected marker and fly to it
    if (selectedIssue) {
      const marker = markersRef.current.get(selectedIssue.id)
      if (marker) {
        marker.setStyle({
          radius: 18,
          weight: 4,
        })
        marker.bringToFront()
      }

      mapInstanceRef.current.flyTo(
        [selectedIssue.coordinates.lat, selectedIssue.coordinates.lng],
        15,
        { duration: 0.5 }
      )
    }
  }, [selectedIssue, issues, isMapReady])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-border">
      <div ref={mapRef} className="h-full w-full" />
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border border-border bg-card/95 p-3 backdrop-blur-sm">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Risk Level</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-destructive" />
            <span className="text-xs text-card-foreground">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-orange-500" />
            <span className="text-xs text-card-foreground">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="text-xs text-card-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-xs text-card-foreground">Low</span>
          </div>
        </div>
      </div>

      {/* Selected Issue Quick Info */}
      {selectedIssue && (
        <div className="absolute right-4 top-4 z-[1000] w-72 rounded-lg border border-primary/30 bg-card/95 p-4 shadow-xl backdrop-blur-sm">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <span
                className={cn(
                  "mb-1 inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase text-white",
                  selectedIssue.riskLevel === "critical"
                    ? "bg-destructive"
                    : selectedIssue.riskLevel === "high"
                      ? "bg-orange-500"
                      : selectedIssue.riskLevel === "medium"
                        ? "bg-amber-500"
                        : "bg-green-500"
                )}
              >
                {selectedIssue.riskLevel}
              </span>
              <h4 className="font-semibold text-card-foreground">{selectedIssue.title}</h4>
              <p className="text-xs text-muted-foreground">{selectedIssue.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-t border-border pt-2">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  selectedIssue.healthScore < 40
                    ? "bg-destructive"
                    : selectedIssue.healthScore < 60
                      ? "bg-orange-500"
                      : selectedIssue.healthScore < 75
                        ? "bg-amber-500"
                        : "bg-green-500"
                )}
              />
              <span className="text-xs text-muted-foreground">
                Health: <strong className="text-foreground">{selectedIssue.healthScore}%</strong>
              </span>
            </div>
            <span className="text-xs capitalize text-muted-foreground">
              {selectedIssue.status.replace("-", " ")}
            </span>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Loading map...</span>
          </div>
        </div>
      )}
    </div>
  )
}
